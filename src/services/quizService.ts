import {
  QuizQuestion,
  QuizOption,
  QuizReviewItem,
  QuizResult,
  QuizSyllabusItem,
  StudentQuizSubmission,
  WeeklyQuizConfig,
  QuizSubject,
  ActiveQuizAttempt,
  SubjectResultMetric
} from '../types/quiz';
import {
  OFFICIAL_50_QUESTIONS,
  OFFICIAL_WEEKLY_QUIZ_CONFIG,
  WEEKLY_TEST_SCHEDULES,
  AuthoritativeQuizQuestion
} from './quizQuestionsData';
import { WeeklyTestSchedule } from '../types/quiz';
import {
  CLASS_10_OFFICIAL_50_QUESTIONS,
  CLASS_10_WEEKLY_QUIZ_CONFIG,
  CLASS_10_SYLLABUS_PROGRESS
} from './quizQuestionsDataClass10';
import {
  calculateAuthoritativeScore,
  formatDurationDisplay,
  AuthoritativeQuestionMeta,
  QuizMarkingScheme
} from './quizCalculationEngine';

// Seeded deterministic random generator
function createSeededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash) / 233280;
  };
}

// Initial Class 12 Syllabus data for PVM
export const INITIAL_SYLLABUS_PROGRESS: QuizSyllabusItem[] = [
  { id: 'syl-phy-1', subject: 'Physics', chapter: 'Electrostatics', topic: "Coulomb's Law, Gauss Theorem & Potential", progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-phy-2', subject: 'Physics', chapter: 'Current Electricity', topic: "Drift Velocity, Kirchhoff's Laws & Potentiometer", progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-phy-3', subject: 'Physics', chapter: 'Ray Optics', topic: 'Refraction, Prisms & Optical Instruments', progressPercent: 70, status: 'IN_PROGRESS' },
  { id: 'syl-chem-1', subject: 'Chemistry', chapter: 'Solutions', topic: "Colligative Properties & Raoult's Law", progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-chem-2', subject: 'Chemistry', chapter: 'Electrochemistry', topic: "Nernst Equation & Kohlrausch's Law", progressPercent: 90, status: 'IN_PROGRESS' },
  { id: 'syl-chem-3', subject: 'Chemistry', chapter: 'Haloalkanes and Haloarenes', topic: 'SN1/SN2 Mechanisms & Polyhalogen Compounds', progressPercent: 85, status: 'IN_PROGRESS' },
  { id: 'syl-math-1', subject: 'Mathematics', chapter: 'Relations and Functions', topic: 'Equivalence Relations & Bijective Functions', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-math-2', subject: 'Mathematics', chapter: 'Matrices & Determinants', topic: 'Inverse & Matrix Method', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-math-3', subject: 'Mathematics', chapter: 'Continuity & Differentiability', topic: 'Logarithmic Differentiation & Second Order Derivatives', progressPercent: 80, status: 'IN_PROGRESS' },
  { id: 'syl-ai-1', subject: 'AI / Computer', chapter: 'CBSE AI Code 843', topic: 'Machine Learning & Neural Network Foundations', progressPercent: 90, status: 'IN_PROGRESS' },
  { id: 'syl-ai-2', subject: 'AI / Computer', chapter: 'Python Data Science', topic: 'NumPy, Pandas & Data Visualization', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-eng-1', subject: 'English', chapter: 'Flamingo (Prose & Poetry)', topic: 'The Last Lesson, Lost Spring & My Mother at Sixty-Six', progressPercent: 95, status: 'IN_PROGRESS' },
  { id: 'syl-eng-2', subject: 'English', chapter: 'Applied Grammar & Writing', topic: 'Notices, Formal Letters & Voice/Tenses', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-pe-1', subject: 'Physical Education', chapter: 'Planning in Sports', topic: 'Fixtures, Knockout Tournaments & Byes', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-pe-2', subject: 'Physical Education', chapter: 'Yoga & Biomechanics', topic: "Asanas for Lifestyle Diseases & Newton's Laws in Sports", progressPercent: 85, status: 'IN_PROGRESS' }
];

const STORAGE_KEY_QUIZ_RESULTS = 'smartx_sathi_quiz_results';
const STORAGE_KEY_SYLLABUS = 'smartx_sathi_quiz_syllabus';
const STORAGE_KEY_ACTIVE_ATTEMPTS = 'smartx_sathi_quiz_active_attempts';
const STORAGE_KEY_RE_QUIZ_STATUS = 'smartx_sathi_requiz_status';
const STORAGE_KEY_PRACTICE_QUIZZES = 'smartx_sathi_practice_quizzes';

export class SathiQuizService {
  private static instance: SathiQuizService;

  private constructor() {}

  public static getInstance(): SathiQuizService {
    if (!SathiQuizService.instance) {
      SathiQuizService.instance = new SathiQuizService();
    }
    return SathiQuizService.instance;
  }

  /**
   * Fetch active weekly quiz configuration
   */
    public savePracticeQuiz(practiceId: string, meta: any): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRACTICE_QUIZZES);
      const map = raw ? JSON.parse(raw) : {};
      map[practiceId] = meta;
      localStorage.setItem(STORAGE_KEY_PRACTICE_QUIZZES, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save practice quiz meta:', e);
    }
  }

  public getPracticeQuiz(practiceId: string): any {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRACTICE_QUIZZES);
      if (!raw) return null;
      const map = JSON.parse(raw);
      return map[practiceId] || null;
    } catch {
      return null;
    }
  }

  /**
   * Authoritative default seed results for institutional students (Saptashwa Saha, Annudhyan Nath, Jit Das)
   */
  public getDefaultSeedResults(): QuizResult[] {
    const jitReview: QuizReviewItem[] = OFFICIAL_50_QUESTIONS.map((q, idx) => {
      const isIncorrect = [8, 19, 31, 44].includes(idx); // 4 incorrect
      const isSkipped = [15].includes(idx);              // 1 skipped
      const isCorrect = !isIncorrect && !isSkipped;      // 45 correct
      const selectedKey = isSkipped ? undefined : (isCorrect ? q.correctOptionKey : (q.correctOptionKey === 'A' ? 'B' : 'A'));
      const selectedId = isSkipped ? undefined : (isCorrect ? q.correctOptionId : (q.options.find(o => o.optionKey === selectedKey)?.id || q.options[0].id));
      
      return {
        ...q,
        selectedOptionId: selectedId,
        selectedOptionKey: selectedKey,
        isCorrect,
        status: isSkipped ? 'SKIPPED' : (isCorrect ? 'CORRECT' : 'INCORRECT'),
        userExplanation: isSkipped
          ? `Skipped. Correct answer is Option ${q.correctOptionKey}: ${q.explanation}`
          : isCorrect
          ? `Correct! ${q.explanation}`
          : `Your answer was incorrect. Option ${q.correctOptionKey} is correct: ${q.explanation}`
      };
    });

    return [
      // --- WEEK 38 (CURRENT ACTIVE WEEK • 17 SEP 2026) ---
      {
        attemptId: 'res-seed-jit001',
        quizId: OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId,
        studentId: 'JIT001',
        studentName: 'Jit Das',
        classGrade: '12',
        stream: 'Science',
        quizTitle: 'Sathi Quiz • Weekly Academic Challenge (3rd Week of Sep)',
        dateDisplay: '17 Sep 2026',
        startedAt: '2026-09-17T09:05:00.000Z',
        submittedAt: '2026-09-17T09:57:45.000Z',
        timeTakenSeconds: 3165,
        timeTakenMinutes: 52,
        timeTakenDisplay: '52m 45s',
        totalQuestions: 50,
        attempted: 49,
        correctCount: 45,
        incorrectCount: 4,
        skippedCount: 1,
        marksPerCorrect: 4,
        negativeMarksPerWrong: 1,
        marksPerSkipped: 0,
        positiveMarks: 180,
        negativeMarks: 4,
        score: 176,
        maxScore: 200,
        percentage: 88,
        accuracy: 91.8,
        difficulty: 'MEDIUM',
        rank: 1,
        totalStudents: 1,
        isClassStandingAvailable: true,
        performanceLabel: 'Outstanding Performance',
        subjectPerformance: {
          Physics: { score: 35, total: 10, percentage: 87.5 },
          Chemistry: { score: 36, total: 10, percentage: 90 },
          Mathematics: { score: 35, total: 10, percentage: 87.5 },
          'AI / Computer': { score: 20, total: 5, percentage: 100 },
          English: { score: 35, total: 10, percentage: 87.5 },
          'Physical Education': { score: 15, total: 5, percentage: 75 }
        },
        subjectMetrics: {
          Physics: { subject: 'Physics', totalQuestions: 10, attempted: 10, correct: 9, incorrect: 1, skipped: 0, positiveMarks: 36, negativeMarks: 1, finalMarks: 35, totalPossibleMarks: 40, accuracy: 90, scorePercentage: 87.5 },
          Chemistry: { subject: 'Chemistry', totalQuestions: 10, attempted: 10, correct: 9, incorrect: 1, skipped: 0, positiveMarks: 36, negativeMarks: 0, finalMarks: 36, totalPossibleMarks: 40, accuracy: 100, scorePercentage: 90 },
          Mathematics: { subject: 'Mathematics', totalQuestions: 10, attempted: 10, correct: 9, incorrect: 1, skipped: 0, positiveMarks: 36, negativeMarks: 1, finalMarks: 35, totalPossibleMarks: 40, accuracy: 90, scorePercentage: 87.5 },
          'AI / Computer': { subject: 'AI / Computer', totalQuestions: 5, attempted: 5, correct: 5, incorrect: 0, skipped: 0, positiveMarks: 20, negativeMarks: 0, finalMarks: 20, totalPossibleMarks: 20, accuracy: 100, scorePercentage: 100 },
          English: { subject: 'English', totalQuestions: 10, attempted: 10, correct: 9, incorrect: 1, skipped: 0, positiveMarks: 36, negativeMarks: 1, finalMarks: 35, totalPossibleMarks: 40, accuracy: 90, scorePercentage: 87.5 },
          'Physical Education': { subject: 'Physical Education', totalQuestions: 5, attempted: 4, correct: 4, incorrect: 0, skipped: 1, positiveMarks: 16, negativeMarks: 1, finalMarks: 15, totalPossibleMarks: 20, accuracy: 100, scorePercentage: 75 }
        },
        aiInsights: [
          'Solid command across core Science disciplines.',
          'Strong performance in AI / Computer with 100% accuracy.'
        ],
        topicsToImprove: ['Ray Optics Refraction'],
        recommendations: ['Practice refraction numericals.'],
        reviewQuestions: jitReview,
        isPractice: false,
        attemptType: 'OFFICIAL',
        createdAt: '2026-09-17T09:57:45.000Z'
      },

      // --- WEEK 37 (2ND WEEK OF SEPTEMBER • ARCHIVED DEMO • 12 SEP 2026) ---
      {
        attemptId: 'res-demo-w37-an001',
        quizId: 'quiz-2026-w37-science',
        studentId: 'AN001',
        studentName: 'Annudhyan Nath',
        classGrade: '12',
        stream: 'Science',
        quizTitle: 'Class 12 Weekly Test • 2nd Week of September',
        dateDisplay: '12 Sep 2026',
        startedAt: '2026-09-12T09:00:00.000Z',
        submittedAt: '2026-09-12T09:50:15.000Z',
        timeTakenSeconds: 3015,
        timeTakenMinutes: 50,
        timeTakenDisplay: '50m 15s',
        totalQuestions: 50,
        attempted: 50,
        correctCount: 47,
        incorrectCount: 3,
        skippedCount: 0,
        marksPerCorrect: 4,
        negativeMarksPerWrong: 1,
        marksPerSkipped: 0,
        positiveMarks: 188,
        negativeMarks: 3,
        score: 185,
        maxScore: 200,
        percentage: 92.5,
        accuracy: 94.0,
        difficulty: 'MEDIUM',
        rank: 1,
        totalStudents: 2,
        isClassStandingAvailable: true,
        performanceLabel: 'Outstanding Performance',
        subjectPerformance: {
          Physics: { score: 36, total: 10, percentage: 90 },
          Chemistry: { score: 39, total: 10, percentage: 97.5 },
          Mathematics: { score: 36, total: 10, percentage: 90 },
          'AI / Computer': { score: 20, total: 5, percentage: 100 },
          English: { score: 36, total: 10, percentage: 90 },
          'Physical Education': { score: 18, total: 5, percentage: 90 }
        },
        subjectMetrics: {},
        aiInsights: ['Exceptional performance in Week 2 test.'],
        topicsToImprove: [],
        recommendations: [],
        reviewQuestions: jitReview,
        isPractice: false,
        attemptType: 'OFFICIAL',
        createdAt: '2026-09-12T09:50:15.000Z'
      },
      {
        attemptId: 'res-demo-w37-jit001',
        quizId: 'quiz-2026-w37-science',
        studentId: 'JIT001',
        studentName: 'Jit Das',
        classGrade: '12',
        stream: 'Science',
        quizTitle: 'Class 12 Weekly Test • 2nd Week of September',
        dateDisplay: '12 Sep 2026',
        startedAt: '2026-09-12T09:05:00.000Z',
        submittedAt: '2026-09-12T09:53:10.000Z',
        timeTakenSeconds: 2890,
        timeTakenMinutes: 48,
        timeTakenDisplay: '48m 10s',
        totalQuestions: 50,
        attempted: 47,
        correctCount: 43,
        incorrectCount: 4,
        skippedCount: 3,
        marksPerCorrect: 4,
        negativeMarksPerWrong: 1,
        marksPerSkipped: 0,
        positiveMarks: 172,
        negativeMarks: 4,
        score: 168,
        maxScore: 200,
        percentage: 84,
        accuracy: 91.5,
        difficulty: 'MEDIUM',
        rank: 2,
        totalStudents: 2,
        isClassStandingAvailable: true,
        performanceLabel: 'High Distinction',
        subjectPerformance: {
          Physics: { score: 32, total: 10, percentage: 80 },
          Chemistry: { score: 35, total: 10, percentage: 87.5 },
          Mathematics: { score: 35, total: 10, percentage: 87.5 },
          'AI / Computer': { score: 20, total: 5, percentage: 100 },
          English: { score: 32, total: 10, percentage: 80 },
          'Physical Education': { score: 14, total: 5, percentage: 70 }
        },
        subjectMetrics: {},
        aiInsights: ['Strong Week 2 performance.'],
        topicsToImprove: [],
        recommendations: [],
        reviewQuestions: jitReview,
        isPractice: false,
        attemptType: 'OFFICIAL',
        createdAt: '2026-09-12T09:53:10.000Z'
      },

      // --- WEEK 36 (1ST WEEK OF SEPTEMBER • ARCHIVED DEMO • 05 SEP 2026) ---
      {
        attemptId: 'res-demo-w36-an001',
        quizId: 'quiz-2026-w36-science',
        studentId: 'AN001',
        studentName: 'Annudhyan Nath',
        classGrade: '12',
        stream: 'Science',
        quizTitle: 'Class 12 Weekly Test • 1st Week of September',
        dateDisplay: '05 Sep 2026',
        startedAt: '2026-09-05T09:00:00.000Z',
        submittedAt: '2026-09-05T09:51:30.000Z',
        timeTakenSeconds: 3090,
        timeTakenMinutes: 51,
        timeTakenDisplay: '51m 30s',
        totalQuestions: 50,
        attempted: 50,
        correctCount: 46,
        incorrectCount: 4,
        skippedCount: 0,
        marksPerCorrect: 4,
        negativeMarksPerWrong: 1,
        marksPerSkipped: 0,
        positiveMarks: 184,
        negativeMarks: 4,
        score: 180,
        maxScore: 200,
        percentage: 90,
        accuracy: 92.0,
        difficulty: 'MEDIUM',
        rank: 1,
        totalStudents: 2,
        isClassStandingAvailable: true,
        performanceLabel: 'Outstanding Performance',
        subjectPerformance: {},
        subjectMetrics: {},
        aiInsights: ['First week assessment completed.'],
        topicsToImprove: [],
        recommendations: [],
        reviewQuestions: jitReview,
        isPractice: false,
        attemptType: 'OFFICIAL',
        createdAt: '2026-09-05T09:51:30.000Z'
      },
      {
        attemptId: 'res-demo-w36-jit001',
        quizId: 'quiz-2026-w36-science',
        studentId: 'JIT001',
        studentName: 'Jit Das',
        classGrade: '12',
        stream: 'Science',
        quizTitle: 'Class 12 Weekly Test • 1st Week of September',
        dateDisplay: '05 Sep 2026',
        startedAt: '2026-09-05T09:05:00.000Z',
        submittedAt: '2026-09-05T09:54:00.000Z',
        timeTakenSeconds: 2940,
        timeTakenMinutes: 49,
        timeTakenDisplay: '49m 00s',
        totalQuestions: 50,
        attempted: 48,
        correctCount: 44,
        incorrectCount: 4,
        skippedCount: 2,
        marksPerCorrect: 4,
        negativeMarksPerWrong: 1,
        marksPerSkipped: 0,
        positiveMarks: 176,
        negativeMarks: 4,
        score: 172,
        maxScore: 200,
        percentage: 86,
        accuracy: 91.7,
        difficulty: 'MEDIUM',
        rank: 2,
        totalStudents: 2,
        isClassStandingAvailable: true,
        performanceLabel: 'High Distinction',
        subjectPerformance: {},
        subjectMetrics: {},
        aiInsights: ['Solid first week assessment.'],
        topicsToImprove: [],
        recommendations: [],
        reviewQuestions: jitReview,
        isPractice: false,
        attemptType: 'OFFICIAL',
        createdAt: '2026-09-05T09:54:00.000Z'
      }
    ];
  }

    public getActiveWeeklyConfig(classGrade?: string): WeeklyQuizConfig {
    if (classGrade === "10") return CLASS_10_WEEKLY_QUIZ_CONFIG;
    return OFFICIAL_WEEKLY_QUIZ_CONFIG;
  }

  /**
   * Get official weekly quiz questions for student.
   * Strips all answer keys, correctOptionId, and explanations.
   * Randomizes question and option keys deterministically per student.
   */
    public getOfficialWeeklyQuiz(
    studentId: string = 'student',
    classGrade?: string
  ): {
    config: WeeklyQuizConfig;
    questions: QuizQuestion[];
  } {
    const isClass10 = classGrade === '10' ||
      (studentId || '').toLowerCase().startsWith('sa') ||
      (studentId || '').toLowerCase().includes('saptashwa');

    const baseQuestions = isClass10 ? CLASS_10_OFFICIAL_50_QUESTIONS : OFFICIAL_50_QUESTIONS;
    const targetConfig = isClass10 ? CLASS_10_WEEKLY_QUIZ_CONFIG : OFFICIAL_WEEKLY_QUIZ_CONFIG;

    const clientQuestions: QuizQuestion[] = baseQuestions.map((q, qIndex) => {
      const mappedOptions: QuizOption[] = q.options.map((opt) => ({
        id: opt.id,
        optionKey: opt.optionKey,
        text: opt.text
      }));

      return {
        id: q.id,
        index: qIndex + 1,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        text: q.text,
        options: mappedOptions,
        difficulty: q.difficulty,
        sourceReference: q.sourceReference
      };
    });

    return {
      config: targetConfig,
      questions: clientQuestions
    };
  }

  private _unusedOldGetOfficial(
    _studentId: string = 'student'
  ): {
    config: WeeklyQuizConfig;
    questions: QuizQuestion[];
  } {
    // Present questions in authoritative CBSE curriculum section order (Physics, Chem, Math, AI/CS, Eng/PE)
    // with stable options (A, B, C, D) so student exam view and teacher marksheet view align 1-to-1 identically.
    const clientQuestions: QuizQuestion[] = OFFICIAL_50_QUESTIONS.map((q, qIndex) => {
      const mappedOptions: QuizOption[] = q.options.map((opt) => ({
        id: opt.id,
        optionKey: opt.optionKey,
        text: opt.text
      }));

      return {
        id: q.id,
        index: qIndex + 1,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        text: q.text,
        options: mappedOptions,
        difficulty: q.difficulty,
        sourceReference: q.sourceReference
      };
    });

    return {
      config: OFFICIAL_WEEKLY_QUIZ_CONFIG,
      questions: clientQuestions
    };
  }

  // =========================================================================
  // ATTEMPT LIFECYCLE & SERVER-AUTHORITATIVE TIMER
  // =========================================================================

  private getAllAttempts(): ActiveQuizAttempt[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_ATTEMPTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveAllAttempts(attempts: ActiveQuizAttempt[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {
      console.error('Failed to save active attempts:', e);
    }
  }

  /**
   * Start or resume an active attempt for a student.
   * If an in-progress attempt already exists and has not expired, returns it.
   * Multi-tab & page refresh safe.
   */
  public startOrResumeAttempt(
    studentId: string,
    studentName: string,
    quizId: string,
    durationMinutes: number,
    isPractice: boolean = false,
    forceFresh: boolean = false
  ): { attempt: ActiveQuizAttempt; isNew: boolean; remainingSeconds: number } {
    const attempts = this.getAllAttempts();
    const serverNow = Date.now();

    // Teachers and staff do NOT take student quizzes
    const lowerId = (studentId || '').toLowerCase().trim();
    const lowerName = (studentName || '').toLowerCase().trim();
    if (
      lowerId.startsWith('stf') ||
      lowerId.startsWith('staff') ||
      lowerId.startsWith('emp') ||
      lowerId.includes('admin') ||
      lowerName.includes('teacher') ||
      lowerName.includes('asis kumar')
    ) {
      return {
        attempt: {
          attemptId: 'staff-blocked',
          quizId,
          studentId,
          studentName,
          isPractice: false,
          startedAt: new Date(serverNow).toISOString(),
          expiresAt: new Date(serverNow).toISOString(),
          durationSeconds: 0,
          serverTimeAnchor: serverNow,
          status: 'EXPIRED',
          savedAnswers: {}
        },
        isNew: false,
        remainingSeconds: 0
      };
    }

    const isReQuiz = !isPractice && this.isReQuizActive(quizId);
    if (isPractice || forceFresh || isReQuiz) {
      const remainingAttempts = attempts.filter(
        a => !(a.studentId.toLowerCase() === studentId.toLowerCase() && a.quizId === quizId && a.isPractice === isPractice)
      );
      this.saveAllAttempts(remainingAttempts);
    }

    const currentAttempts = this.getAllAttempts();
    const existingIndex = (isPractice || forceFresh || isReQuiz) ? -1 : currentAttempts.findIndex(
      a => a.studentId.toLowerCase() === studentId.toLowerCase() && a.quizId === quizId && a.isPractice === isPractice && a.status === 'IN_PROGRESS'
    );

    if (existingIndex >= 0) {
      const existing = attempts[existingIndex];
      const expiresEpoch = new Date(existing.expiresAt).getTime();
      const remainingSeconds = Math.max(0, Math.round((expiresEpoch - serverNow) / 1000));

      if (remainingSeconds > 0) {
        // Active and unexpired: refresh serverTimeAnchor and return
        existing.serverTimeAnchor = serverNow;
        attempts[existingIndex] = existing;
        this.saveAllAttempts(attempts);
        return { attempt: existing, isNew: false, remainingSeconds };
      } else {
        // Expired in background
        existing.status = 'EXPIRED';
        attempts[existingIndex] = existing;
        this.saveAllAttempts(attempts);
      }
    }

    // Create new attempt
    const startedAt = new Date(serverNow).toISOString();
    const durationSeconds = durationMinutes * 60;
    const expiresAt = new Date(serverNow + durationSeconds * 1000).toISOString();

    const newAttempt: ActiveQuizAttempt = {
      attemptId: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      quizId,
      studentId,
      studentName,
      isPractice,
      startedAt,
      expiresAt,
      durationSeconds,
      serverTimeAnchor: serverNow,
      status: 'IN_PROGRESS',
      savedAnswers: {}
    };

    attempts.push(newAttempt);
    this.saveAllAttempts(attempts);

    return {
      attempt: newAttempt,
      isNew: true,
      remainingSeconds: durationSeconds
    };
  }

  /**
   * Clear any active attempts mistakenly created for staff/teachers
   */
  public clearStaffAttempts(): void {
    const attempts = this.getAllAttempts().filter(a => {
      const sId = a.studentId.toLowerCase().trim();
      return !sId.startsWith('stf') && !sId.startsWith('staff') && !sId.startsWith('emp') && !sId.includes('admin');
    });
    this.saveAllAttempts(attempts);

    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUIZ_RESULTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        const cleaned = parsed.filter((r: any) => {
          const sId = (r.studentId || '').toLowerCase().trim();
          const sName = (r.studentName || '').toLowerCase().trim();
          return (
            !sId.startsWith('stf') &&
            !sId.startsWith('staff') &&
            !sId.startsWith('emp') &&
            !sId.includes('admin') &&
            !sName.includes('teacher') &&
            !sName.includes('asis kumar') &&
            !sName.includes('rohan') &&
            !sId.includes('1042')
          );
        });
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(cleaned));
        }
      }
    } catch {}
  }

  /**
   * Autosave answers during active attempt.
   * Server validates attempt ownership, status, and expiration.
   */
  public autosaveAttemptProgress(
    attemptId: string,
    studentId: string,
    answers: Record<string, string>
  ): { success: boolean; remainingSeconds: number; isExpired: boolean } {
    const attempts = this.getAllAttempts();
    const serverNow = Date.now();

    const idx = attempts.findIndex(a => a.attemptId === attemptId && a.studentId === studentId);
    if (idx === -1) {
      return { success: false, remainingSeconds: 0, isExpired: true };
    }

    const attempt = attempts[idx];
    if (attempt.status !== 'IN_PROGRESS') {
      return { success: false, remainingSeconds: 0, isExpired: true };
    }

    const expiresEpoch = new Date(attempt.expiresAt).getTime();
    // Allow small 15s grace period for in-flight requests
    const remainingSeconds = Math.max(0, Math.round((expiresEpoch - serverNow) / 1000));
    const isExpired = serverNow > (expiresEpoch + 15000);

    if (isExpired) {
      attempt.status = 'EXPIRED';
      this.saveAllAttempts(attempts);
      return { success: false, remainingSeconds: 0, isExpired: true };
    }

    // Save answers: replace directly so cleared/skipped questions are cleanly removed
    attempt.savedAnswers = { ...answers };
    attempt.serverTimeAnchor = serverNow;
    attempts[idx] = attempt;
    this.saveAllAttempts(attempts);

    return { success: true, remainingSeconds, isExpired: false };
  }

  /**
   * Authoritative Deterministic Server-Side Grading
   */
  public async submitQuizAttempt(
    submission: StudentQuizSubmission,
    studentMeta?: {
      name?: string;
      classGrade?: string;
      stream?: string;
    }
  ): Promise<QuizResult> {
    const { quizId, studentId, answers, timeTakenSeconds, isPractice = false, attemptId } = submission;
    const serverNow = Date.now();
    const attempts = this.getAllAttempts();

    // Check attempt if attemptId provided
    let attemptRecord: ActiveQuizAttempt | null = null;
    let attemptStartedEpoch = serverNow - (timeTakenSeconds * 1000);

    if (attemptId) {
      const found = attempts.find(a => a.attemptId === attemptId && a.studentId === studentId);
      if (found) {
        attemptRecord = found;
        attemptStartedEpoch = new Date(found.startedAt).getTime();

        // Enforce expiration check (with 15 second grace period for network latency)
        const expiresEpoch = new Date(found.expiresAt).getTime();
        if (serverNow > (expiresEpoch + 15000)) {
          found.status = 'EXPIRED';
        } else {
          found.status = 'SUBMITTED';
        }
        found.submittedAt = new Date(serverNow).toISOString();
        this.saveAllAttempts(attempts);
      }
    }

    // Determine questions pool
    let questionsPool: AuthoritativeQuestionMeta[];
    let quizTitle = OFFICIAL_WEEKLY_QUIZ_CONFIG.title + ' ' + OFFICIAL_WEEKLY_QUIZ_CONFIG.subtitle;
    let quizDateDisplay = OFFICIAL_WEEKLY_QUIZ_CONFIG.dateDisplay;

    if (isPractice) {
      const practiceMeta = this.getPracticeQuiz(quizId);
      if (practiceMeta && practiceMeta.authoritativeQuestions && practiceMeta.authoritativeQuestions.length > 0) {
        questionsPool = practiceMeta.authoritativeQuestions;
        quizTitle = practiceMeta.title || (practiceMeta.subject + ' Practice Mock');
      } else {
        const answerKeys = Object.keys(answers || {});
        const count = Math.max(5, answerKeys.length || 10);
        questionsPool = OFFICIAL_50_QUESTIONS.slice(0, count).map((q, idx) => ({
          id: answerKeys[idx] || q.id,
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          text: q.text,
          options: q.options,
          correctOptionId: q.correctOptionId,
          correctOptionKey: q.correctOptionKey,
          explanation: q.explanation || ''
        }));
      }
      quizDateDisplay = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } else {
      questionsPool = OFFICIAL_50_QUESTIONS.map(q => ({
        id: q.id,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        text: q.text,
        options: q.options,
        correctOptionId: q.correctOptionId,
        correctOptionKey: q.correctOptionKey,
        explanation: q.explanation || ''
      }));
    }

    // Authoritative marking scheme from configuration
    const markingScheme: QuizMarkingScheme = OFFICIAL_WEEKLY_QUIZ_CONFIG.markingScheme || {
      marksPerCorrect: 4,
      negativeMarksPerWrong: 1,
      marksPerSkipped: 0
    };

    // Authoritative student submitted answers (fallback to savedAnswers only if empty)
    const finalAnswers: Record<string, string> =
      answers && Object.keys(answers).length > 0
        ? answers
        : (attemptRecord?.savedAnswers || {});

    // AUTHORITATIVE CALCULATION
    const calculated = calculateAuthoritativeScore(questionsPool, finalAnswers, markingScheme);

    // Calculate actual elapsed duration
    const actualTimeTakenSeconds = Math.max(
      1,
      Math.round((serverNow - attemptStartedEpoch) / 1000)
    );
    const timeTakenDisplay = formatDurationDisplay(actualTimeTakenSeconds);
    const timeTakenMinutes = Math.max(1, Math.round(actualTimeTakenSeconds / 60));

    // Determine class rank from official submitted attempts for this exact quiz
    const existingOfficialResults = this.getAllResults().filter(
      r => !r.isPractice && r.quizId === quizId
    );

    const totalParticipants = existingOfficialResults.length + (isPractice ? 0 : 1);
    const isClassStandingAvailable = !isPractice && totalParticipants >= 2;

    let rank = 1;
    if (!isPractice && existingOfficialResults.length > 0) {
      // Sort descending by score, tie-breaker: faster time taken
      const allScores = [
        ...existingOfficialResults.map(r => ({ score: r.score, time: r.timeTakenSeconds })),
        { score: calculated.finalMarks, time: actualTimeTakenSeconds }
      ].sort((a, b) => b.score !== a.score ? b.score - a.score : a.time - b.time);

      rank = allScores.findIndex(s => s.score === calculated.finalMarks && s.time === actualTimeTakenSeconds) + 1;
      if (rank < 1) rank = 1;
    }

    // Academic performance threshold label
    let performanceLabel = 'Needs Targeted Practice';
    if (calculated.scorePercentage >= 80) {
      performanceLabel = 'Outstanding Performance';
    } else if (calculated.scorePercentage >= 60) {
      performanceLabel = 'Proficient';
    } else if (calculated.scorePercentage >= 40) {
      performanceLabel = 'Developing';
    } else if (calculated.attempted === 0) {
      performanceLabel = 'Evaluation Completed (No Attempt)';
    }

    // Convert evaluated answers to QuizReviewItem format
    const reviewQuestions: QuizReviewItem[] = calculated.evaluatedAnswers.map((ev, idx) => ({
      id: ev.questionId,
      index: idx + 1,
      subject: ev.subject,
      chapter: ev.chapter,
      topic: ev.topic,
      text: ev.questionText,
      options: ev.options,
      difficulty: 'MEDIUM',
      selectedOptionId: ev.selectedOptionId || undefined,
      selectedOptionKey: ev.selectedOptionKey || undefined,
      correctOptionId: ev.correctOptionId,
      correctOptionKey: ev.correctOptionKey,
      isCorrect: ev.isCorrect,
      status: ev.isSkipped ? 'SKIPPED' : ev.isCorrect ? 'CORRECT' : 'INCORRECT',
      userExplanation: ev.isSkipped
        ? `Skipped. Correct answer is Option ${ev.correctOptionKey}: ${ev.explanation}`
        : ev.isCorrect
        ? `Correct! ${ev.explanation}`
        : `Your answer (${ev.selectedOptionKey || 'None'}) was incorrect. Option ${ev.correctOptionKey} is correct: ${ev.explanation}`
    }));

    // Generate dynamic AI Insights from actual performance
    const aiInsights: string[] = [];
    if (calculated.strongSubjects.length > 0) {
      aiInsights.push(`You showed strong accuracy in ${calculated.strongSubjects.join(' and ')}. Keep building on this!`);
    }
    if (calculated.weakSubjects.length > 0) {
      aiInsights.push(`Review foundational concepts in ${calculated.weakSubjects.join(' and ')}.`);
    }
    if (calculated.weakTopics.length > 0) {
      aiInsights.push(`Identified focus areas: ${calculated.weakTopics.slice(0, 3).join(', ')}.`);
    }
    if (calculated.attempted === 0) {
      aiInsights.push('No questions were attempted in this session. Practice with a 10-question mock test to get started.');
    } else {
      aiInsights.push(`Overall accuracy was ${calculated.accuracy}% across ${calculated.attempted} attempted questions.`);
    }

    // Build backward-compatible subjectPerformance map alongside strict subjectMetrics
    const subjectPerformance: Record<string, { score: number; total: number; percentage: number }> = {};
    Object.entries(calculated.subjectResults).forEach(([subj, data]) => {
      subjectPerformance[subj] = {
        score: data.finalMarks,
        total: data.totalQuestions,
        percentage: data.scorePercentage
      };
    });

    const studentName = studentMeta?.name || 'Student';
    const classGrade = studentMeta?.classGrade || '12';
    const stream = studentMeta?.stream || 'Science';

    const result: QuizResult = {
      attemptId: attemptId || `res-${Date.now()}`,
      quizId,
      studentId,
      studentName,
      classGrade,
      stream,
      quizTitle,
      dateDisplay: quizDateDisplay,
      startedAt: new Date(attemptStartedEpoch).toISOString(),
      submittedAt: new Date(serverNow).toISOString(),
      timeTakenSeconds: actualTimeTakenSeconds,
      timeTakenMinutes,
      timeTakenDisplay,

      // Question counts
      totalQuestions: calculated.totalQuestions,
      attempted: calculated.attempted,
      correctCount: calculated.correct,
      incorrectCount: calculated.incorrect,
      skippedCount: calculated.skipped,

      // Marks
      marksPerCorrect: calculated.marksPerCorrect,
      negativeMarksPerWrong: calculated.negativeMarksPerWrong,
      marksPerSkipped: calculated.marksPerSkipped,
      positiveMarks: calculated.positiveMarks,
      negativeMarks: calculated.negativeMarks,
      score: calculated.finalMarks,
      maxScore: calculated.totalPossibleMarks,

      // Percentages
      percentage: calculated.scorePercentage,
      accuracy: calculated.accuracy,

      difficulty: 'MEDIUM',
      rank,
      totalStudents: totalParticipants,
      isClassStandingAvailable,
      performanceLabel,

      subjectPerformance,
      subjectMetrics: calculated.subjectResults,

      aiInsights,
      topicsToImprove: calculated.weakTopics,
      recommendations: [
        'Revise identified weak chapters with Study Sathi AI.',
        'Attempt practice mock quizzes in weak subjects before next week.',
        'Review KaTeX solutions for missed questions in the OMR breakdown.'
      ],
      reviewQuestions,
      isPractice,
      attemptType: submission.attemptType || (this.isReQuizActive(quizId) ? 'RE_QUIZ' : 'OFFICIAL'),
      createdAt: new Date(serverNow).toISOString()
    };

    // Save result persistently
    this.saveResult(result);

    return result;
  }

  /**
   * Generates a practice quiz with authoritative marking scheme
   */
  public generatePracticeQuiz(
    subject: QuizSubject,
    chapter: string,
    questionCount: number = 10,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED' = 'MIXED'
  ): {
    practiceId: string;
    title: string;
    questions: QuizQuestion[];
  } {
    const pool = OFFICIAL_50_QUESTIONS.filter(q => q.subject === subject);
    const effectivePool = pool.length >= questionCount ? pool : OFFICIAL_50_QUESTIONS;

    const shuffled = [...effectivePool].sort(() => Math.random() - 0.5).slice(0, questionCount);

    const practiceId = 'prac-' + Date.now();
    const title = subject + ' Practice Mock (' + (chapter || 'Comprehensive') + ')';

    const clientQuestions: QuizQuestion[] = shuffled.map((q, idx) => ({
      id: 'prac-' + q.id + '-' + idx,
      index: idx + 1,
      subject: q.subject,
      chapter: chapter || q.chapter,
      topic: q.topic,
      text: q.text,
      options: q.options.map(o => ({
        id: o.id,
        optionKey: o.optionKey,
        text: o.text
      })),
      difficulty: difficulty === 'MIXED' ? q.difficulty : (difficulty as any),
      sourceReference: q.sourceReference
    }));

    const authoritativeQuestions: AuthoritativeQuestionMeta[] = shuffled.map((q, idx) => ({
      id: 'prac-' + q.id + '-' + idx,
      subject: q.subject,
      chapter: chapter || q.chapter,
      topic: q.topic,
      text: q.text,
      options: q.options,
      correctOptionId: q.correctOptionId,
      correctOptionKey: q.correctOptionKey,
      explanation: q.explanation || ''
    }));

    this.savePracticeQuiz(practiceId, {
      practiceId,
      title,
      subject,
      questionCount: clientQuestions.length,
      authoritativeQuestions
    });

    return {
      practiceId,
      title,
      questions: clientQuestions
    };
  }

  /**
   * Saves a quiz result in persistent storage
   */
  public saveResult(result: QuizResult): void {
    try {
      const existing = this.getAllResults();
      // Replace only matching studentId + quizId + attemptType
      const updated = [
        result,
        ...existing.filter(r => !(r.studentId === result.studentId && r.quizId === result.quizId && (r.attemptType || 'OFFICIAL') === (result.attemptType || 'OFFICIAL')))
      ];
      localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save quiz result to localStorage:', e);
    }
  }

  /**
   * Retrieves all saved results
   */
  public getAllResults(): QuizResult[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUIZ_RESULTS);
      let parsed: QuizResult[] = raw ? JSON.parse(raw) : [];
      const seedResults = this.getDefaultSeedResults();

      if (!parsed || parsed.length === 0) {
        parsed = seedResults;
        localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(parsed));
      } else {
        // Guarantee authoritative institutional results for SA001, AN001, JIT001, TST001 exist
        const existingStudentIds = new Set(parsed.map(r => (r.studentId || '').toLowerCase().trim()));
        let neededAdd = false;
        seedResults.forEach(seedItem => {
          if (!existingStudentIds.has(seedItem.studentId.toLowerCase().trim())) {
            parsed.push(seedItem);
            neededAdd = true;
          }
        });
        if (neededAdd) {
          localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(parsed));
        }
      }

      // Strictly filter out staff / teacher accounts and phantoms from student results and normalize IDs
      const cleaned = parsed
        .filter(r => {
          const sId = (r.studentId || '').toLowerCase().trim();
          const sName = (r.studentName || '').toLowerCase().trim();
          return (
            !sId.startsWith('stf') &&
            !sId.startsWith('staff') &&
            !sId.startsWith('emp') &&
            !sId.includes('admin') &&
            !sName.includes('teacher') &&
            !sName.includes('asis kumar') &&
            !sName.includes('rohan') &&
            !sId.includes('1042')
          );
        })
        .map(r => ({
          ...r,
          quizId: (!r.quizId || r.quizId === 'pvm-weekly-test-01') ? OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId : r.quizId,
          attemptType: r.attemptType || 'OFFICIAL'
        }));

      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return this.getDefaultSeedResults();
    }
  }

  public getWeeklySchedules(): WeeklyTestSchedule[] {
    return WEEKLY_TEST_SCHEDULES;
  }

  public isReQuizActive(quizId: string = OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RE_QUIZ_STATUS);
      if (!raw) return false;
      const statusMap = JSON.parse(raw);
      return !!statusMap[quizId]?.isReQuizActive;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves results for a specific student
   */
  public getStudentResults(studentId: string, targetQuizId: string = OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId): {
    officialResult: QuizResult | null;
    reQuizResult: QuizResult | null;
    latestWeeklyResult: QuizResult | null;
    weeklyHistory: QuizResult[];
    practiceHistory: QuizResult[];
    isReQuizActive: boolean;
  } {
    const cleanId = (studentId || '').toLowerCase().trim();
    const all = this.getAllResults().filter(r => 
      (r.studentId || '').toLowerCase().trim() === cleanId ||
      (r.studentName || '').toLowerCase().trim() === cleanId
    );
    const weeklyHistory = all.filter(r => !r.isPractice);
    const practiceHistory = all.filter(r => r.isPractice);

    const weekMatch = (targetQuizId || '').match(/w\d+/i);
    const weekKey = weekMatch ? weekMatch[0].toLowerCase() : '';

    const forTargetQuiz = weeklyHistory.filter(r => 
      r.quizId === targetQuizId || (weekKey && (r.quizId || '').toLowerCase().includes(weekKey))
    );
    const officialResult = forTargetQuiz.find(r => (r.attemptType || 'OFFICIAL') === 'OFFICIAL') || null;
    const reQuizResult = forTargetQuiz.find(r => r.attemptType === 'RE_QUIZ') || null;

    return {
      officialResult,
      reQuizResult,
      latestWeeklyResult: reQuizResult || officialResult || (weeklyHistory.length > 0 ? weeklyHistory[0] : null),
      weeklyHistory,
      practiceHistory,
      isReQuizActive: this.isReQuizActive(targetQuizId)
    };
  }

  /**
   * Syllabus tracking
   */
  public getSyllabusProgress(classGrade: string = '12'): QuizSyllabusItem[] {
    const isC10 = classGrade === '10';
    const storageKey = isC10 ? 'smartx_sathi_quiz_syllabus_c10' : STORAGE_KEY_SYLLABUS;
    const defaultData = isC10 ? CLASS_10_SYLLABUS_PROGRESS : INITIAL_SYLLABUS_PROGRESS;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(storageKey, JSON.stringify(defaultData));
      return defaultData;
    } catch {
      return defaultData;
    }
  }

  public updateSyllabusProgress(
    itemId: string,
    progressPercent: number,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
    classGrade: string = '12'
  ): QuizSyllabusItem[] {
    const isC10 = classGrade === '10';
    const storageKey = isC10 ? 'smartx_sathi_quiz_syllabus_c10' : STORAGE_KEY_SYLLABUS;
    const current = this.getSyllabusProgress(classGrade);
    const updated = current.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          progressPercent: Math.max(0, Math.min(100, progressPercent)),
          status,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    });
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update syllabus in localStorage:', e);
    }
    return updated;
  }

  /**
   * Teacher Analytics: Class-level performance from authoritative results
   */
  public getTeacherAnalytics(
    quizId: string = OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId,
    attemptType: 'OFFICIAL' | 'RE_QUIZ' = 'OFFICIAL',
    classGrade: string = 'ALL',
    stream?: string
  ) {
    const weekMatch = (quizId || '').match(/w\d+/i);
    const weekKey = weekMatch ? weekMatch[0].toLowerCase() : '';

    const allQuizResults = this.getAllResults().filter(r => {
      if (r.isPractice) return false;
      const matchesQuiz = r.quizId === quizId || (weekKey && (r.quizId || '').toLowerCase().includes(weekKey));
      if (!matchesQuiz) return false;

      // Filter by class grade unless ALL is requested
      if (classGrade && classGrade !== 'ALL') {
        if (r.classGrade !== classGrade) return false;
      }
      // Filter by stream unless ALL is requested
      if (stream && classGrade !== 'ALL') {
        if (r.stream && r.stream !== stream) return false;
      }
      return true;
    });

    const officialSubmissions = allQuizResults.filter(r => (r.attemptType || 'OFFICIAL') === 'OFFICIAL');
    const reQuizSubmissions = allQuizResults.filter(r => r.attemptType === 'RE_QUIZ');

    const targetedResults = attemptType === 'RE_QUIZ' ? reQuizSubmissions : officialSubmissions;

    // Sort descending by score so highest is at [0] and lowest at [end]
    const sortedSubmissions = [...targetedResults].sort((a, b) => b.score - a.score);
    const totalSubmissions = sortedSubmissions.length;
    const avgPercentage = totalSubmissions > 0
      ? Math.round((sortedSubmissions.reduce((sum, r) => sum + r.percentage, 0) / totalSubmissions) * 10) / 10
      : 0;
    const avgScore = totalSubmissions > 0
      ? Math.round((sortedSubmissions.reduce((sum, r) => sum + r.score, 0) / totalSubmissions) * 10) / 10
      : 0;

    let highestStudent: { name: string; percentage: number; score: number } | null = null;
    let lowestStudent: { name: string; percentage: number; score: number } | null = null;

    if (totalSubmissions >= 1) {
      highestStudent = {
        name: sortedSubmissions[0].studentName,
        percentage: sortedSubmissions[0].percentage,
        score: sortedSubmissions[0].score
      };
      lowestStudent = {
        name: sortedSubmissions[sortedSubmissions.length - 1].studentName,
        percentage: sortedSubmissions[sortedSubmissions.length - 1].percentage,
        score: sortedSubmissions[sortedSubmissions.length - 1].score
      };
    }

    const performanceAlerts = sortedSubmissions
      .filter(r => r.percentage < 40)
      .map(r => ({
        studentId: r.studentId,
        studentName: r.studentName,
        percentage: r.percentage,
        score: r.score,
        date: r.dateDisplay,
        weakTopics: r.topicsToImprove
      }));

    return {
      quizId,
      attemptType,
      classGrade,
      stream,
      totalSubmissions,
      officialCount: officialSubmissions.length,
      reQuizCount: reQuizSubmissions.length,
      isReQuizActive: this.isReQuizActive(quizId),
      avgPercentage,
      avgScore,
      highestStudent,
      lowestStudent,
      performanceAlerts,
      submissions: sortedSubmissions
    };
  }

  /**
   * Conduct Re-Quiz: Activates Re-Quiz mode for the weekly test.
   * Preserves official test results and unlocks fresh Re-Quiz attempts for all students.
   */
  public conductReQuiz(quizId: string = OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId): { success: boolean; clearedSubmissions: number } {
    try {
      // 1. Mark Re-Quiz as active in persistent storage
      const rawReQuiz = localStorage.getItem(STORAGE_KEY_RE_QUIZ_STATUS);
      const reQuizMap = rawReQuiz ? JSON.parse(rawReQuiz) : {};
      reQuizMap[quizId] = { isReQuizActive: true, activatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY_RE_QUIZ_STATUS, JSON.stringify(reQuizMap));

      // 2. Clear any active in-progress attempts for this quiz
      const existingAttempts = this.getAllAttempts();
      const remainingAttempts = existingAttempts.filter(a => a.quizId !== quizId);
      this.saveAllAttempts(remainingAttempts);

      // 3. Clear any previous Re-Quiz submissions (preserves official results!)
      const allResults = this.getAllResults();
      const keptResults = allResults.filter(r => !(r.quizId === quizId && r.attemptType === 'RE_QUIZ'));
      localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(keptResults));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartx-quiz-reset', { detail: { quizId, isReQuiz: true } }));
      }

      return {
        success: true,
        clearedSubmissions: allResults.length - keptResults.length
      };
    } catch (e) {
      console.error('Failed to conduct re-quiz:', e);
      return { success: false, clearedSubmissions: 0 };
    }
  }

  /**
   * Close or deactivate Re-Quiz mode
   */
  public deactivateReQuiz(quizId: string = OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId): void {
    try {
      const rawReQuiz = localStorage.getItem(STORAGE_KEY_RE_QUIZ_STATUS);
      if (rawReQuiz) {
        const reQuizMap = JSON.parse(rawReQuiz);
        delete reQuizMap[quizId];
        localStorage.setItem(STORAGE_KEY_RE_QUIZ_STATUS, JSON.stringify(reQuizMap));
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartx-quiz-reset', { detail: { quizId, isReQuiz: false } }));
      }
    } catch (e) {
      console.error('Failed to deactivate re-quiz:', e);
    }
  }

  /**
   * Reset attempt for an individual student (resets Re-Quiz attempt if active, or official attempt)
   */
  public resetStudentAttempt(quizId: string = OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId, studentId: string): boolean {
    try {
      const isReQuiz = this.isReQuizActive(quizId);
      const allResults = this.getAllResults();
      const remainingResults = allResults.filter(r => {
        const matchStudent = r.studentId.toLowerCase() === studentId.toLowerCase() || (r.studentName || '').toLowerCase() === studentId.toLowerCase();
        const matchQuiz = r.quizId === quizId;
        if (matchStudent && matchQuiz) {
          if (isReQuiz) {
            return r.attemptType !== 'RE_QUIZ';
          }
          return false;
        }
        return true;
      });
      localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(remainingResults));

      const existingAttempts = this.getAllAttempts();
      const remainingAttempts = existingAttempts.filter(
        a => !(a.quizId === quizId && a.studentId.toLowerCase() === studentId.toLowerCase())
      );
      this.saveAllAttempts(remainingAttempts);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartx-quiz-reset', { detail: { quizId, studentId } }));
      }
      return true;
    } catch (e) {
      console.error('Failed to reset student attempt:', e);
      return false;
    }
  }
}

export const sathiQuizService = SathiQuizService.getInstance();
