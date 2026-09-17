import { QuizSubject, QuizOption } from '../types/quiz';

export interface QuizMarkingScheme {
  marksPerCorrect: number;
  negativeMarksPerWrong: number;
  marksPerSkipped: number;
}

export interface AuthoritativeQuestionMeta {
  id: string;
  subject: QuizSubject;
  chapter: string;
  topic: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  correctOptionKey: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface EvaluatedAnswer {
  questionId: string;
  subject: QuizSubject;
  chapter: string;
  topic: string;
  questionText: string;
  options: QuizOption[];
  selectedOptionId: string | null;
  selectedOptionKey: 'A' | 'B' | 'C' | 'D' | null;
  correctOptionId: string;
  correctOptionKey: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  isSkipped: boolean;
  marksAwarded: number;
  explanation: string;
}

export interface SubjectResultMetric {
  subject: QuizSubject;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  positiveMarks: number;
  negativeMarks: number;
  finalMarks: number;
  totalPossibleMarks: number;
  accuracy: number;        // (correct / attempted) * 100 (or 0 if attempted === 0)
  scorePercentage: number; // (finalMarks / totalPossibleMarks) * 100
}

export interface AuthoritativeScoringResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;

  marksPerCorrect: number;
  negativeMarksPerWrong: number;
  marksPerSkipped: number;

  positiveMarks: number;
  negativeMarks: number;
  finalMarks: number;
  totalPossibleMarks: number;

  accuracy: number;        // (correct / attempted) * 100
  scorePercentage: number; // (finalMarks / totalPossibleMarks) * 100

  subjectResults: Record<string, SubjectResultMetric>;
  evaluatedAnswers: EvaluatedAnswer[];
  weakTopics: string[];
  strongSubjects: string[];
  weakSubjects: string[];
}

/**
 * Format duration human-readably with accurate singular/plural and "Less than 1 minute"
 */
export function formatDurationDisplay(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  if (safeSeconds < 60) {
    return 'Less than 1 minute';
  }
  const minutes = Math.round(safeSeconds / 60);
  if (minutes <= 1) {
    return '1 Minute';
  }
  return `${minutes} Minutes`;
}

/**
 * Authoritative deterministic calculation function.
 * Mathematically reconciles:
 * 1. correct + incorrect + skipped === totalQuestions
 * 2. attempted === correct + incorrect
 * 3. positiveMarks === correct * marksPerCorrect
 * 4. negativeMarks === incorrect * negativeMarksPerWrong
 * 5. finalMarks === positiveMarks - negativeMarks
 * 6. accuracy === attempted > 0 ? (correct / attempted) * 100 : 0
 * 7. scorePercentage === (finalMarks / totalPossibleMarks) * 100
 */
