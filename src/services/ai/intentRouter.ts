/**
 * Study Sathi 2.0 Centralized Intent Router & Context Resolution Engine
 * 
 * Rules:
 * 1. Converts every user query + conversation history into a structured semantic request.
 * 2. Strict Context Firewall: Prevents unrelated previous context from leaking into new requests.
 * 3. Semantic Pronoun & Follow-up Resolution: Resolves "this", "that", "it", "above", "do the same for..."
 * 4. Clear distinction between NEW_IMAGE, EDIT_IMAGE, TRANSFORM_CONTENT, and EDUCATIONAL_SHEETS.
 * 5. Strictly isolates academic templates (Class 12 formulas) from general image requests (red apple).
 */

export type PrimaryIntent =
  | 'TEXT'
  | 'MATH'
  | 'IMAGE_GENERATION'
  | 'IMAGE_EDIT'
  | 'VISION'
  | 'DOCUMENT'
  | 'STUDY_PLAN';

export type SubIntent =
  | 'NEW_IMAGE'
  | 'EDIT_IMAGE'
  | 'TRANSFORM_CONTENT'
  | 'NEW_EDUCATIONAL_SHEET'
  | 'CONCEPT_EXPLANATION'
  | 'STEP_BY_STEP_SOLVE'
  | 'REVISION_PLAN'
  | 'CODE_ASSIST'
  | 'GENERAL_CONVERSATION';

export interface StructuredIntent {
  intent: PrimaryIntent;
  subIntent: SubIntent;
  isEducational: boolean;
  subject: string | null;
  classLevel: string | null;
  topic: string;
  requestedContent: string;
  style: 'handwritten' | 'clean' | 'minimal' | 'infographic' | null;
  format: 'A4' | 'standard' | 'square';
  aspectRatio: string;
  referencesCurrentContext: boolean;
  referenceType: 'PREVIOUS_IMAGE' | 'PREVIOUS_FORMULA' | 'PREVIOUS_EXPLANATION' | 'NONE';
  sourceMessageId?: string;
  resolvedSourceContent?: string | null;
  mustUsePreviousContext: boolean;
  negativeExclusions: string[];
  complexityScore: number; // 0 to 100
  confidence: number;
}

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  id?: string;
}

export interface RouteOptions {
  query: string;
  history?: ConversationTurn[];
  hasFiles?: boolean;
  hasImages?: boolean;
  hasPdfs?: boolean;
  studentGrade?: string;
}

/**
 * Route and structure every incoming user message
 */
