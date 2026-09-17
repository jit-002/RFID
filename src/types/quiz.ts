export type QuizSubject =
  | 'Physics'
  | 'Chemistry'
  | 'Mathematics'
  | 'AI / Computer'
  | 'English'
  | 'Physical Education';

export interface QuizMarkingScheme {
  marksPerCorrect: number;
  negativeMarksPerWrong: number;
  marksPerSkipped: number;
}

export interface QuizOption {
  id: string;
  optionKey: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  index: number;
  subject: QuizSubject;
  chapter: string;
  topic: string;
  text: string;
  options: QuizOption[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sourceReference?: string;
  explanation?: string;
}

export interface QuizReviewItem extends QuizQuestion {
  selectedOptionKey?: string;
  selectedOptionId?: string;
  correctOptionKey: string;
  correctOptionId: string;
  isCorrect: boolean;
  status: 'CORRECT' | 'INCORRECT' | 'SKIPPED';
  userExplanation?: string;
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
  accuracy: number;        // (correct / attempted) * 100
  scorePercentage: number; // (finalMarks / totalPossibleMarks) * 100
}

// Backward compatibility alias for subject breakdown
export interface SubjectBreakdown {
  subject: QuizSubject;
  score: number;
  total: number;
  percentage: number;
}

export interface QuizResult {
  attemptId: string;
  quizId: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  stream: string;
  quizTitle: string;
  dateDisplay: string;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  timeTakenMinutes: number;
  timeTakenDisplay: string;

  // Authoritative Core Question Counts
  totalQuestions: number;
  attempted: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;

  // Authoritative Marks
  marksPerCorrect: number;
  negativeMarksPerWrong: number;
  marksPerSkipped: number;
  positiveMarks: number;
  negativeMarks: number;
  score: number;            // Final marks = positiveMarks - negativeMarks
  maxScore: number;         // Total possible marks = totalQuestions * marksPerCorrect

  // Distinct Percentages
  percentage: number;       // Score percentage = (score / maxScore) * 100
  accuracy: number;         // Accuracy = (correctCount / attempted) * 100

  difficulty: string;
  rank: number;
  totalStudents: number;
  isClassStandingAvailable: boolean;
  performanceLabel: string;

  // Subject-wise independent calculations
  subjectPerformance: Record<string, { score: number; total: number; percentage: number }>;
  subjectMetrics: Record<string, SubjectResultMetric>;

  aiInsights: string[];
  topicsToImprove: string[];
  recommendations: string[];
  reviewQuestions?: QuizReviewItem[];
  isPractice: boolean;
  attemptType?: 'OFFICIAL' | 'RE_QUIZ';
  createdAt: string;
}

export interface QuizSyllabusItem {
  id: string;
  subject: QuizSubject;
  chapter: string;
  topic: string;
  progressPercent: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastUpdated?: string;
}

export interface WeeklyQuizConfig {
  quizId: string;
  weekId: string;
  title: string;
  subtitle: string;
  classGrade: string;
  stream: string;
  dateDisplay: string;
  totalQuestions: number;
  durationMinutes: number;
  subjectAllocation: Record<QuizSubject, number>;
  markingScheme: QuizMarkingScheme;
  positiveMarks: number;
  negativeMarks: number;
  totalMarks: number;
  status: 'ACTIVE' | 'SUBMITTED' | 'CLOSED';
}

export interface ActiveQuizAttempt {
  attemptId: string;
  quizId: string;
  studentId: string;
  studentName: string;
  isPractice: boolean;
  startedAt: string;          // ISO String
  expiresAt: string;          // ISO String
  durationSeconds: number;
  serverTimeAnchor: number;   // Server epoch ms when created/synced
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  savedAnswers: Record<string, string>; // questionId -> selectedOptionId
  attemptType?: 'OFFICIAL' | 'RE_QUIZ';
  submittedAt?: string;
  resultId?: string;
}

export interface StudentQuizSubmission {
  quizId: string;
  studentId: string;
  attemptId?: string;
  answers: Record<string, string>; // questionId -> optionId
  timeTakenSeconds: number;
  isPractice?: boolean;
  attemptType?: 'OFFICIAL' | 'RE_QUIZ';
}

export interface WeeklyTestSchedule {
  quizId: string;
  weekId: string;
  weekLabel: string;
  shortLabel: string;
  dateDisplay: string;
  dateRange: string;
  title: string;
  subtitle: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'UPCOMING';
  isCurrentWeek: boolean;
}
