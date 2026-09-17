import { AuthoritativeQuizQuestion } from './quizQuestionsData';
import { WeeklyQuizConfig, QuizSyllabusItem } from '../types/quiz';

export const CLASS_10_WEEKLY_QUIZ_CONFIG: WeeklyQuizConfig = {
  quizId: 'quiz-2026-w38-class10',
  weekId: 'WEEK-2026-W38-C10',
    title: 'Sathi Quiz • Class 10',
  subtitle: 'CBSE Class 10 Academic Challenge (3rd Week of Sep)',
  classGrade: '10',
  stream: 'General',
  dateDisplay: '17 Sep 2026',
  totalQuestions: 50,
  durationMinutes: 60,
  subjectAllocation: {
    Physics: 10,
    Chemistry: 10,
    Mathematics: 10,
    'AI / Computer': 5,
    English: 10,
    'Physical Education': 5
  },
  markingScheme: {
    marksPerCorrect: 4,
    negativeMarksPerWrong: 1,
    marksPerSkipped: 0
  },
  positiveMarks: 4,
  negativeMarks: 1,
  totalMarks: 200,
  status: 'ACTIVE'
};

export const CLASS_10_OFFICIAL_50_QUESTIONS: AuthoritativeQuizQuestion[] = [
  {
    "id": "c10-phy-01",
    "index": 1,
    "subject": "Physics",
    "chapter": "Light - Reflection and Refraction",
    "topic": "Spherical Mirrors & Focal Length",
    "text": "What is the focal length f of a spherical mirror having a radius of curvature R of 32 cm?",
    "options": [
      {
        "id": "opt-c10-p1-a",
        "optionKey": "A",
        "text": "64 cm"
      },
      {
        "id": "opt-c10-p1-b",
        "optionKey": "B",
        "text": "16 cm"
      },
      {
        "id": "opt-c10-p1-c",
        "optionKey": "C",
        "text": "8 cm"
      },
      {
        "id": "opt-c10-p1-d",
        "optionKey": "D",
        "text": "32 cm"
      }
    ],
    "correctOptionId": "opt-c10-p1-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 9",
    "explanation": "The focal length of a spherical mirror is given by f = R / 2. Here f = 32 / 2 = 16 cm."
  },
  {
    "id": "c10-phy-02",
    "index": 2,
    "subject": "Physics",
    "chapter": "Light - Reflection and Refraction",
    "topic": "Refraction & Snell's Law",
    "text": "The refractive index of glass with respect to vacuum is 1.5. If the speed of light in vacuum is 3 × 10⁸ m/s, what is the speed of light in glass?",
    "options": [
      {
        "id": "opt-c10-p2-a",
        "optionKey": "A",
        "text": "2.0 × 10⁸ m/s"
      },
      {
        "id": "opt-c10-p2-b",
        "optionKey": "B",
        "text": "2.5 × 10⁸ m/s"
      },
      {
        "id": "opt-c10-p2-c",
        "optionKey": "C",
        "text": "1.5 × 10⁸ m/s"
      },
      {
        "id": "opt-c10-p2-d",
        "optionKey": "D",
        "text": "3.0 × 10⁸ m/s"
      }
    ],
    "correctOptionId": "opt-c10-p2-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 9",
    "explanation": "Refractive index n = c / v. Therefore v = c / n = (3 × 10⁸) / 1.5 = 2.0 × 10⁸ m/s."
  },
  {
    "id": "c10-phy-03",
    "index": 3,
    "subject": "Physics",
    "chapter": "Light - Reflection and Refraction",
    "topic": "Power of a Lens",
    "text": "A doctor prescribes a corrective lens of power -2.0 D. What is the focal length and nature of this lens?",
    "options": [
      {
        "id": "opt-c10-p3-a",
        "optionKey": "A",
        "text": "f = +0.5 m, Convex lens"
      },
      {
        "id": "opt-c10-p3-b",
        "optionKey": "B",
        "text": "f = -0.5 m, Concave lens"
      },
      {
        "id": "opt-c10-p3-c",
        "optionKey": "C",
        "text": "f = -2.0 m, Concave lens"
      },
      {
        "id": "opt-c10-p3-d",
        "optionKey": "D",
        "text": "f = +2.0 m, Convex lens"
      }
    ],
    "correctOptionId": "opt-c10-p3-b",
    "correctOptionKey": "B",
    "difficulty": "MEDIUM",
    "sourceReference": "NCERT Class 10 Science, Chapter 9",
    "explanation": "Power P = 1 / f(m). Hence f = 1 / (-2.0) = -0.5 m. A negative focal length indicates a diverging concave lens."
  },
  {
    "id": "c10-phy-04",
    "index": 4,
    "subject": "Physics",
    "chapter": "Human Eye and Colorful World",
    "topic": "Least Distance of Distinct Vision",
    "text": "For a normal young adult eye, what is the least distance of distinct vision (near point)?",
    "options": [
      {
        "id": "opt-c10-p4-a",
        "optionKey": "A",
        "text": "2.5 cm"
      },
      {
        "id": "opt-c10-p4-b",
        "optionKey": "B",
        "text": "25 cm"
      },
      {
        "id": "opt-c10-p4-c",
        "optionKey": "C",
        "text": "2.5 m"
      },
      {
        "id": "opt-c10-p4-d",
        "optionKey": "D",
        "text": "Infinity"
      }
    ],
    "correctOptionId": "opt-c10-p4-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 10",
    "explanation": "The least distance of distinct vision is approximately 25 cm for a healthy adult human eye."
  },
  {
    "id": "c10-phy-05",
    "index": 5,
    "subject": "Physics",
    "chapter": "Human Eye and Colorful World",
    "topic": "Defects of Vision",
    "text": "A person unable to clearly see distant objects suffers from which defect, and which lens corrects it?",
    "options": [
      {
        "id": "opt-c10-p5-a",
        "optionKey": "A",
        "text": "Hypermetropia, Convex lens"
      },
      {
        "id": "opt-c10-p5-b",
        "optionKey": "B",
        "text": "Myopia (near-sightedness), Concave lens"
      },
      {
        "id": "opt-c10-p5-c",
        "optionKey": "C",
        "text": "Presbyopia, Bifocal lens"
      },
      {
        "id": "opt-c10-p5-d",
        "optionKey": "D",
        "text": "Cataract, Opaque lens"
      }
    ],
    "correctOptionId": "opt-c10-p5-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 10",
    "explanation": "Myopia is near-sightedness, where distant vision is blurred. It is corrected using a concave lens."
  },
  {
    "id": "c10-phy-06",
    "index": 6,
    "subject": "Physics",
    "chapter": "Human Eye and Colorful World",
    "topic": "Atmospheric Refraction",
    "text": "The twinkling of stars at night is primarily caused by which optical phenomenon?",
    "options": [
      {
        "id": "opt-c10-p6-a",
        "optionKey": "A",
        "text": "Total internal reflection in upper clouds"
      },
      {
        "id": "opt-c10-p6-b",
        "optionKey": "B",
        "text": "Continuous variation in atmospheric refraction of starlight"
      },
      {
        "id": "opt-c10-p6-c",
        "optionKey": "C",
        "text": "Dispersion of light in air molecules"
      },
      {
        "id": "opt-c10-p6-d",
        "optionKey": "D",
        "text": "Interference of starlight"
      }
    ],
    "correctOptionId": "opt-c10-p6-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 10",
    "explanation": "Atmospheric refraction causes starlight to constantly bend through layers of changing density, causing twinkling."
  },
  {
    "id": "c10-phy-07",
    "index": 7,
    "subject": "Physics",
    "chapter": "Electricity",
    "topic": "Ohm's Law & Resistance",
    "text": "According to Ohm's Law, at constant temperature, the electric current (I) in a conductor is:",
    "options": [
      {
        "id": "opt-c10-p7-a",
        "optionKey": "A",
        "text": "Inversely proportional to applied potential difference"
      },
      {
        "id": "opt-c10-p7-b",
        "optionKey": "B",
        "text": "Directly proportional to applied potential difference"
      },
      {
        "id": "opt-c10-p7-c",
        "optionKey": "C",
        "text": "Proportional to square of resistance"
      },
      {
        "id": "opt-c10-p7-d",
        "optionKey": "D",
        "text": "Independent of voltage"
      }
    ],
    "correctOptionId": "opt-c10-p7-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 11",
    "explanation": "Ohm's Law states V = IR, meaning current is directly proportional to potential difference V."
  },
  {
    "id": "c10-phy-08",
    "index": 8,
    "subject": "Physics",
    "chapter": "Electricity",
    "topic": "Factors Affecting Resistance",
    "text": "A wire of resistance R is stretched such that its length is doubled while volume is kept constant. Its new resistance is:",
    "options": [
      {
        "id": "opt-c10-p8-a",
        "optionKey": "A",
        "text": "2R"
      },
      {
        "id": "opt-c10-p8-b",
        "optionKey": "B",
        "text": "4R"
      },
      {
        "id": "opt-c10-p8-c",
        "optionKey": "C",
        "text": "R / 2"
      },
      {
        "id": "opt-c10-p8-d",
        "optionKey": "D",
        "text": "R / 4"
      }
    ],
    "correctOptionId": "opt-c10-p8-b",
    "correctOptionKey": "B",
    "difficulty": "MEDIUM",
    "sourceReference": "NCERT Class 10 Science, Chapter 11",
    "explanation": "When length doubles (2L), area halves (A/2) since volume is constant. New R' = ρ(2L)/(A/2) = 4(ρL/A) = 4R."
  },
  {
    "id": "c10-phy-09",
    "index": 9,
    "subject": "Physics",
    "chapter": "Electricity",
    "topic": "Resistors in Parallel",
    "text": "Three identical resistors of 6 Ω each are connected in parallel. What is the equivalent resistance?",
    "options": [
      {
        "id": "opt-c10-p9-a",
        "optionKey": "A",
        "text": "18 Ω"
      },
      {
        "id": "opt-c10-p9-b",
        "optionKey": "B",
        "text": "2 Ω"
      },
      {
        "id": "opt-c10-p9-c",
        "optionKey": "C",
        "text": "3 Ω"
      },
      {
        "id": "opt-c10-p9-d",
        "optionKey": "D",
        "text": "1 Ω"
      }
    ],
    "correctOptionId": "opt-c10-p9-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 11",
    "explanation": "1/Rp = 1/6 + 1/6 + 1/6 = 3/6 = 1/2. Therefore Rp = 2 Ω."
  },
  {
    "id": "c10-phy-10",
    "index": 10,
    "subject": "Physics",
    "chapter": "Magnetic Effects of Electric Current",
    "topic": "Fleming's Left-Hand Rule",
    "text": "In Fleming's Left-Hand Rule, what does the middle finger represent?",
    "options": [
      {
        "id": "opt-c10-p10-a",
        "optionKey": "A",
        "text": "Direction of magnetic field"
      },
      {
        "id": "opt-c10-p10-b",
        "optionKey": "B",
        "text": "Direction of electric current"
      },
      {
        "id": "opt-c10-p10-c",
        "optionKey": "C",
        "text": "Direction of mechanical force"
      },
      {
        "id": "opt-c10-p10-d",
        "optionKey": "D",
        "text": "Direction of earth gravity"
      }
    ],
    "correctOptionId": "opt-c10-p10-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 12",
    "explanation": "Thumb = Force/Motion, Forefinger = Magnetic Field, Middle finger = Electric Current."
  },
  {
    "id": "c10-chem-01",
    "index": 11,
    "subject": "Chemistry",
    "chapter": "Chemical Reactions and Equations",
    "topic": "Types of Reactions",
    "text": "When solid calcium oxide (quicklime) reacts vigorously with water, it forms slaked lime releasing large heat. This is an example of:",
    "options": [
      {
        "id": "opt-c10-c1-a",
        "optionKey": "A",
        "text": "Combination and Exothermic reaction"
      },
      {
        "id": "opt-c10-c1-b",
        "optionKey": "B",
        "text": "Decomposition and Endothermic reaction"
      },
      {
        "id": "opt-c10-c1-c",
        "optionKey": "C",
        "text": "Displacement reaction"
      },
      {
        "id": "opt-c10-c1-d",
        "optionKey": "D",
        "text": "Double displacement reaction"
      }
    ],
    "correctOptionId": "opt-c10-c1-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 1",
    "explanation": "CaO + H2O -> Ca(OH)2 + Heat. Combination and exothermic."
  },
  {
    "id": "c10-chem-02",
    "index": 12,
    "subject": "Chemistry",
    "chapter": "Chemical Reactions and Equations",
    "topic": "Redox Reactions",
    "text": "In the reaction CuO + H2 -> Cu + H2O, which substance is oxidized and which is reduced?",
    "options": [
      {
        "id": "opt-c10-c2-a",
        "optionKey": "A",
        "text": "CuO is oxidized, H2 is reduced"
      },
      {
        "id": "opt-c10-c2-b",
        "optionKey": "B",
        "text": "H2 is oxidized, CuO is reduced"
      },
      {
        "id": "opt-c10-c2-c",
        "optionKey": "C",
        "text": "Both CuO and H2 are oxidized"
      },
      {
        "id": "opt-c10-c2-d",
        "optionKey": "D",
        "text": "Neither is oxidized"
      }
    ],
    "correctOptionId": "opt-c10-c2-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 1",
    "explanation": "H2 gains oxygen (oxidized), CuO loses oxygen (reduced)."
  },
  {
    "id": "c10-chem-03",
    "index": 13,
    "subject": "Chemistry",
    "chapter": "Acids, Bases and Salts",
    "topic": "Indicators & pH",
    "text": "What color change is observed when blue litmus paper is dipped in dilute hydrochloric acid (HCl)?",
    "options": [
      {
        "id": "opt-c10-c3-a",
        "optionKey": "A",
        "text": "Blue turns Red"
      },
      {
        "id": "opt-c10-c3-b",
        "optionKey": "B",
        "text": "Red turns Blue"
      },
      {
        "id": "opt-c10-c3-c",
        "optionKey": "C",
        "text": "Remains Blue"
      },
      {
        "id": "opt-c10-c3-d",
        "optionKey": "D",
        "text": "Turns Yellow"
      }
    ],
    "correctOptionId": "opt-c10-c3-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 2",
    "explanation": "Acids turn blue litmus red."
  },
  {
    "id": "c10-chem-04",
    "index": 14,
    "subject": "Chemistry",
    "chapter": "Acids, Bases and Salts",
    "topic": "Importance of pH in Everyday Life",
    "text": "Tooth decay starts when the pH of the mouth drops below which value?",
    "options": [
      {
        "id": "opt-c10-c4-a",
        "optionKey": "A",
        "text": "7.0"
      },
      {
        "id": "opt-c10-c4-b",
        "optionKey": "B",
        "text": "5.5"
      },
      {
        "id": "opt-c10-c4-c",
        "optionKey": "C",
        "text": "8.5"
      },
      {
        "id": "opt-c10-c4-d",
        "optionKey": "D",
        "text": "6.5"
      }
    ],
    "correctOptionId": "opt-c10-c4-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 2",
    "explanation": "Enamel begins corroding when oral pH drops below 5.5 due to acid from bacteria."
  },
  {
    "id": "c10-chem-05",
    "index": 15,
    "subject": "Chemistry",
    "chapter": "Acids, Bases and Salts",
    "topic": "Important Chemical Compounds",
    "text": "What is the chemical formula of Plaster of Paris (POP)?",
    "options": [
      {
        "id": "opt-c10-c5-a",
        "optionKey": "A",
        "text": "CaSO4 . 2H2O"
      },
      {
        "id": "opt-c10-c5-b",
        "optionKey": "B",
        "text": "CaSO4 . 1/2H2O"
      },
      {
        "id": "opt-c10-c5-c",
        "optionKey": "C",
        "text": "CaCO3"
      },
      {
        "id": "opt-c10-c5-d",
        "optionKey": "D",
        "text": "CaOCl2"
      }
    ],
    "correctOptionId": "opt-c10-c5-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 2",
    "explanation": "Plaster of Paris is calcium sulphate hemihydrate: CaSO4 . 1/2H2O."
  },
  {
    "id": "c10-chem-06",
    "index": 16,
    "subject": "Chemistry",
    "chapter": "Metals and Non-Metals",
    "topic": "Physical Properties",
    "text": "Which metal is in liquid state at room temperature?",
    "options": [
      {
        "id": "opt-c10-c6-a",
        "optionKey": "A",
        "text": "Sodium"
      },
      {
        "id": "opt-c10-c6-b",
        "optionKey": "B",
        "text": "Mercury"
      },
      {
        "id": "opt-c10-c6-c",
        "optionKey": "C",
        "text": "Magnesium"
      },
      {
        "id": "opt-c10-c6-d",
        "optionKey": "D",
        "text": "Bromine"
      }
    ],
    "correctOptionId": "opt-c10-c6-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 3",
    "explanation": "Mercury (Hg) is the only metal liquid at standard room temperature."
  },
  {
    "id": "c10-chem-07",
    "index": 17,
    "subject": "Chemistry",
    "chapter": "Metals and Non-Metals",
    "topic": "Reactivity Series",
    "text": "Which of the following metals can displace copper from an aqueous solution of copper sulphate (CuSO4)?",
    "options": [
      {
        "id": "opt-c10-c7-a",
        "optionKey": "A",
        "text": "Silver (Ag)"
      },
      {
        "id": "opt-c10-c7-b",
        "optionKey": "B",
        "text": "Iron (Fe)"
      },
      {
        "id": "opt-c10-c7-c",
        "optionKey": "C",
        "text": "Gold (Au)"
      },
      {
        "id": "opt-c10-c7-d",
        "optionKey": "D",
        "text": "Platinum (Pt)"
      }
    ],
    "correctOptionId": "opt-c10-c7-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 3",
    "explanation": "Iron is higher than copper in the reactivity series: Fe + CuSO4 -> FeSO4 + Cu."
  },
  {
    "id": "c10-chem-08",
    "index": 18,
    "subject": "Chemistry",
    "chapter": "Metals and Non-Metals",
    "topic": "Corrosion Prevention",
    "text": "Galvanisation is a method of protecting iron from rusting by coating it with a thin layer of:",
    "options": [
      {
        "id": "opt-c10-c8-a",
        "optionKey": "A",
        "text": "Chromium"
      },
      {
        "id": "opt-c10-c8-b",
        "optionKey": "B",
        "text": "Zinc"
      },
      {
        "id": "opt-c10-c8-c",
        "optionKey": "C",
        "text": "Copper"
      },
      {
        "id": "opt-c10-c8-d",
        "optionKey": "D",
        "text": "Tin"
      }
    ],
    "correctOptionId": "opt-c10-c8-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 3",
    "explanation": "Galvanisation protects iron/steel by coating it with a sacrificial layer of zinc."
  },
  {
    "id": "c10-chem-09",
    "index": 19,
    "subject": "Chemistry",
    "chapter": "Carbon and its Compounds",
    "topic": "Covalent Bonding & Versatility of Carbon",
    "text": "Carbon forms a very large number of compounds primarily due to its two unique properties:",
    "options": [
      {
        "id": "opt-c10-c9-a",
        "optionKey": "A",
        "text": "High electropositivity and malleability"
      },
      {
        "id": "opt-c10-c9-b",
        "optionKey": "B",
        "text": "Catenation and Tetravalency"
      },
      {
        "id": "opt-c10-c9-c",
        "optionKey": "C",
        "text": "Radioactivity and noble nature"
      },
      {
        "id": "opt-c10-c9-d",
        "optionKey": "D",
        "text": "Ionic bonding and combustibility"
      }
    ],
    "correctOptionId": "opt-c10-c9-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 4",
    "explanation": "Catenation and tetravalency allow carbon to form countless stable organic compounds."
  },
  {
    "id": "c10-chem-10",
    "index": 20,
    "subject": "Chemistry",
    "chapter": "Carbon and its Compounds",
    "topic": "Functional Groups",
    "text": "What is the functional group present in ethanoic acid (CH3COOH)?",
    "options": [
      {
        "id": "opt-c10-c10-a",
        "optionKey": "A",
        "text": "Alcohol (-OH)"
      },
      {
        "id": "opt-c10-c10-b",
        "optionKey": "B",
        "text": "Carboxylic acid (-COOH)"
      },
      {
        "id": "opt-c10-c10-c",
        "optionKey": "C",
        "text": "Aldehyde (-CHO)"
      },
      {
        "id": "opt-c10-c10-d",
        "optionKey": "D",
        "text": "Ketone (>C=O)"
      }
    ],
    "correctOptionId": "opt-c10-c10-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 4",
    "explanation": "Ethanoic acid contains the carboxylic acid (-COOH) functional group."
  },
  {
    "id": "c10-math-01",
    "index": 21,
    "subject": "Mathematics",
    "chapter": "Real Numbers",
    "topic": "Fundamental Theorem of Arithmetic",
    "text": "If HCF(306, 657) = 9, what is LCM(306, 657)?",
    "options": [
      {
        "id": "opt-c10-m1-a",
        "optionKey": "A",
        "text": "22,338"
      },
      {
        "id": "opt-c10-m1-b",
        "optionKey": "B",
        "text": "2,238"
      },
      {
        "id": "opt-c10-m1-c",
        "optionKey": "C",
        "text": "223,380"
      },
      {
        "id": "opt-c10-m1-d",
        "optionKey": "D",
        "text": "34,128"
      }
    ],
    "correctOptionId": "opt-c10-m1-a",
    "correctOptionKey": "A",
    "difficulty": "MEDIUM",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 1",
    "explanation": "Product = HCF * LCM. LCM = (306 * 657) / 9 = 22,338."
  },
  {
    "id": "c10-math-02",
    "index": 22,
    "subject": "Mathematics",
    "chapter": "Polynomials",
    "topic": "Relationship between Zeroes and Coefficients",
    "text": "If alpha and beta are the zeroes of the quadratic polynomial p(x) = x^2 - 5x + 6, find the value of (alpha + beta) and (alpha * beta).",
    "options": [
      {
        "id": "opt-c10-m2-a",
        "optionKey": "A",
        "text": "alpha + beta = -5, alpha*beta = 6"
      },
      {
        "id": "opt-c10-m2-b",
        "optionKey": "B",
        "text": "alpha + beta = 5, alpha*beta = 6"
      },
      {
        "id": "opt-c10-m2-c",
        "optionKey": "C",
        "text": "alpha + beta = 6, alpha*beta = 5"
      },
      {
        "id": "opt-c10-m2-d",
        "optionKey": "D",
        "text": "alpha + beta = -5, alpha*beta = -6"
      }
    ],
    "correctOptionId": "opt-c10-m2-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 2",
    "explanation": "Sum = -b/a = 5. Product = c/a = 6."
  },
  {
    "id": "c10-math-03",
    "index": 23,
    "subject": "Mathematics",
    "chapter": "Linear Equations in Two Variables",
    "topic": "Condition for Unique Solution",
    "text": "For what condition on coefficients do the equations a1x + b1y + c1 = 0 and a2x + b2y + c2 = 0 have a unique solution?",
    "options": [
      {
        "id": "opt-c10-m3-a",
        "optionKey": "A",
        "text": "a1/a2 = b1/b2 != c1/c2"
      },
      {
        "id": "opt-c10-m3-b",
        "optionKey": "B",
        "text": "a1/a2 != b1/b2"
      },
      {
        "id": "opt-c10-m3-c",
        "optionKey": "C",
        "text": "a1/a2 = b1/b2 = c1/c2"
      },
      {
        "id": "opt-c10-m3-d",
        "optionKey": "D",
        "text": "a1 b1 = a2 b2"
      }
    ],
    "correctOptionId": "opt-c10-m3-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 3",
    "explanation": "Lines intersect at a unique point if and only if a1/a2 != b1/b2."
  },
  {
    "id": "c10-math-04",
    "index": 24,
    "subject": "Mathematics",
    "chapter": "Quadratic Equations",
    "topic": "Discriminant & Nature of Roots",
    "text": "What is the nature of roots for the quadratic equation 2x^2 - 4x + 3 = 0?",
    "options": [
      {
        "id": "opt-c10-m4-a",
        "optionKey": "A",
        "text": "Two distinct real roots"
      },
      {
        "id": "opt-c10-m4-b",
        "optionKey": "B",
        "text": "No real roots (imaginary)"
      },
      {
        "id": "opt-c10-m4-c",
        "optionKey": "C",
        "text": "Two equal real roots"
      },
      {
        "id": "opt-c10-m4-d",
        "optionKey": "D",
        "text": "One zero root"
      }
    ],
    "correctOptionId": "opt-c10-m4-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 4",
    "explanation": "Discriminant D = (-4)^2 - 4(2)(3) = 16 - 24 = -8 < 0. No real roots."
  },
  {
    "id": "c10-math-05",
    "index": 25,
    "subject": "Mathematics",
    "chapter": "Arithmetic Progressions",
    "topic": "nth Term of an AP",
    "text": "What is the 10th term of the AP: 2, 7, 12, ...?",
    "options": [
      {
        "id": "opt-c10-m5-a",
        "optionKey": "A",
        "text": "42"
      },
      {
        "id": "opt-c10-m5-b",
        "optionKey": "B",
        "text": "47"
      },
      {
        "id": "opt-c10-m5-c",
        "optionKey": "C",
        "text": "52"
      },
      {
        "id": "opt-c10-m5-d",
        "optionKey": "D",
        "text": "50"
      }
    ],
    "correctOptionId": "opt-c10-m5-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 5",
    "explanation": "a = 2, d = 5. a10 = a + 9d = 2 + 45 = 47."
  },
  {
    "id": "c10-math-06",
    "index": 26,
    "subject": "Mathematics",
    "chapter": "Triangles",
    "topic": "Basic Proportionality Theorem (Thales)",
    "text": "In triangle ABC, line DE is parallel to BC with AD = 1.5 cm, DB = 3 cm, and AE = 1 cm. What is the length of EC?",
    "options": [
      {
        "id": "opt-c10-m6-a",
        "optionKey": "A",
        "text": "3 cm"
      },
      {
        "id": "opt-c10-m6-b",
        "optionKey": "B",
        "text": "2 cm"
      },
      {
        "id": "opt-c10-m6-c",
        "optionKey": "C",
        "text": "1.5 cm"
      },
      {
        "id": "opt-c10-m6-d",
        "optionKey": "D",
        "text": "4.5 cm"
      }
    ],
    "correctOptionId": "opt-c10-m6-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 6",
    "explanation": "AD/DB = AE/EC => 1.5/3 = 1/EC => EC = 2 cm."
  },
  {
    "id": "c10-math-07",
    "index": 27,
    "subject": "Mathematics",
    "chapter": "Coordinate Geometry",
    "topic": "Distance Formula",
    "text": "What is the distance between the points P(2, 3) and Q(4, 1)?",
    "options": [
      {
        "id": "opt-c10-m7-a",
        "optionKey": "A",
        "text": "2sqrt(2) units"
      },
      {
        "id": "opt-c10-m7-b",
        "optionKey": "B",
        "text": "4 units"
      },
      {
        "id": "opt-c10-m7-c",
        "optionKey": "C",
        "text": "sqrt(6) units"
      },
      {
        "id": "opt-c10-m7-d",
        "optionKey": "D",
        "text": "8 units"
      }
    ],
    "correctOptionId": "opt-c10-m7-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 7",
    "explanation": "Distance = sqrt((4-2)^2 + (1-3)^2) = sqrt(4 + 4) = 2sqrt(2) units."
  },
  {
    "id": "c10-math-08",
    "index": 28,
    "subject": "Mathematics",
    "chapter": "Introduction to Trigonometry",
    "topic": "Trigonometric Values",
    "text": "What is the exact value of (sin 30 deg + cos 60 deg)?",
    "options": [
      {
        "id": "opt-c10-m8-a",
        "optionKey": "A",
        "text": "sqrt(3)"
      },
      {
        "id": "opt-c10-m8-b",
        "optionKey": "B",
        "text": "1"
      },
      {
        "id": "opt-c10-m8-c",
        "optionKey": "C",
        "text": "1/2"
      },
      {
        "id": "opt-c10-m8-d",
        "optionKey": "D",
        "text": "0"
      }
    ],
    "correctOptionId": "opt-c10-m8-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 8",
    "explanation": "sin 30 = 1/2, cos 60 = 1/2. 1/2 + 1/2 = 1."
  },
  {
    "id": "c10-math-09",
    "index": 29,
    "subject": "Mathematics",
    "chapter": "Introduction to Trigonometry",
    "topic": "Trigonometric Identities",
    "text": "Evaluate: 9 sec^2(A) - 9 tan^2(A).",
    "options": [
      {
        "id": "opt-c10-m9-a",
        "optionKey": "A",
        "text": "1"
      },
      {
        "id": "opt-c10-m9-b",
        "optionKey": "B",
        "text": "9"
      },
      {
        "id": "opt-c10-m9-c",
        "optionKey": "C",
        "text": "8"
      },
      {
        "id": "opt-c10-m9-d",
        "optionKey": "D",
        "text": "0"
      }
    ],
    "correctOptionId": "opt-c10-m9-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 8",
    "explanation": "sec^2(A) - tan^2(A) = 1. 9 * 1 = 9."
  },
  {
    "id": "c10-math-10",
    "index": 30,
    "subject": "Mathematics",
    "chapter": "Statistics",
    "topic": "Empirical Relationship",
    "text": "What is the empirical relationship between the three measures of central tendency?",
    "options": [
      {
        "id": "opt-c10-m10-a",
        "optionKey": "A",
        "text": "3 Mode = Median + 2 Mean"
      },
      {
        "id": "opt-c10-m10-b",
        "optionKey": "B",
        "text": "3 Median = Mode + 2 Mean"
      },
      {
        "id": "opt-c10-m10-c",
        "optionKey": "C",
        "text": "3 Mean = Mode + 2 Median"
      },
      {
        "id": "opt-c10-m10-d",
        "optionKey": "D",
        "text": "Mode = 2 Median + 3 Mean"
      }
    ],
    "correctOptionId": "opt-c10-m10-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Mathematics, Chapter 13",
    "explanation": "The relationship is 3 Median = Mode + 2 Mean."
  },
  {
    "id": "c10-ai-01",
    "index": 31,
    "subject": "AI / Computer",
    "chapter": "CBSE AI Code 417",
    "topic": "AI Project Cycle Stages",
    "text": "What is the correct sequential order of stages in the CBSE AI Project Cycle?",
    "options": [
      {
        "id": "opt-c10-a1-a",
        "optionKey": "A",
        "text": "Modelling -> Data Acquisition -> Problem Scoping -> Evaluation -> Data Exploration"
      },
      {
        "id": "opt-c10-a1-b",
        "optionKey": "B",
        "text": "Problem Scoping -> Data Acquisition -> Data Exploration -> Modelling -> Evaluation"
      },
      {
        "id": "opt-c10-a1-c",
        "optionKey": "C",
        "text": "Data Exploration -> Problem Scoping -> Modelling -> Evaluation -> Data Acquisition"
      },
      {
        "id": "opt-c10-a1-d",
        "optionKey": "D",
        "text": "Data Acquisition -> Modelling -> Evaluation -> Problem Scoping -> Deployment"
      }
    ],
    "correctOptionId": "opt-c10-a1-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 AI Curriculum (Code 417), Unit 2",
    "explanation": "The 5 stages are: 1. Problem Scoping, 2. Data Acquisition, 3. Data Exploration, 4. Modelling, 5. Evaluation."
  },
  {
    "id": "c10-ai-02",
    "index": 32,
    "subject": "AI / Computer",
    "chapter": "CBSE AI Code 417",
    "topic": "Natural Language Processing (NLP)",
    "text": "In NLP, what is the process of breaking down raw text into individual words or meaningful units called?",
    "options": [
      {
        "id": "opt-c10-a2-a",
        "optionKey": "A",
        "text": "Lemmatization"
      },
      {
        "id": "opt-c10-a2-b",
        "optionKey": "B",
        "text": "Tokenization"
      },
      {
        "id": "opt-c10-a2-c",
        "optionKey": "C",
        "text": "Bag of Words"
      },
      {
        "id": "opt-c10-a2-d",
        "optionKey": "D",
        "text": "Stemming"
      }
    ],
    "correctOptionId": "opt-c10-a2-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 AI Curriculum (Code 417), Unit 4",
    "explanation": "Tokenization is the first step in NLP text preprocessing."
  },
  {
    "id": "c10-ai-03",
    "index": 33,
    "subject": "AI / Computer",
    "chapter": "CBSE AI Code 417",
    "topic": "Computer Vision Basics",
    "text": "In Computer Vision, what are the three primary color channels used in digital RGB imagery?",
    "options": [
      {
        "id": "opt-c10-a3-a",
        "optionKey": "A",
        "text": "Red, Green, Blue"
      },
      {
        "id": "opt-c10-a3-b",
        "optionKey": "B",
        "text": "Red, Grey, Black"
      },
      {
        "id": "opt-c10-a3-c",
        "optionKey": "C",
        "text": "Rose, Gold, Bronze"
      },
      {
        "id": "opt-c10-a3-d",
        "optionKey": "D",
        "text": "Radio, Gamma, Beta"
      }
    ],
    "correctOptionId": "opt-c10-a3-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 AI Curriculum (Code 417), Unit 3",
    "explanation": "Digital color images represent pixels using Red, Green, and Blue (RGB)."
  },
  {
    "id": "c10-ai-04",
    "index": 34,
    "subject": "AI / Computer",
    "chapter": "CBSE AI Code 417",
    "topic": "Python Programming Basics",
    "text": "Which data structure in Python is mutable, ordered, and enclosed in square brackets []?",
    "options": [
      {
        "id": "opt-c10-a4-a",
        "optionKey": "A",
        "text": "Tuple"
      },
      {
        "id": "opt-c10-a4-b",
        "optionKey": "B",
        "text": "List"
      },
      {
        "id": "opt-c10-a4-c",
        "optionKey": "C",
        "text": "Dictionary"
      },
      {
        "id": "opt-c10-a4-d",
        "optionKey": "D",
        "text": "String"
      }
    ],
    "correctOptionId": "opt-c10-a4-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 AI Code 417, Python Module",
    "explanation": "A list in Python is an ordered, mutable sequence: [1, 2, 3]."
  },
  {
    "id": "c10-ai-05",
    "index": 35,
    "subject": "AI / Computer",
    "chapter": "CBSE AI Code 417",
    "topic": "AI Ethics & Bias",
    "text": "When an AI recruitment tool unfairly favors one demographic over another because training data was unbalanced, it demonstrates:",
    "options": [
      {
        "id": "opt-c10-a5-a",
        "optionKey": "A",
        "text": "Hardware latency"
      },
      {
        "id": "opt-c10-a5-b",
        "optionKey": "B",
        "text": "Data Bias"
      },
      {
        "id": "opt-c10-a5-c",
        "optionKey": "C",
        "text": "Overclocking"
      },
      {
        "id": "opt-c10-a5-d",
        "optionKey": "D",
        "text": "Cache miss"
      }
    ],
    "correctOptionId": "opt-c10-a5-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 AI Code 417, Unit 1",
    "explanation": "Data bias occurs when models are trained on unrepresentative historical datasets."
  },
  {
    "id": "c10-eng-01",
    "index": 36,
    "subject": "English",
    "chapter": "First Flight",
    "topic": "A Letter to God (G.L. Fuentes)",
    "text": "In the story 'A Letter to God', why did Lencho call the post office employees a 'bunch of crooks'?",
    "options": [
      {
        "id": "opt-c10-e1-a",
        "optionKey": "A",
        "text": "Because they stole his crops"
      },
      {
        "id": "opt-c10-e1-b",
        "optionKey": "B",
        "text": "Because he received 70 pesos instead of the 100 pesos he asked from God"
      },
      {
        "id": "opt-c10-e1-c",
        "optionKey": "C",
        "text": "Because they refused to deliver his letter"
      },
      {
        "id": "opt-c10-e1-d",
        "optionKey": "D",
        "text": "Because they laughed at his handwriting"
      }
    ],
    "correctOptionId": "opt-c10-e1-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English First Flight, Chapter 1",
    "explanation": "Lencho was confident God could not make a mistake, so he believed the post office employees took the missing 30 pesos."
  },
  {
    "id": "c10-eng-02",
    "index": 37,
    "subject": "English",
    "chapter": "First Flight",
    "topic": "Nelson Mandela: Long Walk to Freedom",
    "text": "According to Nelson Mandela, what does courage truly mean?",
    "options": [
      {
        "id": "opt-c10-e2-a",
        "optionKey": "A",
        "text": "The complete absence of fear"
      },
      {
        "id": "opt-c10-e2-b",
        "optionKey": "B",
        "text": "The triumph over fear"
      },
      {
        "id": "opt-c10-e2-c",
        "optionKey": "C",
        "text": "Physical invulnerability"
      },
      {
        "id": "opt-c10-e2-d",
        "optionKey": "D",
        "text": "Never yielding to law"
      }
    ],
    "correctOptionId": "opt-c10-e2-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English First Flight, Chapter 2",
    "explanation": "Mandela wrote that courage was not the absence of fear, but the triumph over it."
  },
  {
    "id": "c10-eng-03",
    "index": 38,
    "subject": "English",
    "chapter": "First Flight",
    "topic": "Two Stories About Flying",
    "text": "In 'His First Flight', what finally compelled the young seagull to take his first flight?",
    "options": [
      {
        "id": "opt-c10-e3-a",
        "optionKey": "A",
        "text": "A heavy gale pushing him off the ledge"
      },
      {
        "id": "opt-c10-e3-b",
        "optionKey": "B",
        "text": "Extreme hunger when his mother flew close with fish"
      },
      {
        "id": "opt-c10-e3-c",
        "optionKey": "C",
        "text": "A predator chasing him"
      },
      {
        "id": "opt-c10-e3-d",
        "optionKey": "D",
        "text": "His siblings calling him"
      }
    ],
    "correctOptionId": "opt-c10-e3-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English First Flight, Chapter 3",
    "explanation": "Maddened by hunger, the young seagull dived for the fish, plunging into space and flying."
  },
  {
    "id": "c10-eng-04",
    "index": 39,
    "subject": "English",
    "chapter": "First Flight",
    "topic": "From the Diary of Anne Frank",
    "text": "What was the name Anne Frank lovingly gave to her diary?",
    "options": [
      {
        "id": "opt-c10-e4-a",
        "optionKey": "A",
        "text": "Margot"
      },
      {
        "id": "opt-c10-e4-b",
        "optionKey": "B",
        "text": "Kitty"
      },
      {
        "id": "opt-c10-e4-c",
        "optionKey": "C",
        "text": "Misty"
      },
      {
        "id": "opt-c10-e4-d",
        "optionKey": "D",
        "text": "Penny"
      }
    ],
    "correctOptionId": "opt-c10-e4-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English First Flight, Chapter 4",
    "explanation": "Anne Frank treated her diary as her confidante, naming it 'Kitty'."
  },
  {
    "id": "c10-eng-05",
    "index": 40,
    "subject": "English",
    "chapter": "First Flight Poetry",
    "topic": "Dust of Snow (Robert Frost)",
    "text": "In Robert Frost's poem 'Dust of Snow', what changed the poet's melancholy mood?",
    "options": [
      {
        "id": "opt-c10-e5-a",
        "optionKey": "A",
        "text": "A crow shaking down fine snow from a hemlock tree onto him"
      },
      {
        "id": "opt-c10-e5-b",
        "optionKey": "B",
        "text": "Hearing birds singing in the forest"
      },
      {
        "id": "opt-c10-e5-c",
        "optionKey": "C",
        "text": "Finding an old manuscript"
      },
      {
        "id": "opt-c10-e5-d",
        "optionKey": "D",
        "text": "Warm sunlight breaking through clouds"
      }
    ],
    "correctOptionId": "opt-c10-e5-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English First Flight Poem",
    "explanation": "The crow shaking snow from a hemlock tree transformed the poet's mood."
  },
  {
    "id": "c10-eng-06",
    "index": 41,
    "subject": "English",
    "chapter": "Footprints without Feet",
    "topic": "A Triumph of Surgery (James Herriot)",
    "text": "In 'A Triumph of Surgery', what was the real cure for Tricki at Dr. Herriot's clinic?",
    "options": [
      {
        "id": "opt-c10-e6-a",
        "optionKey": "A",
        "text": "Major surgical operation"
      },
      {
        "id": "opt-c10-e6-b",
        "optionKey": "B",
        "text": "Strict control on food, abundant water, and active exercise with other dogs"
      },
      {
        "id": "opt-c10-e6-c",
        "optionKey": "C",
        "text": "Daily vitamin injections and tonics"
      },
      {
        "id": "opt-c10-e6-d",
        "optionKey": "D",
        "text": "Bed rest with treats"
      }
    ],
    "correctOptionId": "opt-c10-e6-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English Footprints without Feet, Chapter 1",
    "explanation": "Dr. Herriot gave Tricki no medical drugs, just disciplined diet and exercise."
  },
  {
    "id": "c10-eng-07",
    "index": 42,
    "subject": "English",
    "chapter": "Footprints without Feet",
    "topic": "The Thief's Story (Ruskin Bond)",
    "text": "Why did Hari Singh decide to return the stolen money under Anil's mattress?",
    "options": [
      {
        "id": "opt-c10-e7-a",
        "optionKey": "A",
        "text": "He feared being caught by police"
      },
      {
        "id": "opt-c10-e7-b",
        "optionKey": "B",
        "text": "He valued learning to read and write and didn't want to betray Anil's trust"
      },
      {
        "id": "opt-c10-e7-c",
        "optionKey": "C",
        "text": "The money was wet from the rain"
      },
      {
        "id": "opt-c10-e7-d",
        "optionKey": "D",
        "text": "He missed his train"
      }
    ],
    "correctOptionId": "opt-c10-e7-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English Footprints without Feet, Chapter 2",
    "explanation": "Hari realized education could give him genuine respect, which was far greater than stolen cash."
  },
  {
    "id": "c10-eng-08",
    "index": 43,
    "subject": "English",
    "chapter": "Footprints without Feet",
    "topic": "Footprints without Feet (H.G. Wells)",
    "text": "What made Griffin the scientist invisible?",
    "options": [
      {
        "id": "opt-c10-e8-a",
        "optionKey": "A",
        "text": "Swallowing rare chemical drugs that made his body transparent like sheet glass"
      },
      {
        "id": "opt-c10-e8-b",
        "optionKey": "B",
        "text": "A specialized camouflage cloak"
      },
      {
        "id": "opt-c10-e8-c",
        "optionKey": "C",
        "text": "Laser refraction beam"
      },
      {
        "id": "opt-c10-e8-d",
        "optionKey": "D",
        "text": "An electric generator accident"
      }
    ],
    "correctOptionId": "opt-c10-e8-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 English Footprints without Feet, Chapter 5",
    "explanation": "Griffin swallowed rare drugs that made his body transparent as sheet glass."
  },
  {
    "id": "c10-eng-09",
    "index": 44,
    "subject": "English",
    "chapter": "Applied Grammar",
    "topic": "Subject-Verb Concord",
    "text": "Choose the correct verb: 'Neither the teacher nor the students ______ present in the lab.'",
    "options": [
      {
        "id": "opt-c10-e9-a",
        "optionKey": "A",
        "text": "was"
      },
      {
        "id": "opt-c10-e9-b",
        "optionKey": "B",
        "text": "were"
      },
      {
        "id": "opt-c10-e9-c",
        "optionKey": "C",
        "text": "is"
      },
      {
        "id": "opt-c10-e9-d",
        "optionKey": "D",
        "text": "has been"
      }
    ],
    "correctOptionId": "opt-c10-e9-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 English Grammar Concord Rules",
    "explanation": "With 'neither...nor', the verb agrees with the closer subject 'students' (plural), so 'were' is correct."
  },
  {
    "id": "c10-eng-10",
    "index": 45,
    "subject": "English",
    "chapter": "Writing Skills",
    "topic": "Formal Letter to Editor",
    "text": "In a formal letter to the editor of a newspaper, which salutation and complimentary close is appropriate?",
    "options": [
      {
        "id": "opt-c10-e10-a",
        "optionKey": "A",
        "text": "Sir / Madam and Yours truly"
      },
      {
        "id": "opt-c10-e10-b",
        "optionKey": "B",
        "text": "Dear Friend and Cheers"
      },
      {
        "id": "opt-c10-e10-c",
        "optionKey": "C",
        "text": "Hello Sir and Best wishes always"
      },
      {
        "id": "opt-c10-e10-d",
        "optionKey": "D",
        "text": "Hey and Warm hugs"
      }
    ],
    "correctOptionId": "opt-c10-e10-a",
    "correctOptionKey": "A",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 English Writing Skills",
    "explanation": "Formal letters require 'Sir / Madam' and 'Yours truly' or 'Yours sincerely'."
  },
  {
    "id": "c10-pe-01",
    "index": 46,
    "subject": "Physical Education",
    "chapter": "Health and Physical Fitness",
    "topic": "Components of Fitness",
    "text": "Which fitness component describes the capability of the circulatory and respiratory systems to supply oxygen during sustained exercise?",
    "options": [
      {
        "id": "opt-c10-pe1-a",
        "optionKey": "A",
        "text": "Muscular power"
      },
      {
        "id": "opt-c10-pe1-b",
        "optionKey": "B",
        "text": "Cardiorespiratory Endurance"
      },
      {
        "id": "opt-c10-pe1-c",
        "optionKey": "C",
        "text": "Static flexibility"
      },
      {
        "id": "opt-c10-pe1-d",
        "optionKey": "D",
        "text": "Reaction speed"
      }
    ],
    "correctOptionId": "opt-c10-pe1-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 Health and Physical Education",
    "explanation": "Cardiorespiratory endurance enables heart and lungs to supply oxygen during sustained exercise."
  },
  {
    "id": "c10-pe-02",
    "index": 47,
    "subject": "Physical Education",
    "chapter": "Yoga and Wellness",
    "topic": "Surya Namaskar & Asanas",
    "text": "How many distinct sequential postures are performed in one complete round of Surya Namaskar (Sun Salutation)?",
    "options": [
      {
        "id": "opt-c10-pe2-a",
        "optionKey": "A",
        "text": "8"
      },
      {
        "id": "opt-c10-pe2-b",
        "optionKey": "B",
        "text": "12"
      },
      {
        "id": "opt-c10-pe2-c",
        "optionKey": "C",
        "text": "16"
      },
      {
        "id": "opt-c10-pe2-d",
        "optionKey": "D",
        "text": "10"
      }
    ],
    "correctOptionId": "opt-c10-pe2-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Class 10 Health and Physical Education",
    "explanation": "Surya Namaskar consists of 12 linked postures."
  },
  {
    "id": "c10-pe-03",
    "index": 48,
    "subject": "Physical Education",
    "chapter": "First Aid in Sports",
    "topic": "R.I.C.E. Protocol",
    "text": "What does the first-aid acronym R.I.C.E. stand for when treating sprains or sports injuries?",
    "options": [
      {
        "id": "opt-c10-pe3-a",
        "optionKey": "A",
        "text": "Run, Immerse, Cool, Exercise"
      },
      {
        "id": "opt-c10-pe3-b",
        "optionKey": "B",
        "text": "Rest, Ice, Compression, Elevation"
      },
      {
        "id": "opt-c10-pe3-c",
        "optionKey": "C",
        "text": "Relief, Intake, Cardio, Energy"
      },
      {
        "id": "opt-c10-pe3-d",
        "optionKey": "D",
        "text": "Rotate, Inflate, Compress, Extend"
      }
    ],
    "correctOptionId": "opt-c10-pe3-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "CBSE Health & Physical Education, First Aid",
    "explanation": "R.I.C.E. = Rest, Ice, Compression, Elevation."
  },
  {
    "id": "c10-pe-04",
    "index": 49,
    "subject": "Physical Education",
    "chapter": "Life Processes & Nutrition",
    "topic": "Digestive Enzymes and Respiration",
    "text": "In human digestion, which enzyme in saliva begins the breakdown of complex starch into simpler maltose sugars?",
    "options": [
      {
        "id": "opt-c10-pe4-a",
        "optionKey": "A",
        "text": "Pepsin"
      },
      {
        "id": "opt-c10-pe4-b",
        "optionKey": "B",
        "text": "Salivary Amylase (Ptyalin)"
      },
      {
        "id": "opt-c10-pe4-c",
        "optionKey": "C",
        "text": "Trypsin"
      },
      {
        "id": "opt-c10-pe4-d",
        "optionKey": "D",
        "text": "Lipase"
      }
    ],
    "correctOptionId": "opt-c10-pe4-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 5 (Life Processes)",
    "explanation": "Salivary amylase hydrolyses starch into maltose in the mouth."
  },
  {
    "id": "c10-pe-05",
    "index": 50,
    "subject": "Physical Education",
    "chapter": "Our Environment & Global Health",
    "topic": "Ozone Layer Protection",
    "text": "The stratospheric ozone layer protects living organisms on Earth by absorbing which harmful solar radiation?",
    "options": [
      {
        "id": "opt-c10-pe5-a",
        "optionKey": "A",
        "text": "Infrared (IR) radiation"
      },
      {
        "id": "opt-c10-pe5-b",
        "optionKey": "B",
        "text": "Ultraviolet (UV) radiation"
      },
      {
        "id": "opt-c10-pe5-c",
        "optionKey": "C",
        "text": "Radio waves"
      },
      {
        "id": "opt-c10-pe5-d",
        "optionKey": "D",
        "text": "Visible green light"
      }
    ],
    "correctOptionId": "opt-c10-pe5-b",
    "correctOptionKey": "B",
    "difficulty": "EASY",
    "sourceReference": "NCERT Class 10 Science, Chapter 15",
    "explanation": "The ozone layer shields Earth from dangerous ultraviolet (UV) radiation."
  }
];