export function routeUserIntent(options: RouteOptions): StructuredIntent {
  const {
    query,
    history = [],
    hasFiles = false,
    hasImages = false,
    hasPdfs = false,
    studentGrade = '12'
  } = options;

  const q = query.trim();
  const qLower = q.toLowerCase();

  // Find most recent assistant and user messages for context resolution
  const previousTurns = [...history].reverse();
  const lastAssistantTurn = previousTurns.find(t => t.role === 'model');
  const lastUserTurn = previousTurns.find(t => t.role === 'user');

  // 1. Detect explicit contextual reset keywords ("completely new", "new image", "start over", "reset")
  const isExplicitReset = (
    qLower.includes('completely new') ||
    qLower.includes('brand new') ||
    qLower.startsWith('new image') ||
    qLower.includes('fresh image') ||
    qLower.includes('different image') ||
    qLower.includes('start fresh') ||
    qLower.includes('new topic')
  );

  // 2. Detect Pronoun & Context Reference Keywords
  const hasPronounReference = (
    /\b(this|that|it|these|those|above|previous|the same|same as)\b/i.test(qLower)
  );

  // 3. Detect Image Generation Verbs & Phrases
  const hasImageVerbs = /\b(generate|create|draw|make|sketch|illustrate|render|produce|design)\b/i.test(qLower);
  const hasImageNouns = /\b(image|picture|diagram|poster|sheet|photo|illustration|drawing|visual|graphic|artwork)\b/i.test(qLower);
  const isDirectImagePhrase = /\b(image of|picture of|drawing of|illustration of|diagram of|photo of|poster of|handwritten a4|handwritten sheet|handwritten notes)\b/i.test(qLower);
  const isDrawCommand = /^\s*(draw|sketch|illustrate|paint)\b/i.test(qLower);

  // Check if user is asking to "transform this into an A4 sheet / printable format"
  const isTransformToSheet = (
    hasPronounReference &&
    /\b(a4|sheet|printable|notes|page|format)\b/i.test(qLower) &&
    /\b(implement|make|convert|turn|put|format|create)\b/i.test(qLower)
  );

  // Check if user is asking to edit a previous image
  const isImageEdit = (
    (
      qLower.includes('modify') ||
      qLower.includes('change') ||
      qLower.includes('make it') ||
      qLower.includes('make the') ||
      qLower.includes('edit') ||
      qLower.includes('turn it') ||
      qLower.includes('color it')
    ) &&
    (
      qLower.includes('image') ||
      qLower.includes('picture') ||
      qLower.includes('photo') ||
      qLower.includes('background') ||
      qLower.includes('blue') ||
      qLower.includes('red') ||
      qLower.includes('color')
    ) &&
    (Boolean(lastAssistantTurn?.imageUrl) || hasPronounReference || qLower.includes('previous'))
  );

  // 4. Academic Subject & Topic Detection
  let detectedSubject: string | null = null;
  let detectedClassLevel: string | null = null;
  let detectedTopic = '';
  let isEducational = false;

  // Class level detection
  if (qLower.includes('class 11') || qLower.includes('11th') || qLower.includes('class xi') || qLower.includes('grade 11')) {
    detectedClassLevel = 'Class 11';
  } else if (qLower.includes('class 12') || qLower.includes('12th') || qLower.includes('class xii') || qLower.includes('grade 12')) {
    detectedClassLevel = 'Class 12';
  } else if (qLower.includes('class 10') || qLower.includes('10th') || qLower.includes('class x') || qLower.includes('grade 10')) {
    detectedClassLevel = 'Class 10';
  } else if (qLower.includes('class 9') || qLower.includes('9th') || qLower.includes('class ix') || qLower.includes('grade 9')) {
    detectedClassLevel = 'Class 9';
  }

  // Check Mathematics topics
  if (qLower.includes('relation') || qLower.includes('function') || qLower.includes('injective') || qLower.includes('surjective') || qLower.includes('bijective') || qLower.includes('equivalence relation')) {
    detectedSubject = 'Mathematics';
    detectedTopic = 'Relations and Functions';
    isEducational = true;
    if (!detectedClassLevel) detectedClassLevel = 'Class 12';
  } else if (qLower.includes('determinant') || qLower.includes('cramer') || qLower.includes('minors') || qLower.includes('cofactors')) {
    detectedSubject = 'Mathematics';
    detectedTopic = 'Determinants';
    isEducational = true;
    if (!detectedClassLevel) detectedClassLevel = 'Class 12';
  } else if (qLower.includes('matri') || qLower.includes('matrix')) {
    detectedSubject = 'Mathematics';
    detectedTopic = 'Matrices';
    isEducational = true;
    if (!detectedClassLevel) detectedClassLevel = qLower.includes('12') ? 'Class 12' : 'Class 11';
  } else if (qLower.includes('calculus') || qLower.includes('integrat') || qLower.includes('integral') || qLower.includes('∫') || qLower.includes('dx')) {
    detectedSubject = 'Mathematics';
    detectedTopic = 'Integration Formulas';
    isEducational = true;
    if (!detectedClassLevel) detectedClassLevel = 'Class 12';
  } else if (qLower.includes('differentiat') || qLower.includes('derivative') || qLower.includes('d/dx')) {
    detectedSubject = 'Mathematics';
    detectedTopic = 'Differentiation Formulas';
    isEducational = true;
    if (!detectedClassLevel) detectedClassLevel = 'Class 12';
  } else if (qLower.includes('math') || qLower.includes('algebra') || qLower.includes('trigonometr') || qLower.includes('vector') || qLower.includes('probability')) {
    detectedSubject = 'Mathematics';
    detectedTopic = 'Mathematics';
    isEducational = true;
  }
  // Check Chemistry topics
  else if (
    qLower.includes('alcohol') || qLower.includes('phenol') || qLower.includes('ether') ||
    qLower.includes('aldehyde') || qLower.includes('ketone') || qLower.includes('chemistry') ||
    qLower.includes('reaction') || qLower.includes('grignard') || qLower.includes('organic') ||
    qLower.includes('periodic') || qLower.includes('acid')
  ) {
    detectedSubject = 'Chemistry';
    isEducational = true;
    if (qLower.includes('alcohol')) detectedTopic = 'Alcohols & Their Reactions';
    else if (qLower.includes('phenol')) detectedTopic = 'Phenols & Ethers';
    else detectedTopic = 'Chemistry Reactions & Formulas';
    if (!detectedClassLevel) detectedClassLevel = 'Class 12';
  }
  // Check Physics topics
  else if (
    qLower.includes('physics') || qLower.includes('electrostatic') || qLower.includes('coulomb') ||
    qLower.includes('optics') || qLower.includes('current') || qLower.includes('magnetic') ||
    qLower.includes('thermodynamics') || qLower.includes('kinematics') || qLower.includes('capacitance')
  ) {
    detectedSubject = 'Physics';
    isEducational = true;
    if (qLower.includes('electrostatic') || qLower.includes('coulomb')) detectedTopic = 'Electrostatics';
    else if (qLower.includes('optics')) detectedTopic = 'Ray Optics';
    else detectedTopic = 'Physics Principles & Formulas';
    if (!detectedClassLevel) detectedClassLevel = 'Class 12';
  }
  // Check general academic study indicators
  else if (
    qLower.includes('exam') || qLower.includes('cbse') || qLower.includes('ncert') ||
    qLower.includes('jee') || qLower.includes('revision plan') || qLower.includes('study sheet') ||
    qLower.includes('formula sheet') || qLower.includes('question paper') || qLower.includes('syllabus')
  ) {
    isEducational = true;
    detectedTopic = 'Academic Study Notes';
  }

  // 5. Check if query is purely a general non-academic image request (e.g. "red apple on a white background")
  // If no educational keywords are present and user asks for an image, it is STRICTLY NON-EDUCATIONAL!
  const hasFormulaKeywords = qLower.includes('formula') || qLower.includes('study sheet') || qLower.includes('revision') || qLower.includes('derivation');
  if (!isEducational && !hasFormulaKeywords) {
    // Pure general image (e.g. apple, dog, futuristic city, car, mountain)
    detectedSubject = null;
    detectedClassLevel = null;
    detectedTopic = q.replace(/^(generate|create|draw|make|render|sketch)\s+(an?|the|some)?\s*(completely\s+)?(new\s+)?(image\s+of|picture\s+of)?/i, '').trim();
  }

  // 6. Format and Style Resolution
  const isHandwritten = (
    qLower.includes('handwritten') ||
    qLower.includes('student notes') ||
    qLower.includes('pen and paper') ||
    qLower.includes('ruled sheet') ||
    qLower.includes('notebook')
  );

  const isA4 = qLower.includes('a4') || qLower.includes('printable') || qLower.includes('portrait');
  const style: StructuredIntent['style'] = isHandwritten ? 'handwritten' : (qLower.includes('minimal') ? 'minimal' : (qLower.includes('infographic') ? 'infographic' : 'clean'));
  const format: StructuredIntent['format'] = isA4 ? 'A4' : 'standard';
  const aspectRatio = isA4 ? 'A4 portrait' : '1:1';

  // 7. Context Resolution & Semantic References
  let referencesCurrentContext = false;
  let referenceType: StructuredIntent['referenceType'] = 'NONE';
  let resolvedSourceContent: string | null = null;
  let mustUsePreviousContext = false;
  let sourceMessageId: string | undefined = undefined;

  if (isExplicitReset) {
    // Reset firewall: Zero context carryover
    referencesCurrentContext = false;
    referenceType = 'NONE';
    mustUsePreviousContext = false;
  } else if (isImageEdit && lastAssistantTurn?.imageUrl) {
    referencesCurrentContext = true;
    referenceType = 'PREVIOUS_IMAGE';
    mustUsePreviousContext = true;
    sourceMessageId = lastAssistantTurn.id;
  } else if (isTransformToSheet && lastAssistantTurn?.text) {
    // Transform previous text/math into an A4 sheet
    referencesCurrentContext = true;
    referenceType = 'PREVIOUS_FORMULA';
    mustUsePreviousContext = true;
    resolvedSourceContent = lastAssistantTurn.text;
    sourceMessageId = lastAssistantTurn.id;

    // Inherit subject & topic from previous assistant turn if current query does not override it
    if (!detectedSubject && (lastAssistantTurn.text.includes('integral') || lastAssistantTurn.text.includes('Integration'))) {
      detectedSubject = 'Mathematics';
      detectedTopic = 'Integration Formulas';
      isEducational = true;
      if (!detectedClassLevel) detectedClassLevel = 'Class 12';
    }
  } else if (hasPronounReference && (qLower.includes('do the same for') || qLower.includes('same for'))) {
    // Style/format preserved, but topic replaced
    referencesCurrentContext = true;
    referenceType = 'PREVIOUS_EXPLANATION';
    mustUsePreviousContext = true;
  }

  // 8. Determine Primary Intent & SubIntent
  let intent: PrimaryIntent = 'TEXT';
  let subIntent: SubIntent = 'GENERAL_CONVERSATION';

  if (hasPdfs) {
    intent = 'DOCUMENT';
    subIntent = 'STEP_BY_STEP_SOLVE';
  } else if (hasImages) {
    intent = 'VISION';
    subIntent = 'STEP_BY_STEP_SOLVE';
  } else if (isImageEdit) {
    intent = 'IMAGE_EDIT';
    subIntent = 'EDIT_IMAGE';
  } else if (isTransformToSheet) {
    intent = 'IMAGE_GENERATION';
    subIntent = 'TRANSFORM_CONTENT';
  } else if ((hasImageVerbs && hasImageNouns) || isDirectImagePhrase || isDrawCommand) {
    intent = 'IMAGE_GENERATION';
    subIntent = isEducational ? 'NEW_EDUCATIONAL_SHEET' : 'NEW_IMAGE';
  } else if (qLower.includes('revision plan') || qLower.includes('7-day') || qLower.includes('timetable') || qLower.includes('schedule')) {
    intent = 'STUDY_PLAN';
    subIntent = 'REVISION_PLAN';
  } else if (detectedSubject === 'Mathematics' || qLower.includes('solve') || qLower.includes('calculate') || qLower.includes('derivative') || qLower.includes('integral')) {
    intent = 'MATH';
    subIntent = qLower.includes('explain') ? 'CONCEPT_EXPLANATION' : 'STEP_BY_STEP_SOLVE';
  } else if (qLower.includes('explain') || qLower.includes('what is') || qLower.includes('define') || qLower.includes('summary')) {
    intent = 'TEXT';
    subIntent = 'CONCEPT_EXPLANATION';
  }

  // 9. Construct Strict Negative Exclusion List to prevent topic cross-contamination
  const negativeExclusions: string[] = [];
  if (intent === 'IMAGE_GENERATION' || intent === 'IMAGE_EDIT') {
    if (!isEducational) {
      // General non-educational image (e.g. red apple)
      negativeExclusions.push(
        'no formulas',
        'no mathematics',
        'no calculus',
        'no integration',
        'no matrices',
        'no educational text',
        'no student notes',
        'no Class 12 branding',
        'no study sheet',
        'no ruled paper texture unless explicitly requested',
        'no textbook graphics'
      );
    } else {
      // Educational image: topic isolation
      if (detectedTopic.includes('Relations and Functions')) {
        negativeExclusions.push(
          'no integration',
          'no calculus',
          'no differentiation',
          'no matrices',
          'no determinants',
          'no physics formulas',
          'no chemistry formulas'
        );
      } else if (detectedTopic.includes('Determinants')) {
        negativeExclusions.push(
          'no integration',
          'no calculus',
          'no differentiation',
          'no matrices unless required by determinants',
          'no physics formulas'
        );
      } else if (detectedTopic.includes('Matrices')) {
        negativeExclusions.push(
          'no integration',
          'no calculus',
          'no differentiation',
          'no determinants unless required by matrix adjoint'
        );
      } else if (detectedSubject === 'Chemistry') {
        negativeExclusions.push(
          'no mathematics formulas',
          'no integration',
          'no physics formulas'
        );
      }
      negativeExclusions.push('no SmartX branding', 'no Study Sathi branding', 'no PVM branding');
    }
  }

  // 10. Complexity Scoring (0 to 100)
  let complexity = 20;
  if (intent === 'IMAGE_GENERATION' || intent === 'IMAGE_EDIT') complexity = 50;
  if (hasImages || hasPdfs) complexity += 30;
  if (qLower.includes('jee') || qLower.includes('olympiad') || qLower.includes('difficult') || qLower.includes('rigorous proof')) complexity += 40;
  if (qLower.includes('derive') || qLower.includes('step by step') || qLower.includes('revision plan')) complexity += 25;
  if (q.length > 200) complexity += 15;
  const complexityScore = Math.min(100, complexity);

  return {
    intent,
    subIntent,
    isEducational,
    subject: detectedSubject,
    classLevel: detectedClassLevel,
    topic: detectedTopic || (isEducational ? `${detectedClassLevel || 'Class 12'} ${detectedSubject || 'Study Notes'}` : q),
    requestedContent: q,
    style,
    format,
    aspectRatio,
    referencesCurrentContext,
    referenceType,
    sourceMessageId,
    resolvedSourceContent,
    mustUsePreviousContext,
    negativeExclusions,
    complexityScore,
    confidence: 0.98
  };
}