export function calculateAuthoritativeScore(
  questionsPool: AuthoritativeQuestionMeta[],
  submittedAnswers: Record<string, string>,
  markingScheme: QuizMarkingScheme
): AuthoritativeScoringResult {
  const { marksPerCorrect, negativeMarksPerWrong, marksPerSkipped } = markingScheme;

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  // Initialize subject accumulators
  const subjectBuckets: Record<string, {
    totalQuestions: number;
    attempted: number;
    correct: number;
    incorrect: number;
    skipped: number;
    positiveMarks: number;
    negativeMarks: number;
  }> = {};

  const evaluatedAnswers: EvaluatedAnswer[] = [];
  const weakTopicsSet = new Set<string>();

  for (const q of questionsPool) {
    const subject = q.subject;
    if (!subjectBuckets[subject]) {
      subjectBuckets[subject] = {
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        positiveMarks: 0,
        negativeMarks: 0
      };
    }
    subjectBuckets[subject].totalQuestions += 1;

    const studentChosenId = submittedAnswers[q.id] || null;
    const chosenOpt = q.options.find(o => o.id === studentChosenId) || null;
    const correctOpt = q.options.find(o => o.id === q.correctOptionId) || q.options[0];

    let isCorrect = false;
    let isSkipped = false;
    let marksAwarded = 0;

    if (!studentChosenId || studentChosenId === 'SKIPPED' || studentChosenId.trim() === '' || !chosenOpt) {
      // Skipped: Student did not choose an option or cleared their answer
      isSkipped = true;
      skippedCount += 1;
      subjectBuckets[subject].skipped += 1;
      marksAwarded = marksPerSkipped; // 0
    } else if (studentChosenId === q.correctOptionId) {
      // Correct
      isCorrect = true;
      correctCount += 1;
      subjectBuckets[subject].attempted += 1;
      subjectBuckets[subject].correct += 1;
      subjectBuckets[subject].positiveMarks += marksPerCorrect;
      marksAwarded = marksPerCorrect;
    } else {
      // Incorrect
      incorrectCount += 1;
      subjectBuckets[subject].attempted += 1;
      subjectBuckets[subject].incorrect += 1;
      subjectBuckets[subject].negativeMarks += negativeMarksPerWrong;
      marksAwarded = -negativeMarksPerWrong;
      if (q.topic) weakTopicsSet.add(q.topic);
      else if (q.chapter) weakTopicsSet.add(q.chapter);
    }

    evaluatedAnswers.push({
      questionId: q.id,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      questionText: q.text,
      options: q.options,
      selectedOptionId: isSkipped ? null : studentChosenId,
      selectedOptionKey: (isSkipped || !chosenOpt) ? null : chosenOpt.optionKey,
      correctOptionId: q.correctOptionId,
      correctOptionKey: q.correctOptionKey,
      isCorrect,
      isSkipped,
      marksAwarded,
      explanation: q.explanation || ''
    });
  }

  const totalQuestions = questionsPool.length;
  const attempted = correctCount + incorrectCount;
  const positiveMarks = correctCount * marksPerCorrect;
  const negativeMarks = incorrectCount * negativeMarksPerWrong;
  const finalMarks = positiveMarks - negativeMarks;
  const totalPossibleMarks = totalQuestions * marksPerCorrect;

  // Accuracy: correct / attempted * 100 (never includes skipped questions)
  const accuracy = attempted > 0
    ? Math.round((correctCount / attempted) * 1000) / 10
    : 0;

  // Score percentage: finalMarks / totalPossibleMarks * 100
  const scorePercentage = totalPossibleMarks > 0
    ? Math.round((finalMarks / totalPossibleMarks) * 1000) / 10
    : 0;

  // Process subject results independently
  const subjectResults: Record<string, SubjectResultMetric> = {};
  const strongSubjects: string[] = [];
  const weakSubjects: string[] = [];

  for (const [subj, b] of Object.entries(subjectBuckets)) {
    const subFinalMarks = b.positiveMarks - b.negativeMarks;
    const subTotalPossible = b.totalQuestions * marksPerCorrect;
    const subAccuracy = b.attempted > 0
      ? Math.round((b.correct / b.attempted) * 1000) / 10
      : 0;
    const subScorePct = subTotalPossible > 0
      ? Math.round((subFinalMarks / subTotalPossible) * 1000) / 10
      : 0;

    subjectResults[subj] = {
      subject: subj as QuizSubject,
      totalQuestions: b.totalQuestions,
      attempted: b.attempted,
      correct: b.correct,
      incorrect: b.incorrect,
      skipped: b.skipped,
      positiveMarks: b.positiveMarks,
      negativeMarks: b.negativeMarks,
      finalMarks: subFinalMarks,
      totalPossibleMarks: subTotalPossible,
      accuracy: subAccuracy,
      scorePercentage: subScorePct
    };

    if (subAccuracy >= 75) {
      strongSubjects.push(subj);
    } else if (b.attempted > 0 && subAccuracy < 50) {
      weakSubjects.push(subj);
    }
  }

  return {
    totalQuestions,
    attempted,
    correct: correctCount,
    incorrect: incorrectCount,
    skipped: skippedCount,
    marksPerCorrect,
    negativeMarksPerWrong,
    marksPerSkipped,
    positiveMarks,
    negativeMarks,
    finalMarks,
    totalPossibleMarks,
    accuracy,
    scorePercentage,
    subjectResults,
    evaluatedAnswers,
    weakTopics: Array.from(weakTopicsSet),
    strongSubjects,
    weakSubjects
  };
}