export const CLASS_10_SYLLABUS_PROGRESS: QuizSyllabusItem[] = [
  { id: 'syl-c10-phy-1', subject: 'Physics', chapter: 'Light - Reflection and Refraction', topic: 'Mirrors, Lenses & Snell\'s Law', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-c10-phy-2', subject: 'Physics', chapter: 'The Human Eye & Colorful World', topic: 'Defects of Vision, Dispersion & Atmospheric Refraction', progressPercent: 85, status: 'IN_PROGRESS' },
  { id: 'syl-c10-phy-3', subject: 'Physics', chapter: 'Electricity', topic: 'Ohm\'s Law, Resistance in Series/Parallel & Joule\'s Heating', progressPercent: 90, status: 'IN_PROGRESS' },
  { id: 'syl-c10-phy-4', subject: 'Physics', chapter: 'Magnetic Effects of Electric Current', topic: 'Fleming\'s Left-Hand Rule & Solenoid', progressPercent: 75, status: 'IN_PROGRESS' },
  { id: 'syl-c10-chem-1', subject: 'Chemistry', chapter: 'Chemical Reactions and Equations', topic: 'Balancing, Redox & Corrosion/Rancidity', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-c10-chem-2', subject: 'Chemistry', chapter: 'Acids, Bases and Salts', topic: 'pH Scale, Bleaching Powder, Baking Soda & POP', progressPercent: 95, status: 'IN_PROGRESS' },
  { id: 'syl-c10-chem-3', subject: 'Chemistry', chapter: 'Metals and Non-Metals', topic: 'Reactivity Series, Ionic Bonds & Metallurgy', progressPercent: 80, status: 'IN_PROGRESS' },
  { id: 'syl-c10-chem-4', subject: 'Chemistry', chapter: 'Carbon and its Compounds', topic: 'Covalent Bonding, Catenation & Homologous Series', progressPercent: 70, status: 'IN_PROGRESS' },
  { id: 'syl-c10-math-1', subject: 'Mathematics', chapter: 'Real Numbers', topic: 'Fundamental Theorem of Arithmetic & HCF/LCM', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-c10-math-2', subject: 'Mathematics', chapter: 'Polynomials & Linear Equations', topic: 'Zeroes Relationship & Substitution/Elimination', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-c10-math-3', subject: 'Mathematics', chapter: 'Quadratic Equations & AP', topic: 'Quadratic Formula & nth Term/Sum of AP', progressPercent: 90, status: 'IN_PROGRESS' },
  { id: 'syl-c10-math-4', subject: 'Mathematics', chapter: 'Introduction to Trigonometry', topic: 'Trigonometric Ratios & Identities', progressPercent: 85, status: 'IN_PROGRESS' },
  { id: 'syl-c10-ai-1', subject: 'AI / Computer', chapter: 'CBSE AI Code 417', topic: 'AI Project Cycle & Ethics/Bias', progressPercent: 95, status: 'IN_PROGRESS' },
  { id: 'syl-c10-ai-2', subject: 'AI / Computer', chapter: 'Python & Computer Vision', topic: 'Python Lists, Loops & Image RGB Pixels', progressPercent: 90, status: 'IN_PROGRESS' },
  { id: 'syl-c10-eng-1', subject: 'English', chapter: 'First Flight (Prose & Poetry)', topic: 'A Letter to God, Nelson Mandela & Dust of Snow', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-c10-eng-2', subject: 'English', chapter: 'Footprints without Feet', topic: 'A Triumph of Surgery & The Thief\'s Story', progressPercent: 90, status: 'IN_PROGRESS' },
  { id: 'syl-c10-pe-1', subject: 'Physical Education', chapter: 'Physical Fitness & Surya Namaskar', topic: 'Cardiorespiratory Endurance & 12 Yoga Asanas', progressPercent: 100, status: 'COMPLETED' },
  { id: 'syl-c10-pe-2', subject: 'Physical Education', chapter: 'Health & Digestive Nutrition', topic: 'R.I.C.E. First Aid & Digestive Enzymes', progressPercent: 85, status: 'IN_PROGRESS' }
];
