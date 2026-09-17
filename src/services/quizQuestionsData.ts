import { QuizQuestion, QuizSubject, WeeklyTestSchedule } from '../types/quiz';

export interface AuthoritativeQuizQuestion extends QuizQuestion {
  correctOptionId: string;
  correctOptionKey: 'A' | 'B' | 'C' | 'D';
}

export const WEEKLY_TEST_SCHEDULES: WeeklyTestSchedule[] = [
  {
  "quizId": "quiz-2026-w36-science",
  "weekId": "w36",
  "weekLabel": "1st Week of September (01 - 07 Sep 2026)",
  "shortLabel": "1st Week of Sep (05 Sep)",
  "dateDisplay": "05 Sep 2026",
  "dateRange": "01 Sep - 07 Sep 2026",
  "title": "Class 12 Weekly Test • 1st Week of September",
  "subtitle": "Coulomb Law, Solid State Basics, Functions & Python Foundations",
  "status": "ARCHIVED" as const,
  "isCurrentWeek": false
},
  {
    quizId: 'quiz-2026-w37-science',
    weekId: 'w37',
    weekLabel: '2nd Week of September (08 - 14 Sep 2026)',
    shortLabel: '2nd Week of Sep (12 Sep)',
    dateDisplay: '12 Sep 2026',
    dateRange: '08 Sep – 14 Sep 2026',
    title: 'Class 12 Weekly Test • 2nd Week of September',
    subtitle: 'Electrostatics, Solutions, Relations & CBSE AI Foundations',
    status: 'ARCHIVED' as const,
    isCurrentWeek: false
  },
  {
    quizId: 'quiz-2026-w38-science',
    weekId: 'w38',
    weekLabel: '3rd Week of September (15 - 21 Sep 2026)',
    shortLabel: '3rd Week of Sep (17 Sep) • Current',
    dateDisplay: '17 Sep 2026',
    dateRange: '15 Sep – 21 Sep 2026',
    title: 'Sathi Quiz',
    subtitle: 'Weekly Academic Challenge (3rd Week of Sep)',
    status: 'ACTIVE' as const,
    isCurrentWeek: true
  },
  {
    quizId: 'quiz-2026-w39-science',
    weekId: 'w39',
    weekLabel: '4th Week of September (22 - 28 Sep 2026)',
    shortLabel: '4th Week of Sep (Upcoming)',
    dateDisplay: '24 Sep 2026',
    dateRange: '22 Sep – 28 Sep 2026',
    title: 'Class 12 Weekly Test • 4th Week of September',
    subtitle: 'Ray Optics, Haloalkanes, Calculus & NLP Vectorization',
    status: 'UPCOMING' as const,
    isCurrentWeek: false
  }
];

export const OFFICIAL_WEEKLY_QUIZ_CONFIG = {
  quizId: 'quiz-2026-w38-science',
  weekId: 'WEEK-2026-W38',
  weekLabel: '3rd Week of September (15 - 21 Sep 2026)',
  title: 'Sathi Quiz',
  subtitle: 'Weekly Academic Challenge (3rd Week of Sep)',
  classGrade: '12',
  stream: 'Science',
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
  } as Record<QuizSubject, number>,
  markingScheme: {
    marksPerCorrect: 4,
    negativeMarksPerWrong: 1,
    marksPerSkipped: 0
  },
  positiveMarks: 4,
  negativeMarks: 1,
  totalMarks: 200,
  status: 'ACTIVE' as const
};

