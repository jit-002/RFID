const fs = require('fs');
let code = fs.readFileSync('src/services/quizQuestionsData.ts', 'utf8');

const target = `  subjectAllocation: {
    Physics: 10,
    Chemistry: 10,
    Mathematics: 10,
    'AI / Computer': 5,
    English: 10,
    'Physical Education': 5
  } as Record<QuizSubject, number>,
  status: 'ACTIVE' as const`;

const replacement = `  subjectAllocation: {
    Physics: 10,
    Chemistry: 10,
    Mathematics: 10,
    'AI / Computer': 5,
    English: 10,
    'Physical Education': 5
  } as Record<QuizSubject, number>,
  markingScheme: {
    marksPerCorrect: 4,
    negativeMarksPerWrong: 1,
    marksPerSkipped: 0
  },
  positiveMarks: 4,
  negativeMarks: 1,
  totalMarks: 200,
  status: 'ACTIVE' as const`;

if (!code.includes('marksPerCorrect: 4')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/services/quizQuestionsData.ts', code, 'utf8');
  console.log('Successfully updated OFFICIAL_WEEKLY_QUIZ_CONFIG with authoritative marking scheme');
} else {
  console.log('Already configured');
}