export const OFFICIAL_50_QUESTIONS: AuthoritativeQuizQuestion[] = [
  // --- PHYSICS (10 questions) ---
  {
    id: 'q-phy-01',
    index: 1,
    subject: 'Physics',
    chapter: 'Electrostatics',
    topic: 'Coulomb\'s Law & Electric Flux',
    text: 'A point charge q is placed at the center of a cube of edge L. What is the total electric flux exiting through one face of the cube?',
    options: [
      { id: 'opt-p1-a', optionKey: 'A', text: 'q / ε₀' },
      { id: 'opt-p1-b', optionKey: 'B', text: 'q / (6ε₀)' },
      { id: 'opt-p1-c', optionKey: 'C', text: 'q / (4πε₀ L²)' },
      { id: 'opt-p1-d', optionKey: 'D', text: '6q / ε₀' }
    ],
    correctOptionId: 'opt-p1-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Physics, Chapter 1 (Electric Charges and Fields)',
    explanation: 'By Gauss\'s Law, total flux through the closed cubical surface is Φ = q / ε₀. Since the cube has 6 symmetric square faces, the flux through any single face is (1/6) of total flux: Φ_face = q / (6ε₀).'
  },
  {
    id: 'q-phy-02',
    index: 2,
    subject: 'Physics',
    chapter: 'Current Electricity',
    topic: 'Drift Velocity & Ohm\'s Law',
    text: 'When the potential difference applied across a conductor of length L is doubled, how does the drift velocity v_d of the conduction electrons change?',
    options: [
      { id: 'opt-p2-a', optionKey: 'A', text: 'Remains unchanged' },
      { id: 'opt-p2-b', optionKey: 'B', text: 'Becomes halved' },
      { id: 'opt-p2-c', optionKey: 'C', text: 'Is doubled' },
      { id: 'opt-p2-d', optionKey: 'D', text: 'Becomes four times' }
    ],
    correctOptionId: 'opt-p2-c',
    correctOptionKey: 'C',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physics, Chapter 3 (Current Electricity)',
    explanation: 'Drift velocity is given by v_d = (e E τ) / m = (e V τ) / (m L). Since drift velocity is directly proportional to applied potential difference V (v_d ∝ V), doubling the voltage doubles the drift velocity.'
  },
  {
    id: 'q-phy-03',
    index: 3,
    subject: 'Physics',
    chapter: 'Magnetism and Matter',
    topic: 'Biot-Savart Law',
    text: 'A circular coil of radius R carries a steady current I. The magnetic field at its center is B₀. At what axial distance from the center is the magnetic field B₀ / 8?',
    options: [
      { id: 'opt-p3-a', optionKey: 'A', text: 'x = R' },
      { id: 'opt-p3-b', optionKey: 'B', text: 'x = √2 R' },
      { id: 'opt-p3-c', optionKey: 'C', text: 'x = √3 R' },
      { id: 'opt-p3-d', optionKey: 'D', text: 'x = 2 R' }
    ],
    correctOptionId: 'opt-p3-c',
    correctOptionKey: 'C',
    difficulty: 'HARD',
    sourceReference: 'NCERT Class 12 Physics, Chapter 4 (Moving Charges and Magnetism)',
    explanation: 'Axial magnetic field is B = (μ₀ I R²) / [2(R² + x²)^(3/2)] = B₀ R³ / (R² + x²)^(3/2). Setting B = B₀ / 8 gives (R² + x²)^(3/2) = 8R³, leading to R² + x² = 4R² ⇒ x² = 3R² ⇒ x = √3 R.'
  },
  {
    id: 'q-phy-04',
    index: 4,
    subject: 'Physics',
    chapter: 'Electromagnetic Induction',
    topic: 'Lenz\'s Law & Conservation of Energy',
    text: 'Lenz\'s Law is a direct consequence of which fundamental conservation principle?',
    options: [
      { id: 'opt-p4-a', optionKey: 'A', text: 'Conservation of Charge' },
      { id: 'opt-p4-b', optionKey: 'B', text: 'Conservation of Energy' },
      { id: 'opt-p4-c', optionKey: 'C', text: 'Conservation of Momentum' },
      { id: 'opt-p4-d', optionKey: 'D', text: 'Conservation of Angular Momentum' }
    ],
    correctOptionId: 'opt-p4-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physics, Chapter 6 (Electromagnetic Induction)',
    explanation: 'Lenz\'s law states the induced EMF always opposes the change causing it. Mechanical work done against this opposing magnetic force is converted into electrical energy, fulfilling the Law of Conservation of Energy.'
  },
  {
    id: 'q-phy-05',
    index: 5,
    subject: 'Physics',
    chapter: 'Ray Optics',
    topic: 'Refraction & Critical Angle',
    text: 'A light ray passes from a denser medium (n = √2) into air. What is the critical angle θ_c for total internal reflection?',
    options: [
      { id: 'opt-p5-a', optionKey: 'A', text: '30°' },
      { id: 'opt-p5-b', optionKey: 'B', text: '45°' },
      { id: 'opt-p5-c', optionKey: 'C', text: '60°' },
      { id: 'opt-p5-d', optionKey: 'D', text: '90°' }
    ],
    correctOptionId: 'opt-p5-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Physics, Chapter 9 (Ray Optics and Optical Instruments)',
    explanation: 'From Snell\'s law at critical angle: sin(θ_c) = 1 / n = 1 / √2. Hence θ_c = arcsin(1 / √2) = 45°.'
  },
  {
    id: 'q-phy-06',
    index: 6,
    subject: 'Physics',
    chapter: 'Ray Optics',
    topic: 'Prisms & Minimum Deviation',
    text: 'An equilateral glass prism (A = 60°) has refractive index √3. What is the angle of minimum deviation D_m?',
    options: [
      { id: 'opt-p6-a', optionKey: 'A', text: '30°' },
      { id: 'opt-p6-b', optionKey: 'B', text: '45°' },
      { id: 'opt-p6-c', optionKey: 'C', text: '60°' },
      { id: 'opt-p6-d', optionKey: 'D', text: '90°' }
    ],
    correctOptionId: 'opt-p6-c',
    correctOptionKey: 'C',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Physics, Chapter 9 (Ray Optics)',
    explanation: 'Using prism formula: n = sin((A + D_m)/2) / sin(A/2). Here √3 = sin((60° + D_m)/2) / sin(30°) = 2 sin((60° + D_m)/2) ⇒ sin((60° + D_m)/2) = √3 / 2 ⇒ (60° + D_m)/2 = 60° ⇒ D_m = 60°.'
  },
  {
    id: 'q-phy-07',
    index: 7,
    subject: 'Physics',
    chapter: 'Wave Optics',
    topic: 'Young\'s Double Slit Experiment',
    text: 'In Young\'s double slit experiment, if the distance between slits d is halved and the screen distance D is doubled, fringe width β becomes:',
    options: [
      { id: 'opt-p7-a', optionKey: 'A', text: 'Halved' },
      { id: 'opt-p7-b', optionKey: 'B', text: 'Doubled' },
      { id: 'opt-p7-c', optionKey: 'C', text: 'Four times' },
      { id: 'opt-p7-d', optionKey: 'D', text: 'Unchanged' }
    ],
    correctOptionId: 'opt-p7-c',
    correctOptionKey: 'C',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physics, Chapter 10 (Wave Optics)',
    explanation: 'Fringe width is β = (λ D) / d. Replacing D → 2D and d → d/2 gives β\' = [λ (2D)] / (d/2) = 4 (λ D / d) = 4β.'
  },
  {
    id: 'q-phy-08',
    index: 8,
    subject: 'Physics',
    chapter: 'Dual Nature of Radiation',
    topic: 'Photoelectric Effect',
    text: 'If the frequency of incident light on a photosensitive metal surface is doubled, what happens to the maximum kinetic energy of the emitted photoelectrons?',
    options: [
      { id: 'opt-p8-a', optionKey: 'A', text: 'It is doubled' },
      { id: 'opt-p8-b', optionKey: 'B', text: 'It remains the same' },
      { id: 'opt-p8-c', optionKey: 'C', text: 'It becomes more than double' },
      { id: 'opt-p8-d', optionKey: 'D', text: 'It is quadrupled' }
    ],
    correctOptionId: 'opt-p8-c',
    correctOptionKey: 'C',
    difficulty: 'HARD',
    sourceReference: 'NCERT Class 12 Physics, Chapter 11 (Dual Nature of Radiation and Matter)',
    explanation: 'Einstein\'s equation: K_max = h ν - Φ₀. When frequency doubles to 2ν: K\'_max = 2 h ν - Φ₀ = 2(K_max + Φ₀) - Φ₀ = 2 K_max + Φ₀ > 2 K_max. Kinetic energy becomes more than double.'
  },
  {
    id: 'q-phy-09',
    index: 9,
    subject: 'Physics',
    chapter: 'Semiconductor Electronics',
    topic: 'p-n Junction Diode',
    text: 'Under forward bias conditions in a p-n junction diode, the width of the depletion layer and barrier potential:',
    options: [
      { id: 'opt-p9-a', optionKey: 'A', text: 'Both increase' },
      { id: 'opt-p9-b', optionKey: 'B', text: 'Both decrease' },
      { id: 'opt-p9-c', optionKey: 'C', text: 'Depletion width increases while barrier potential decreases' },
      { id: 'opt-p9-d', optionKey: 'D', text: 'Remain unchanged' }
    ],
    correctOptionId: 'opt-p9-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physics, Chapter 14 (Semiconductor Electronics)',
    explanation: 'In forward bias, external electric field opposes the built-in barrier field. Majority charge carriers are pushed toward the junction, causing the depletion region width and barrier potential (V₀ - V) to decrease.'
  },
  {
    id: 'q-phy-10',
    index: 10,
    subject: 'Physics',
    chapter: 'Electromagnetic Waves',
    topic: 'EM Wave Spectrum & Speed',
    text: 'In vacuum, which of the following electromagnetic waves possesses the shortest wavelength?',
    options: [
      { id: 'opt-p10-a', optionKey: 'A', text: 'Ultraviolet rays' },
      { id: 'opt-p10-b', optionKey: 'B', text: 'X-rays' },
      { id: 'opt-p10-c', optionKey: 'C', text: 'Gamma rays' },
      { id: 'opt-p10-d', optionKey: 'D', text: 'Microwaves' }
    ],
    correctOptionId: 'opt-p10-c',
    correctOptionKey: 'C',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physics, Chapter 8 (Electromagnetic Waves)',
    explanation: 'Gamma rays possess the highest frequency (> 10¹⁹ Hz) in the electromagnetic spectrum, and therefore the shortest wavelength (λ < 10⁻¹¹ m).'
  },
  // --- CHEMISTRY (10 questions) ---
  {
    id: 'q-chem-01',
    index: 11,
    subject: 'Chemistry',
    chapter: 'Solutions',
    topic: 'Raoult\'s Law & Colligative Properties',
    text: 'Which of the following aqueous solutions will exhibit the highest boiling point elevation at 1 atm?',
    options: [
      { id: 'opt-c1-a', optionKey: 'A', text: '0.1 M Glucose' },
      { id: 'opt-c1-b', optionKey: 'B', text: '0.1 M NaCl' },
      { id: 'opt-c1-c', optionKey: 'C', text: '0.1 M BaCl₂' },
      { id: 'opt-c1-d', optionKey: 'D', text: '0.1 M Al₂(SO₄)₃' }
    ],
    correctOptionId: 'opt-c1-d',
    correctOptionKey: 'D',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 1 (Solutions)',
    explanation: 'Boiling point elevation is ΔT_b = i K_b m. Van \'t Hoff factor i: Glucose (i=1), NaCl (i=2), BaCl₂ (i=3), Al₂(SO₄)₃ (i=5). Since Al₂(SO₄)₃ yields 5 ions in solution, it has the highest i and maximum boiling point elevation.'
  },
  {
    id: 'q-chem-02',
    index: 12,
    subject: 'Chemistry',
    chapter: 'Solutions',
    topic: 'Henry\'s Law',
    text: 'According to Henry\'s Law, the solubility of a gas in a liquid decreases with an increase in temperature because:',
    options: [
      { id: 'opt-c2-a', optionKey: 'A', text: 'Henry\'s law constant K_H decreases with temperature' },
      { id: 'opt-c2-b', optionKey: 'B', text: 'Dissolution of gas is an exothermic process (ΔH_sol < 0)' },
      { id: 'opt-c2-c', optionKey: 'C', text: 'Vapor pressure of solvent decreases' },
      { id: 'opt-c2-d', optionKey: 'D', text: 'Molar mass of the gas decreases' }
    ],
    correctOptionId: 'opt-c2-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 1 (Solutions)',
    explanation: 'Gas dissolution in liquid is an exothermic equilibrium process (ΔH < 0). By Le Chatelier\'s Principle, raising the temperature shifts equilibrium in the reverse direction, decreasing solubility.'
  },
  {
    id: 'q-chem-03',
    index: 13,
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    topic: 'Nernst Equation & Conductivity',
    text: 'The SI unit of molar conductivity Λ_m is:',
    options: [
      { id: 'opt-c3-a', optionKey: 'A', text: 'S cm⁻¹' },
      { id: 'opt-c3-b', optionKey: 'B', text: 'S m² mol⁻¹' },
      { id: 'opt-c3-c', optionKey: 'C', text: 'S⁻¹ m² mol' },
      { id: 'opt-c3-d', optionKey: 'D', text: 'Ω m² mol⁻¹' }
    ],
    correctOptionId: 'opt-c3-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 2 (Electrochemistry)',
    explanation: 'Molar conductivity is Λ_m = κ / c. With conductivity κ in S m⁻¹ and concentration c in mol m⁻³, the resulting SI unit is S m² mol⁻¹.'
  },
  {
    id: 'q-chem-04',
    index: 14,
    subject: 'Chemistry',
    chapter: 'Chemical Kinetics',
    topic: 'Order of Reaction & Half Life',
    text: 'For a first-order chemical reaction, if the initial concentration of reactant is doubled, the half-life period t₁/₂:',
    options: [
      { id: 'opt-c4-a', optionKey: 'A', text: 'Is doubled' },
      { id: 'opt-c4-b', optionKey: 'B', text: 'Is halved' },
      { id: 'opt-c4-c', optionKey: 'C', text: 'Remains unchanged' },
      { id: 'opt-c4-d', optionKey: 'D', text: 'Becomes four times' }
    ],
    correctOptionId: 'opt-c4-c',
    correctOptionKey: 'C',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 3 (Chemical Kinetics)',
    explanation: 'For first order reactions, half-life t₁/₂ = 0.693 / k. Because rate constant k is temperature-dependent and independent of concentration, t₁/₂ is completely independent of initial reactant concentration.'
  },
  {
    id: 'q-chem-05',
    index: 15,
    subject: 'Chemistry',
    chapter: 'd and f-Block Elements',
    topic: 'Transition Metals & Lanthanoid Contraction',
    text: 'The phenomenon of lanthanoid contraction is primarily attributed to:',
    options: [
      { id: 'opt-c5-a', optionKey: 'A', text: 'Poor shielding effect of 5d electrons' },
      { id: 'opt-c5-b', optionKey: 'B', text: 'Poor shielding effect of 4f electrons' },
      { id: 'opt-c5-c', optionKey: 'C', text: 'Increase in nuclear charge with effective 4f shielding' },
      { id: 'opt-c5-d', optionKey: 'D', text: 'Pairing of electrons in 4f subshell' }
    ],
    correctOptionId: 'opt-c5-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 4 (d and f Block Elements)',
    explanation: 'Due to the diffuse spatial shapes of 4f orbitals, their screening effect against the increasing nuclear charge is very poor, causing valence electrons to experience a greater effective nuclear pull and smaller atomic radius.'
  },
  {
    id: 'q-chem-06',
    index: 16,
    subject: 'Chemistry',
    chapter: 'Coordination Compounds',
    topic: 'IUPAC Nomenclature',
    text: 'What is the IUPAC name of [Co(NH₃)₅(CO₃)]Cl?',
    options: [
      { id: 'opt-c6-a', optionKey: 'A', text: 'Pentaamminecarbonatocobalt(III) chloride' },
      { id: 'opt-c6-b', optionKey: 'B', text: 'Carbonatopentaamminecobalt(II) chloride' },
      { id: 'opt-c6-c', optionKey: 'C', text: 'Pentaamminechlorocobalt(III) carbonate' },
      { id: 'opt-c6-d', optionKey: 'D', text: 'Pentaamminecarbonatocobalt(II) chloride' }
    ],
    correctOptionId: 'opt-c6-a',
    correctOptionKey: 'A',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 5 (Coordination Compounds)',
    explanation: 'Ligands are named in alphabetical order: \'ammine\' precedes \'carbonato\'. Cobalt oxidation number: x + 5(0) + (-2) + (-1) = 0 ⇒ x = +3. Hence the correct IUPAC name is Pentaamminecarbonatocobalt(III) chloride.'
  },
  {
    id: 'q-chem-07',
    index: 17,
    subject: 'Chemistry',
    chapter: 'Haloalkanes and Haloarenes',
    topic: 'SN1 vs SN2 Mechanisms',
    text: 'Which of the following alkyl halides undergoes nucleophilic substitution via the SN1 mechanism at the fastest rate?',
    options: [
      { id: 'opt-c7-a', optionKey: 'A', text: 'CH₃Br' },
      { id: 'opt-c7-b', optionKey: 'B', text: 'CH₃CH₂Br' },
      { id: 'opt-c7-c', optionKey: 'C', text: '(CH₃)₂CHBr' },
      { id: 'opt-c7-d', optionKey: 'D', text: '(CH₃)₃CBr' }
    ],
    correctOptionId: 'opt-c7-d',
    correctOptionKey: 'D',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 6 (Haloalkanes and Haloarenes)',
    explanation: 'The rate determining step in SN1 is the formation of carbocation intermediate. Tertiary (3°) carbocations are highly stabilized by hyperconjugation and +I effect, so (CH₃)₃CBr reacts fastest.'
  },
  {
    id: 'q-chem-08',
    index: 18,
    subject: 'Chemistry',
    chapter: 'Alcohols, Phenols and Ethers',
    topic: 'Reimer-Tiemann Reaction',
    text: 'Treatment of phenol with chloroform (CHCl₃) and aqueous NaOH followed by acidification yields salicylaldehyde. The reactive electrophilic intermediate is:',
    options: [
      { id: 'opt-c8-a', optionKey: 'A', text: 'Carbocation (⁺CHCl₂)' },
      { id: 'opt-c8-b', optionKey: 'B', text: 'Dichlorocarbene (:CCl₂)' },
      { id: 'opt-c8-c', optionKey: 'C', text: 'Carbon dioxide (CO₂)' },
      { id: 'opt-c8-d', optionKey: 'D', text: 'Trichloromethyl radical (·CCl₃)' }
    ],
    correctOptionId: 'opt-c8-b',
    correctOptionKey: 'B',
    difficulty: 'HARD',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 7 (Alcohols, Phenols and Ethers)',
    explanation: 'In Reimer-Tiemann reaction, hydroxide ion removes an acidic proton from chloroform followed by alpha-elimination of chloride, generating the neutral electron-deficient dichlorocarbene (:CCl₂) electrophile.'
  },
  {
    id: 'q-chem-09',
    index: 19,
    subject: 'Chemistry',
    chapter: 'Aldehydes, Ketones & Carboxylic Acids',
    topic: 'Cannizzaro Reaction',
    text: 'Which of the following compounds will undergo the Cannizzaro reaction when treated with concentrated NaOH?',
    options: [
      { id: 'opt-c9-a', optionKey: 'A', text: 'Acetaldehyde (CH₃CHO)' },
      { id: 'opt-c9-b', optionKey: 'B', text: 'Formaldehyde (HCHO)' },
      { id: 'opt-c9-c', optionKey: 'C', text: 'Acetone (CH₃COCH₃)' },
      { id: 'opt-c9-d', optionKey: 'D', text: 'Propionaldehyde (CH₃CH₂CHO)' }
    ],
    correctOptionId: 'opt-c9-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 8 (Aldehydes, Ketones and Carboxylic Acids)',
    explanation: 'Aldehydes lacking alpha-hydrogens undergo self-oxidation and reduction (disproportionation) in concentrated alkali. Formaldehyde (HCHO) has no alpha-hydrogens and produces methanol and sodium formate.'
  },
  {
    id: 'q-chem-10',
    index: 20,
    subject: 'Chemistry',
    chapter: 'Biomolecules',
    topic: 'Nucleic Acids',
    text: 'Which nitrogenous base is present in RNA but absent in DNA?',
    options: [
      { id: 'opt-c10-a', optionKey: 'A', text: 'Thymine' },
      { id: 'opt-c10-b', optionKey: 'B', text: 'Uracil' },
      { id: 'opt-c10-c', optionKey: 'C', text: 'Cytosine' },
      { id: 'opt-c10-d', optionKey: 'D', text: 'Guanine' }
    ],
    correctOptionId: 'opt-c10-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Chemistry, Chapter 10 (Biomolecules)',
    explanation: 'DNA contains Adenine, Guanine, Cytosine, and Thymine. RNA replaces Thymine with Uracil, which pairs with Adenine.'
  },
  // --- MATHEMATICS (10 questions) ---
  {
    id: 'q-math-01',
    index: 21,
    subject: 'Mathematics',
    chapter: 'Relations and Functions',
    topic: 'Equivalence Relations',
    text: 'Let set A = {1, 2, 3}. What is the total number of equivalence relations that can be defined on A?',
    options: [
      { id: 'opt-m1-a', optionKey: 'A', text: '3' },
      { id: 'opt-m1-b', optionKey: 'B', text: '5' },
      { id: 'opt-m1-c', optionKey: 'C', text: '8' },
      { id: 'opt-m1-d', optionKey: 'D', text: '9' }
    ],
    correctOptionId: 'opt-m1-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 1 (Relations and Functions)',
    explanation: 'The number of equivalence relations on a set with n elements equals the Bell number B_n. For n = 3: B₃ = 5. The five distinct partitions of {1, 2, 3} generate exactly 5 equivalence relations.'
  },
  {
    id: 'q-math-02',
    index: 22,
    subject: 'Mathematics',
    chapter: 'Inverse Trigonometric Functions',
    topic: 'Principal Value Branch',
    text: 'The principal value of arccos(-1/2) is:',
    options: [
      { id: 'opt-m2-a', optionKey: 'A', text: '-π / 3' },
      { id: 'opt-m2-b', optionKey: 'B', text: 'π / 3' },
      { id: 'opt-m2-c', optionKey: 'C', text: '2π / 3' },
      { id: 'opt-m2-d', optionKey: 'D', text: '4π / 3' }
    ],
    correctOptionId: 'opt-m2-c',
    correctOptionKey: 'C',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 2 (Inverse Trigonometric Functions)',
    explanation: 'The principal value branch of arccos(x) is [0, π]. Since arccos(-x) = π - arccos(x), we have arccos(-1/2) = π - π/3 = 2π / 3.'
  },
  {
    id: 'q-math-03',
    index: 23,
    subject: 'Mathematics',
    chapter: 'Matrices',
    topic: 'Adjoint & Determinant Properties',
    text: 'If A is a square matrix of order 3 x 3 with determinant |A| = 4, then what is the value of |adj(A)|?',
    options: [
      { id: 'opt-m3-a', optionKey: 'A', text: '4' },
      { id: 'opt-m3-b', optionKey: 'B', text: '12' },
      { id: 'opt-m3-c', optionKey: 'C', text: '16' },
      { id: 'opt-m3-d', optionKey: 'D', text: '64' }
    ],
    correctOptionId: 'opt-m3-c',
    correctOptionKey: 'C',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 4 (Determinants)',
    explanation: 'For any n x n matrix A, |adj(A)| = |A|^(n - 1). Here n = 3 and |A| = 4, yielding |adj(A)| = 4^(3 - 1) = 4² = 16.'
  },
  {
    id: 'q-math-04',
    index: 24,
    subject: 'Mathematics',
    chapter: 'Continuity and Differentiability',
    topic: 'Logarithmic Differentiation',
    text: 'If y = x^x (where x > 0), what is dy/dx?',
    options: [
      { id: 'opt-m4-a', optionKey: 'A', text: 'x · x^(x - 1)' },
      { id: 'opt-m4-b', optionKey: 'B', text: 'x^x ln(x)' },
      { id: 'opt-m4-c', optionKey: 'C', text: 'x^x (1 + ln(x))' },
      { id: 'opt-m4-d', optionKey: 'D', text: 'x^x (1 - ln(x))' }
    ],
    correctOptionId: 'opt-m4-c',
    correctOptionKey: 'C',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 5 (Continuity and Differentiability)',
    explanation: 'Taking natural log: ln(y) = x ln(x). Differentiating: (1/y)(dy/dx) = ln(x) + x(1/x) = ln(x) + 1. Multiplying by y = x^x gives dy/dx = x^x (1 + ln(x)).'
  },
  {
    id: 'q-math-05',
    index: 25,
    subject: 'Mathematics',
    chapter: 'Application of Derivatives',
    topic: 'Tangents & Slopes',
    text: 'At what point on the curve y = x² - 4x + 5 is the tangent line parallel to the x-axis?',
    options: [
      { id: 'opt-m5-a', optionKey: 'A', text: '(2, 1)' },
      { id: 'opt-m5-b', optionKey: 'B', text: '(0, 5)' },
      { id: 'opt-m5-c', optionKey: 'C', text: '(4, 5)' },
      { id: 'opt-m5-d', optionKey: 'D', text: '(1, 2)' }
    ],
    correctOptionId: 'opt-m5-a',
    correctOptionKey: 'A',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 6 (Application of Derivatives)',
    explanation: 'Slope of tangent is dy/dx = 2x - 4. Setting dy/dx = 0 (horizontal line parallel to x-axis): 2x - 4 = 0 ⇒ x = 2. When x = 2, y = (2)² - 4(2) + 5 = 1. The point is (2, 1).'
  },
  {
    id: 'q-math-06',
    index: 26,
    subject: 'Mathematics',
    chapter: 'Integrals',
    topic: 'Properties of Definite Integrals',
    text: 'Evaluate the definite integral from -π/2 to π/2 of sin⁷(x) dx:',
    options: [
      { id: 'opt-m6-a', optionKey: 'A', text: '0' },
      { id: 'opt-m6-b', optionKey: 'B', text: '1' },
      { id: 'opt-m6-c', optionKey: 'C', text: 'π / 2' },
      { id: 'opt-m6-d', optionKey: 'D', text: '16 / 35' }
    ],
    correctOptionId: 'opt-m6-a',
    correctOptionKey: 'A',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 7 (Integrals)',
    explanation: 'Let f(x) = sin⁷(x). Since f(-x) = sin⁷(-x) = (-sin(x))⁷ = -sin⁷(x) = -f(x), f(x) is an odd function. The definite integral of an odd function across symmetric limits [-a, a] is identically 0.'
  },
  {
    id: 'q-math-07',
    index: 27,
    subject: 'Mathematics',
    chapter: 'Differential Equations',
    topic: 'Order and Degree',
    text: 'What are the order and degree of the differential equation [1 + (dy/dx)²]^(3/2) = d²y/dx²?',
    options: [
      { id: 'opt-m7-a', optionKey: 'A', text: 'Order = 1, Degree = 3' },
      { id: 'opt-m7-b', optionKey: 'B', text: 'Order = 2, Degree = 2' },
      { id: 'opt-m7-c', optionKey: 'C', text: 'Order = 2, Degree = 1' },
      { id: 'opt-m7-d', optionKey: 'D', text: 'Order = 2, Degree is not defined' }
    ],
    correctOptionId: 'opt-m7-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 9 (Differential Equations)',
    explanation: 'Squaring both sides removes the fractional power: [1 + (dy/dx)²]³ = (d²y/dx²)². The highest derivative is d²y/dx² (order 2) and its exponent is 2 (degree 2).'
  },
  {
    id: 'q-math-08',
    index: 28,
    subject: 'Mathematics',
    chapter: 'Vectors',
    topic: 'Vector Products',
    text: 'If |a x b| = a · b for non-zero vectors a and b, then what is the angle θ between them?',
    options: [
      { id: 'opt-m8-a', optionKey: 'A', text: '0°' },
      { id: 'opt-m8-b', optionKey: 'B', text: '45°' },
      { id: 'opt-m8-c', optionKey: 'C', text: '60°' },
      { id: 'opt-m8-d', optionKey: 'D', text: '90°' }
    ],
    correctOptionId: 'opt-m8-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 10 (Vector Algebra)',
    explanation: '|a x b| = ab sin(θ) and a · b = ab cos(θ). Setting them equal: ab sin(θ) = ab cos(θ) ⇒ tan(θ) = 1 ⇒ θ = 45° (or π/4 radians).'
  },
  {
    id: 'q-math-09',
    index: 29,
    subject: 'Mathematics',
    chapter: 'Three Dimensional Geometry',
    topic: 'Direction Cosines & Angle Between Lines',
    text: 'The angle between the lines with direction ratios (1, 1, 2) and (√3 - 1, -√3 - 1, 4) is:',
    options: [
      { id: 'opt-m9-a', optionKey: 'A', text: '30°' },
      { id: 'opt-m9-b', optionKey: 'B', text: '45°' },
      { id: 'opt-m9-c', optionKey: 'C', text: '60°' },
      { id: 'opt-m9-d', optionKey: 'D', text: '90°' }
    ],
    correctOptionId: 'opt-m9-c',
    correctOptionKey: 'C',
    difficulty: 'HARD',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 11 (Three Dimensional Geometry)',
    explanation: 'cos(θ) = [1(√3 - 1) + 1(-√3 - 1) + 2(4)] / [√(1 + 1 + 4) · √(4 - 2√3 + 4 + 2√3 + 16)] = 6 / [√6 · √24] = 6 / 12 = 1/2. Thus θ = 60°.'
  },
  {
    id: 'q-math-10',
    index: 30,
    subject: 'Mathematics',
    chapter: 'Probability',
    topic: 'Conditional Probability & Unions',
    text: 'If P(A) = 0.4, P(B) = 0.8, and P(B|A) = 0.6, what is the value of P(A ∪ B)?',
    options: [
      { id: 'opt-m10-a', optionKey: 'A', text: '0.96' },
      { id: 'opt-m10-b', optionKey: 'B', text: '0.84' },
      { id: 'opt-m10-c', optionKey: 'C', text: '0.72' },
      { id: 'opt-m10-d', optionKey: 'D', text: '0.60' }
    ],
    correctOptionId: 'opt-m10-a',
    correctOptionKey: 'A',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Mathematics, Chapter 13 (Probability)',
    explanation: 'P(A ∩ B) = P(A) · P(B|A) = 0.4 · 0.6 = 0.24. Then P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.4 + 0.8 - 0.24 = 0.96.'
  },
  // --- AI / COMPUTER (5 questions - CBSE Code 843 / CS 083) ---
  {
    id: 'q-ai-01',
    index: 31,
    subject: 'AI / Computer',
    chapter: 'CBSE AI Code 843',
    topic: 'Machine Learning & Evaluation Metrics',
    text: 'In classification algorithms, what does the F1-score represent?',
    options: [
      { id: 'opt-ai1-a', optionKey: 'A', text: 'Arithmetic mean of Precision and Recall' },
      { id: 'opt-ai1-b', optionKey: 'B', text: 'Harmonic mean of Precision and Recall' },
      { id: 'opt-ai1-c', optionKey: 'C', text: 'Ratio of True Positives to Total Predictions' },
      { id: 'opt-ai1-d', optionKey: 'D', text: 'Geometric mean of Accuracy and Sensitivity' }
    ],
    correctOptionId: 'opt-ai1-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'CBSE Class 12 Artificial Intelligence (Subject Code 843) Curriculum',
    explanation: 'The F1-score is the harmonic mean of Precision and Recall: F1 = 2 · (Precision · Recall) / (Precision + Recall). It provides a robust evaluation metric when class imbalance is present.'
  },
  {
    id: 'q-ai-02',
    index: 32,
    subject: 'AI / Computer',
    chapter: 'CBSE AI Code 843',
    topic: 'Computer Vision & CNNs',
    text: 'In a Convolutional Neural Network (CNN), what is the primary role of a MaxPooling layer?',
    options: [
      { id: 'opt-ai2-a', optionKey: 'A', text: 'To perform gradient backpropagation' },
      { id: 'opt-ai2-b', optionKey: 'B', text: 'To downsample spatial dimensions while retaining dominant features' },
      { id: 'opt-ai2-c', optionKey: 'C', text: 'To initialize weights of convolutional filters' },
      { id: 'opt-ai2-d', optionKey: 'D', text: 'To convert negative pixel values into positive numbers' }
    ],
    correctOptionId: 'opt-ai2-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'CBSE Class 12 AI Curriculum, Unit 2 (Computer Vision)',
    explanation: 'Pooling layers (such as MaxPooling) downsample feature maps by extracting the maximum activation within a receptive field, reducing spatial dimensionality and parameter count.'
  },
  {
    id: 'q-ai-03',
    index: 33,
    subject: 'AI / Computer',
    chapter: 'Python Data Science',
    topic: 'Pandas & DataFrame Operations',
    text: 'In Python\'s Pandas library, which function is used to filter out rows containing missing or NaN values?',
    options: [
      { id: 'opt-ai3-a', optionKey: 'A', text: 'df.remove_null()' },
      { id: 'opt-ai3-b', optionKey: 'B', text: 'df.dropna()' },
      { id: 'opt-ai3-c', optionKey: 'C', text: 'df.strip_na()' },
      { id: 'opt-ai3-d', optionKey: 'D', text: 'df.clean()' }
    ],
    correctOptionId: 'opt-ai3-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Informatics Practices / Computer Science',
    explanation: 'In Pandas, DataFrame.dropna() removes rows (or columns) that contain missing or NaN values, whereas fillna() substitutes them with specified values.'
  },
  {
    id: 'q-ai-04',
    index: 34,
    subject: 'AI / Computer',
    chapter: 'Natural Language Processing',
    topic: 'Tokenization & TF-IDF',
    text: 'What does the \'IDF\' term in the TF-IDF text vectorization model stand for and measure?',
    options: [
      { id: 'opt-ai4-a', optionKey: 'A', text: 'Internal Data File; measures file encoding size' },
      { id: 'opt-ai4-b', optionKey: 'B', text: 'Inverse Document Frequency; downweights words that appear across all documents' },
      { id: 'opt-ai4-c', optionKey: 'C', text: 'Indexed Dictionary Function; counts total words in a corpus' },
      { id: 'opt-ai4-d', optionKey: 'D', text: 'Input Data Format; checks syntax validity' }
    ],
    correctOptionId: 'opt-ai4-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'CBSE Class 12 AI Curriculum, Unit 3 (Natural Language Processing)',
    explanation: 'Inverse Document Frequency (IDF) is calculated as log(N / n_t). It reduces the weight of common stop words appearing in all documents and amplifies domain-specific distinctive terms.'
  },
  {
    id: 'q-ai-05',
    index: 35,
    subject: 'AI / Computer',
    chapter: 'AI Ethics & Society',
    topic: 'Algorithmic Bias',
    text: 'When an AI recruitment model consistently favors male candidates over female candidates due to historical training resumes, this is an example of:',
    options: [
      { id: 'opt-ai5-a', optionKey: 'A', text: 'Data Drift' },
      { id: 'opt-ai5-b', optionKey: 'B', text: 'Historical Training Bias' },
      { id: 'opt-ai5-c', optionKey: 'C', text: 'Overfitting due to high learning rate' },
      { id: 'opt-ai5-d', optionKey: 'D', text: 'Hardware latency error' }
    ],
    correctOptionId: 'opt-ai5-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'CBSE Class 12 AI Curriculum, Unit 4 (AI Ethics)',
    explanation: 'Historical training bias occurs when historical inequities and prejudices present in past training datasets are learned and reproduced by machine learning models.'
  },

  // --- ENGLISH (10 questions) ---
  {
    id: 'q-eng-01',
    index: 36,
    subject: 'English',
    chapter: 'Flamingo — The Last Lesson',
    topic: 'Alphonse Daudet Themes',
    text: 'In Alphonse Daudet\'s story \'The Last Lesson\', what order had come from Berlin that shocked the village of Alsace?',
    options: [
      { id: 'opt-e1-a', optionKey: 'A', text: 'To close all schools in Alsace and Lorraine' },
      { id: 'opt-e1-b', optionKey: 'B', text: 'To teach only German in the schools of Alsace and Lorraine' },
      { id: 'opt-e1-c', optionKey: 'C', text: 'To conscript all young boys into the Prussian army' },
      { id: 'opt-e1-d', optionKey: 'D', text: 'To replace the village mayor with a Prussian officer' }
    ],
    correctOptionId: 'opt-e1-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 English Core (Flamingo, Chapter 1)',
    explanation: 'The order from Berlin mandated that only German be taught in the schools of Alsace and Lorraine, signaling the tragic suppression of their mother tongue.'
  },
  {
    id: 'q-eng-02',
    index: 37,
    subject: 'English',
    chapter: 'Flamingo — Lost Spring',
    topic: 'Anees Jung Themes',
    text: 'What does author Anees Jung describe as the perpetual state of poverty in Seemapuri through ragpicker Saheb-e-Alam?',
    options: [
      { id: 'opt-e2-a', optionKey: 'A', text: 'Garbage to them is gold and their daily bread' },
      { id: 'opt-e2-b', optionKey: 'B', text: 'They strive to move to industrial manufacturing hubs' },
      { id: 'opt-e2-c', optionKey: 'C', text: 'They refuse schooling because they prefer farming' },
      { id: 'opt-e2-d', optionKey: 'D', text: 'They are legally barred from seeking citizenship' }
    ],
    correctOptionId: 'opt-e2-a',
    correctOptionKey: 'A',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 English Core (Flamingo, Chapter 2)',
    explanation: 'In Lost Spring, garbage is described as \'gold\' to the ragpickers because it provides daily bread and shelter, representing survival for the impoverished families of Seemapuri.'
  },
  {
    id: 'q-eng-03',
    index: 38,
    subject: 'English',
    chapter: 'Flamingo — Deep Water',
    topic: 'William Douglas — Overcoming Fear',
    text: 'In \'Deep Water\', which psychological realization helped William Douglas ultimately conquer his aquaphobia?',
    options: [
      { id: 'opt-e3-a', optionKey: 'A', text: 'Avoiding deep lakes entirely' },
      { id: 'opt-e3-b', optionKey: 'B', text: '\'All we have to fear is fear itself\'' },
      { id: 'opt-e3-c', optionKey: 'C', text: 'Relying exclusively on life jackets' },
      { id: 'opt-e3-d', optionKey: 'D', text: 'Moving to inland California' }
    ],
    correctOptionId: 'opt-e3-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 English Core (Flamingo, Chapter 3)',
    explanation: 'Douglas recalls President Roosevelt\'s memorable words: \'All we have to fear is fear itself\', realizing that peace exists in death while fear resides in the anticipation of terror.'
  },
  {
    id: 'q-eng-04',
    index: 39,
    subject: 'English',
    chapter: 'Grammar — Tenses and Modals',
    topic: 'Subject-Verb Agreement',
    text: 'Choose the grammatically correct option:\n\'Neither the principal nor the teachers _______ present at yesterday\'s ceremony.\'',
    options: [
      { id: 'opt-e4-a', optionKey: 'A', text: 'was' },
      { id: 'opt-e4-b', optionKey: 'B', text: 'were' },
      { id: 'opt-e4-c', optionKey: 'C', text: 'is' },
      { id: 'opt-e4-d', optionKey: 'D', text: 'are' }
    ],
    correctOptionId: 'opt-e4-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'CBSE Class 12 Applied Grammar Syllabus',
    explanation: 'With the correlative conjunction \'neither... nor\', the verb agrees with the closer subject (\'the teachers\', which is plural). Since the context is past tense (\'yesterday\'), \'were\' is correct.'
  },
  {
    id: 'q-eng-05',
    index: 40,
    subject: 'English',
    chapter: 'Grammar — Active and Passive Voice',
    topic: 'Voice Transformation',
    text: 'Convert into Passive Voice:\n\'The committee has approved the revised CBSE syllabus.\'',
    options: [
      { id: 'opt-e5-a', optionKey: 'A', text: 'The revised CBSE syllabus is approved by the committee.' },
      { id: 'opt-e5-b', optionKey: 'B', text: 'The revised CBSE syllabus had been approved by the committee.' },
      { id: 'opt-e5-c', optionKey: 'C', text: 'The revised CBSE syllabus has been approved by the committee.' },
      { id: 'opt-e5-d', optionKey: 'D', text: 'The revised CBSE syllabus was approved by the committee.' }
    ],
    correctOptionId: 'opt-e5-c',
    correctOptionKey: 'C',
    difficulty: 'EASY',
    sourceReference: 'CBSE Class 12 Applied Grammar',
    explanation: 'Present perfect active (\'has approved\') converts to \'has/have + been + past participle\' in passive voice: \'The revised CBSE syllabus has been approved by the committee.\''
  },
  {
    id: 'q-eng-06',
    index: 41,
    subject: 'English',
    chapter: 'Grammar — Reported Speech',
    topic: 'Direct to Indirect Speech',
    text: 'Change to indirect speech:\nHe said to me, \'Where did you find this antique pen?\'',
    options: [
      { id: 'opt-e6-a', optionKey: 'A', text: 'He asked me where I had found that antique pen.' },
      { id: 'opt-e6-b', optionKey: 'B', text: 'He asked me where did I find this antique pen.' },
      { id: 'opt-e6-c', optionKey: 'C', text: 'He inquired me that where I found that antique pen.' },
      { id: 'opt-e6-d', optionKey: 'D', text: 'He told me where I had found this antique pen.' }
    ],
    correctOptionId: 'opt-e6-a',
    correctOptionKey: 'A',
    difficulty: 'MEDIUM',
    sourceReference: 'CBSE Class 12 English Grammar',
    explanation: 'For questions starting with wh-words, \'said to\' changes to \'asked\', simple past (\'did you find\') changes to past perfect (\'had found\'), and \'this\' becomes \'that\'.'
  },
  {
    id: 'q-eng-07',
    index: 42,
    subject: 'English',
    chapter: 'Poetry — My Mother at Sixty-Six',
    topic: 'Kamala Das — Poetic Devices',
    text: 'In Kamala Das\'s poem \'My Mother at Sixty-Six\', the imagery of \'trees sprinting\' represents:',
    options: [
      { id: 'opt-e7-a', optionKey: 'A', text: 'A storm approaching the airport' },
      { id: 'opt-e7-b', optionKey: 'B', text: 'The rapid passage of youth and vitality in contrast to aging' },
      { id: 'opt-e7-c', optionKey: 'C', text: 'The speed of her motor vehicle' },
      { id: 'opt-e7-d', optionKey: 'D', text: 'Her mother\'s childhood recollections' }
    ],
    correctOptionId: 'opt-e7-b',
    correctOptionKey: 'B',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 English Core (Flamingo Poetry, Poem 1)',
    explanation: 'The sprinting young trees symbolize energy, exuberance, and youth sprinting away, creating a contrast with the poet\'s frail, motionless mother.'
  },
  {
    id: 'q-eng-08',
    index: 43,
    subject: 'English',
    chapter: 'Writing Skills',
    topic: 'Official Letters & Notice Format',
    text: 'Which element is strictly MANDATORY at the top of a formal Notice for a school board?',
    options: [
      { id: 'opt-e8-a', optionKey: 'A', text: 'Sender\'s personal residential address' },
      { id: 'opt-e8-b', optionKey: 'B', text: 'Name of the issuing Institution / Organization and the word NOTICE' },
      { id: 'opt-e8-c', optionKey: 'C', text: 'Complimentary close (Yours faithfully)' },
      { id: 'opt-e8-d', optionKey: 'D', text: 'Detailed salutation to individual readers' }
    ],
    correctOptionId: 'opt-e8-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'CBSE Class 12 Writing Skills Guidelines',
    explanation: 'CBSE format stipulates that the Name of the Issuing School / Organization must appear prominently at the very top, followed by the centered title NOTICE and the date of issue.'
  },
  {
    id: 'q-eng-09',
    index: 44,
    subject: 'English',
    chapter: 'Vistas — The Tiger King',
    topic: 'Kalki — Satire on Autocracy',
    text: 'What is the dramatic irony at the conclusion of Kalki\'s satire \'The Tiger King\'?',
    options: [
      { id: 'opt-e9-a', optionKey: 'A', text: 'The Maharaja dies peacefully of old age' },
      { id: 'opt-e9-b', optionKey: 'B', text: 'The Maharaja is assassinated by a British general' },
      { id: 'opt-e9-c', optionKey: 'C', text: 'The Maharaja is killed by infection from a crude wooden toy tiger' },
      { id: 'opt-e9-d', optionKey: 'D', text: 'The hundredth live tiger kills the Maharaja in combat' }
    ],
    correctOptionId: 'opt-e9-c',
    correctOptionKey: 'C',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 English Supplementary (Vistas, Chapter 2)',
    explanation: 'Having ruthlessly hunted 99 wild tigers, the Maharaja dies from an infection caused by a tiny wooden sliver from an inexpensive toy tiger, fulfilling the prophecy through supreme dramatic irony.'
  },
  {
    id: 'q-eng-10',
    index: 45,
    subject: 'English',
    chapter: 'Vocabulary & Idiomatic Usage',
    topic: 'Synonyms and Contextual Meaning',
    text: 'Select the word that is most nearly OPPOSITE in meaning to \'EPHEMERAL\':',
    options: [
      { id: 'opt-e10-a', optionKey: 'A', text: 'Transient' },
      { id: 'opt-e10-b', optionKey: 'B', text: 'Perpetual' },
      { id: 'opt-e10-c', optionKey: 'C', text: 'Fleeting' },
      { id: 'opt-e10-d', optionKey: 'D', text: 'Momentary' }
    ],
    correctOptionId: 'opt-e10-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'CBSE Vocabulary Enrichment Module',
    explanation: '\'Ephemeral\' denotes fleeting, short-lived existence. Its direct antonym is \'Perpetual\', which means enduring continuously or indefinitely.'
  },
  // --- PHYSICAL EDUCATION (5 questions) ---
  {
    id: 'q-pe-01',
    index: 46,
    subject: 'Physical Education',
    chapter: 'Management of Sporting Events',
    topic: 'Tournament Fixtures & Knockout System',
    text: 'In a single elimination (knockout) tournament with 11 teams, how many total byes must be allocated in the first round?',
    options: [
      { id: 'opt-pe1-a', optionKey: 'A', text: '3 byes' },
      { id: 'opt-pe1-b', optionKey: 'B', text: '5 byes' },
      { id: 'opt-pe1-c', optionKey: 'C', text: '6 byes' },
      { id: 'opt-pe1-d', optionKey: 'D', text: '7 byes' }
    ],
    correctOptionId: 'opt-pe1-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physical Education, Chapter 1 (Planning in Sports)',
    explanation: 'Total byes = 2ⁿ - N, where 2ⁿ is the next higher power of 2 above team count N. For N = 11, the next power of 2 is 16. Hence byes = 16 - 11 = 5 byes.'
  },
  {
    id: 'q-pe-02',
    index: 47,
    subject: 'Physical Education',
    chapter: 'Children & Women in Sports',
    topic: 'Postural Deformities',
    text: 'Which postural deformity is characterized by an abnormal inward curvature of the lumbar spine (swayback)?',
    options: [
      { id: 'opt-pe2-a', optionKey: 'A', text: 'Kyphosis' },
      { id: 'opt-pe2-b', optionKey: 'B', text: 'Lordosis' },
      { id: 'opt-pe2-c', optionKey: 'C', text: 'Scoliosis' },
      { id: 'opt-pe2-d', optionKey: 'D', text: 'Knock Knees' }
    ],
    correctOptionId: 'opt-pe2-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physical Education, Chapter 2 (Children & Women in Sports)',
    explanation: 'Lordosis represents an exaggerated inward curve of the lumbar vertebrae. Kyphosis refers to outward curvature of the thoracic spine (hump), and Scoliosis is lateral side-to-side curvature.'
  },
  {
    id: 'q-pe-03',
    index: 48,
    subject: 'Physical Education',
    chapter: 'Yoga as Preventive Measure',
    topic: 'Asanas for Lifestyle Diseases',
    text: 'Which of the following asanas is particularly effective and recommended for managing Diabetes Mellitus by stimulating the pancreas?',
    options: [
      { id: 'opt-pe3-a', optionKey: 'A', text: 'Mandukasana (Frog Pose)' },
      { id: 'opt-pe3-b', optionKey: 'B', text: 'Tadasana (Mountain Pose)' },
      { id: 'opt-pe3-c', optionKey: 'C', text: 'Shavasana (Corpse Pose)' },
      { id: 'opt-pe3-d', optionKey: 'D', text: 'Vrikshasana (Tree Pose)' }
    ],
    correctOptionId: 'opt-pe3-a',
    correctOptionKey: 'A',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physical Education, Chapter 3 (Yoga & Lifestyle)',
    explanation: 'Mandukasana (Frog Pose) exerts direct compression on the abdomen and abdominal viscera, massaging the pancreas to promote insulin secretion.'
  },
  {
    id: 'q-pe-04',
    index: 49,
    subject: 'Physical Education',
    chapter: 'Biomechanics and Sports',
    topic: 'Newton\'s Laws of Motion in Sports',
    text: 'A high jumper bending their knees upon landing on the cushioned pit relies on which principle to reduce impact force?',
    options: [
      { id: 'opt-pe4-a', optionKey: 'A', text: 'Increasing time of contact to reduce rate of change of momentum (F = Δp / Δt)' },
      { id: 'opt-pe4-b', optionKey: 'B', text: 'Eliminating gravitational acceleration' },
      { id: 'opt-pe4-c', optionKey: 'C', text: 'Newton\'s First Law of Inertia exclusively' },
      { id: 'opt-pe4-d', optionKey: 'D', text: 'Maximizing air resistance during flight' }
    ],
    correctOptionId: 'opt-pe4-a',
    correctOptionKey: 'A',
    difficulty: 'MEDIUM',
    sourceReference: 'NCERT Class 12 Physical Education, Chapter 8 (Biomechanics & Sports)',
    explanation: 'Under Newton\'s Second Law (F = Δp / Δt), flexing the knees increases the duration Δt of momentum change, drastically reducing the impact force F transferred to the athlete\'s joints.'
  },
  {
    id: 'q-pe-05',
    index: 50,
    subject: 'Physical Education',
    chapter: 'Training in Sports',
    topic: 'Principles of Sports Training',
    text: 'The ability of a muscle or muscle group to perform repeated contractions against resistance over an extended period is known as:',
    options: [
      { id: 'opt-pe5-a', optionKey: 'A', text: 'Maximum Strength' },
      { id: 'opt-pe5-b', optionKey: 'B', text: 'Strength Endurance' },
      { id: 'opt-pe5-c', optionKey: 'C', text: 'Explosive Strength' },
      { id: 'opt-pe5-d', optionKey: 'D', text: 'Flexibility' }
    ],
    correctOptionId: 'opt-pe5-b',
    correctOptionKey: 'B',
    difficulty: 'EASY',
    sourceReference: 'NCERT Class 12 Physical Education, Chapter 10 (Training in Sports)',
    explanation: 'Strength endurance is defined as the physiological capability of muscles to endure fatigue while continuously exerting force against resistance.'
  }
];
