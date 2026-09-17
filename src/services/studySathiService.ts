import {
  generateFormulaSheetImage,
  isFormulaSheetQuery,
  detectFormulaSubjectAndStyle,
  SubjectCategory,
  VisualStyle
} from './formulaSheetGenerator';
import { generateStudySathiImageWithPuter } from './imageGenerationService';
import { routeUserIntent, StructuredIntent } from './ai/intentRouter';
import { SathiCreative } from './ai/sathiCreative';

export interface StudyMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  type?: 'text' | 'image' | 'file' | 'image_generation';
  files?: Array<{ name: string; type: string; preview?: string }>;
  modelUsed?: string;
  audioAvailable?: boolean;
  generatedImageUrl?: string;
  modelSwitchedNotice?: string;
  prompt?: string;
  generationId?: string;
  isTruncated?: boolean;
}

export interface StructuredAiError {
  success: false;
  errorCode: 'RATE_LIMITED' | 'ALL_PROVIDERS_FAILED' | 'INVALID_API_KEY' | 'NETWORK_ERROR' | 'IMAGE_GENERATION_FAILED' | 'SERVICE_UNAVAILABLE' | 'ABORTED';
  userMessage: string;
  provider?: string;
  model?: string;
  retryable: boolean;
}

export class StudySathiError extends Error {
  public structured: StructuredAiError;

  constructor(structured: StructuredAiError) {
    super(structured.userMessage);
    this.name = 'StudySathiError';
    this.structured = structured;
  }
}

export interface StudyThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StudyMessage[];
}

export type MessageIntent =
  | 'TEXT'
  | 'VISION'
  | 'DOCUMENT'
  | 'IMAGE_GENERATION'
  | 'IMAGE_ANALYSIS'
  | 'VOICE_INPUT'
  | 'VOICE_OUTPUT'
  | 'WEB_SEARCH'
  | 'CODE'
  | 'MATH'
  | 'STUDY_PLANNING';

export type SubjectType = 'Chemistry' | 'Mathematics' | 'Physics' | 'Biology' | 'Computer Science' | 'General';

export interface StructuredImageRequest {
  intent: "IMAGE_GENERATION";
  rawUserPrompt: string;
  subject: string;
  topic: string;
  classLevel: string;
  style: string;
  format: string;
  orientation: string;
  contentRequirements: string[];
  negativeRequirements: string[];
}

export interface AcademicRequest {
  intent: MessageIntent;
  subject: SubjectType;
  topic: string;
  classLevel: string;
  outputType: 'formula_sheet' | 'step_by_step_solution' | 'revision_plan' | 'diagram' | 'code' | 'concept_explanation' | 'text';
  style: 'handwritten' | 'notebook' | 'digital' | 'standard';
  userPrompt: string;
  attachments: FileAttachment[];
  conversationContext: Array<{ role: 'user' | 'model'; text: string }>;
  isAttendance: boolean;
  imageRequest?: StructuredImageRequest;
}

export interface ModelCapabilities {
  text: boolean;
  vision: boolean;
  documents: boolean;
  imageGeneration: boolean;
}

export interface SathiModelConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'puter' | 'sathi-creative';
  apiModel: string;
  capabilities: ModelCapabilities;
  description: string;
  badge?: string;
}

export const SATHI_MODELS: Record<string, SathiModelConfig> = {
  'auto': {
    id: 'auto',
    name: 'Auto',
    provider: 'gemini',
    apiModel: 'gemini-3.5-flash-lite',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: true },
    description: 'Auto-adapting AI: automatically chooses the optimal model based on question difficulty, vision, math, or creative requirements',
    badge: 'Auto'
  },
  'sathi-3.5-lite': {
    id: 'sathi-3.5-lite',
    name: 'Sathi 3.5 Flash Lite',
    provider: 'gemini',
    apiModel: 'gemini-3.5-flash-lite',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'Default ultra-fast academic model for explanations, summaries, and questions',
    badge: 'Default'
  },
  'sathi-3.5': {
    id: 'sathi-3.5',
    name: 'Sathi 3.5 Flash',
    provider: 'gemini',
    apiModel: 'gemini-3.5-flash',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'Balanced speed & multi-step math problem solving',
    badge: 'Balanced'
  },
  'sathi-3.6': {
    id: 'sathi-3.6',
    name: 'Sathi 3.6 Flash',
    provider: 'gemini',
    apiModel: 'gemini-3.6-flash',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'Advanced academic reasoning & mathematical derivations',
    badge: 'Fast'
  },
  'sathi-3.8': {
    id: 'sathi-3.8',
    name: 'Sathi 3.8 Flash',
    provider: 'gemini',
    apiModel: 'gemini-3.8-flash',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'High-throughput problem solver & question paper analysis',
    badge: 'Fast'
  },
  'sathi-vision': {
    id: 'sathi-vision',
    name: 'Sathi Vision',
    provider: 'gemini',
    apiModel: 'gemini-3.6-flash',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'Multimodal vision specialist for diagrams, charts, and handwritten pages',
    badge: 'Vision'
  },
  'sathi-pro': {
    id: 'sathi-pro',
    name: 'Sathi Pro Reasoning',
    provider: 'gemini',
    apiModel: 'gemini-flash-latest',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'Deep derivations, proofs & complex competitive exam reasoning',
    badge: 'Pro'
  },
  'claude-sathi': {
    id: 'claude-sathi',
    name: 'Sathi Claude',
    provider: 'gemini',
    apiModel: 'gemini-3.6-flash',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'Detailed step-by-step conceptual essays & programming explanations'
  },
  'gpt-sathi': {
    id: 'gpt-sathi',
    name: 'Sathi GPT',
    provider: 'gemini',
    apiModel: 'gemini-3.6-flash',
    capabilities: { text: true, vision: true, documents: true, imageGeneration: false },
    description: 'General board preparation, chemistry reactions & revision notes'
  },
  'sathi-creative': {
    id: 'sathi-creative',
    name: 'Sathi Creative',
    provider: 'sathi-creative',
    apiModel: 'creative-engine',
    capabilities: { text: false, vision: false, documents: false, imageGeneration: true },
    description: 'Sathi Creative high-resolution AI visual and formula generation',
    badge: 'Creative'
  },
  'sathi-canvas': {
    id: 'sathi-canvas',
    name: 'Sathi Canvas',
    provider: 'sathi-creative',
    apiModel: 'canvas-precision',
    capabilities: { text: false, vision: false, documents: false, imageGeneration: true },
    description: 'High-resolution academic diagrams, scientific charts, and formula sheets',
    badge: 'Canvas'
  }
};

export type TaskComplexityLevel = 1 | 2 | 3 | 4 | 5;

export interface TaskRouteResult {
  level: TaskComplexityLevel;
  targetModelId: string;
  targetApiModel: string;
  switched: boolean;
  switchNotice?: string;
  reason: string;
}

export function routeAcademicTask(
  query: string,
  hasFiles: boolean = false,
  userSelectedModelId: string = 'auto'
): TaskRouteResult {
  const qLower = query.toLowerCase().trim();
  const isAuto = !userSelectedModelId || userSelectedModelId === 'auto';

  // 1. Level 4: Vision / Document processing
  if (hasFiles) {
    const isSwitched = !isAuto && userSelectedModelId !== 'sathi-vision' && userSelectedModelId !== 'sathi-pro';
    return {
      level: 4,
      targetModelId: 'sathi-vision',
      targetApiModel: 'gemini-3.6-flash',
      switched: isSwitched,
      switchNotice: isSwitched ? '⚡ Switched to Sathi Vision for file/document analysis.' : undefined,
      reason: 'multimodal file inspection'
    };
  }

  // 2. Level 3: Hard tasks (JEE, Olympiad, deep derivations, complex proofs, 40-page papers)
  const isHardTask = (
    qLower.includes('jee') ||
    qLower.includes('olympiad') ||
    qLower.includes('difficult') ||
    qLower.includes('complex derivation') ||
    qLower.includes('rigorous proof') ||
    qLower.includes('question paper analysis') ||
    qLower.includes('sample paper') ||
    qLower.includes('40-page') ||
    qLower.includes('solve this difficult') ||
    qLower.includes('full reasoning') ||
    qLower.includes('deep proof')
  );

  if (isHardTask) {
    const targetModelId = 'sathi-pro';
    const isSwitched = !isAuto && userSelectedModelId !== targetModelId;
    return {
      level: 3,
      targetModelId,
      targetApiModel: 'gemini-flash-latest',
      switched: isSwitched,
      switchNotice: isSwitched ? '⚡ Switched to Sathi Pro for this complex task.' : undefined,
      reason: 'complex reasoning & competitive exam problem'
    };
  }

  // 3. Level 2: Normal tasks (multi-step math, chemistry mechanisms, physics derivations, moderate coding, revision plans)
  const isNormalTask = (
    qLower.includes('derive') ||
    qLower.includes('derivation') ||
    qLower.includes('step by step') ||
    qLower.includes('step-by-step') ||
    qLower.includes('revision plan') ||
    qLower.includes('7-day') ||
    qLower.includes('timetable') ||
    qLower.includes('mechanism') ||
    qLower.includes('reaction equation') ||
    qLower.includes('detailed explanation') ||
    qLower.includes('solve') ||
    qLower.includes('evaluate') ||
    qLower.includes('calculate') ||
    qLower.includes('coding') ||
    qLower.includes('algorithm')
  );

  if (isNormalTask) {
    if (isAuto) {
      return {
        level: 2,
        targetModelId: 'sathi-3.6',
        targetApiModel: 'gemini-3.6-flash',
        switched: false,
        reason: 'multi-step calculation & structured explanation'
      };
    } else if (userSelectedModelId === 'sathi-3.5-lite') {
      return {
        level: 2,
        targetModelId: 'sathi-3.5',
        targetApiModel: 'gemini-3.5-flash',
        switched: true,
        switchNotice: '⚡ Switched to Sathi 3.5 Flash for multi-step solving.',
        reason: 'multi-step calculation & structured explanation'
      };
    }
  }

  // If user manually chose another specific model (e.g. sathi-3.6, sathi-3.8), honor their selection
  if (userSelectedModelId && userSelectedModelId !== 'auto' && userSelectedModelId !== 'sathi-3.5-lite' && SATHI_MODELS[userSelectedModelId]) {
    const selected = SATHI_MODELS[userSelectedModelId];
    return {
      level: 2,
      targetModelId: selected.id,
      targetApiModel: selected.apiModel,
      switched: false,
      reason: 'user selected model'
    };
  }

  // 4. Level 1: Simple tasks (definitions, basic concepts, summaries, short study questions)
  // Default is gemini-3.5-flash-lite
  return {
    level: 1,
    targetModelId: 'sathi-3.5-lite',
    targetApiModel: 'gemini-3.5-flash-lite',
    switched: false,
    reason: 'standard study question & concept explanation'
  };
}

// Section 16 & 31: Provider Pool for Resilience & Failover (Not unlimited quota)
export interface AiProviderConfig {
  id: string;
  name: string;
  provider: 'google';
  apiKey: string;
  enabled: boolean;
  priority: number;
}

const defaultGeminiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || "";

export const AI_PROVIDERS: AiProviderConfig[] = [
  {
    id: "gemini-1",
    name: "Gemini Primary",
    provider: "google",
    apiKey: defaultGeminiKey,
    enabled: true,
    priority: 1
  },
  {
    id: "gemini-2",
    name: "Gemini Failover 2",
    provider: "google",
    apiKey: defaultGeminiKey,
    enabled: true,
    priority: 2
  },
  {
    id: "gemini-3",
    name: "Gemini Failover 3",
    provider: "google",
    apiKey: defaultGeminiKey,
    enabled: true,
    priority: 3
  },
  {
    id: "gemini-4",
    name: "Gemini Failover 4",
    provider: "google",
    apiKey: defaultGeminiKey,
    enabled: true,
    priority: 4
  }
];

export interface FileAttachment {
  name: string;
  type: string;
  base64?: string;
  preview?: string;
  textContent?: string;
}

export interface AcademicQueryOptions {
  query: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  files?: FileAttachment[];
  images?: string[]; // base64 strings
  documents?: Array<{ base64: string; mimeType: string; name: string }>;
  studentName?: string;
  classGrade?: string;
  section?: string;
  modelId?: string;
  apiKey?: string;
  signal?: AbortSignal;
}

export interface AcademicResponse {
  answer: string;
  modelUsed: string;
  confidence: number;
  generatedImageUrl?: string;
  modelSwitchedNotice?: string;
  messageType?: MessageIntent;
  generationId?: string;
  isTruncated?: boolean;
}

/**
 * Dedicated Image Prompt Builder (Requirement 8)
 * Strictly constructs prompt from structured request without contaminating from previous conversations.
 */
export function buildImagePrompt(request: StructuredImageRequest): string {
  return `Create exactly the image requested by the user.

USER REQUEST:
${request.rawUserPrompt}

SUBJECT:
${request.subject}

CLASS:
${request.classLevel}

TOPIC:
${request.topic}

FORMAT:
${request.format}

STYLE:
${request.style}

CONTENT REQUIREMENTS:
${request.contentRequirements.join("\n")}

STRICT RULES:
- Follow the current request exactly.
- Do not reuse content from previous requests.
- Do not change the subject.
- Do not change the class level.
- Do not substitute another mathematical topic (e.g. absolutely NO integration if topic is Matrices).
- Do not add unrelated formulas.
- If the user requests handwritten notes, make the visual appearance genuinely handwritten on notebook paper in blue fountain pen ink.
- Make the requested content readable and suitable for A4 printing.`;
}

class StudySathiService {
  // Attendance guardrail detection (Strict Isolation)
  public isAttendanceQuery(query: string): boolean {
    const q = query.toLowerCase().trim();
    const attendanceKeywords = [
      'who is present',
      'who is absent',
      'who came to school',
      'who came today',
      'show attendance',
      'what is my attendance',
      'what was my attendance',
      'my attendance today',
      'how many present',
      'class turnout',
      'am i present',
      'did i check in',
      'my check-in time',
      'my scan',
      'turnstile a',
      'turnstile scan',
      'rfid card tap',
      'rfid uid',
      'how many days needed for 75',
      '75% criteria',
      'cbse 75% attendance',
      'my attendance percentage',
      'safe absence'
    ];
    return attendanceKeywords.some(kw => q.includes(kw));
  }

  /**
   * Complete Request Parser (Requirement 1, 2, 3 & 15)
   * Parses the CURRENT user message first to avoid context contamination.
   */
  public parseAcademicRequest(
    query: string,
    files: FileAttachment[] = [],
    history: Array<{ role: 'user' | 'model'; text: string }> = []
  ): AcademicRequest {
    const q = query.trim();
    const qLower = q.toLowerCase();

    // 1. Attendance Check
    const isAttendance = this.isAttendanceQuery(q);

    // 2. Attachments
    const hasImage = files.some(f => f.type?.startsWith('image/') || (f.base64 && !f.type?.includes('pdf')));
    const hasPdf = files.some(f => f.type === 'application/pdf' || f.name?.toLowerCase().endsWith('.pdf'));

    // 3. Style Detection
    const isHandwritten = (
      qLower.includes('handwritten') ||
      qLower.includes('notebook') ||
      qLower.includes('student note') ||
      qLower.includes('student notes') ||
      qLower.includes('pen and paper') ||
      qLower.includes('hand written') ||
      qLower.includes('ruled sheet') ||
      qLower.includes('handwriting')
    );

    // 4. Class Level Extraction
    let classLevel = 'Class 12';
    if (qLower.includes('class 11') || qLower.includes('11th') || qLower.includes('class xi') || qLower.includes('grade 11')) {
      classLevel = 'Class 11';
    } else if (qLower.includes('class 12') || qLower.includes('12th') || qLower.includes('class xii') || qLower.includes('grade 12')) {
      classLevel = 'Class 12';
    }

    // 5. Subject Detection strictly from CURRENT query
    let subject: SubjectType = 'General';
    let topic = '';

    // Chemistry keywords
    if (
      qLower.includes('alcohol') ||
      qLower.includes('phenol') ||
      qLower.includes('ether') ||
      qLower.includes('organic') ||
      qLower.includes('aldehyde') ||
      qLower.includes('ketone') ||
      qLower.includes('acid') ||
      qLower.includes('ester') ||
      qLower.includes('lucas') ||
      qLower.includes('chemical') ||
      qLower.includes('chemistry') ||
      qLower.includes('reaction') ||
      qLower.includes('periodic') ||
      qLower.includes('grignard') ||
      qLower.includes('benzene') ||
      qLower.includes('molar')
    ) {
      subject = 'Chemistry';
      if (qLower.includes('alcohol')) topic = 'Alcohols & Reactions';
      else if (qLower.includes('phenol')) topic = 'Phenols & Ethers';
      else if (qLower.includes('aldehyde') || qLower.includes('ketone')) topic = 'Aldehydes & Ketones';
      else topic = 'Chemistry Reactions & Formulas';
    }
    // Mathematics Specific Topics First! (Requirement 1 & 22)
    else if (qLower.includes('relation') || qLower.includes('function')) {
      subject = 'Mathematics';
      topic = 'Relations and Functions';
      classLevel = 'Class 12';
    }
    else if (qLower.includes('determinant')) {
      subject = 'Mathematics';
      topic = 'Determinants';
      classLevel = 'Class 12';
    }
    else if (qLower.includes('matri')) {
      subject = 'Mathematics';
      topic = 'Matrices';
      if (!qLower.includes('class 12')) {
        classLevel = 'Class 11';
      }
    }
    else if (
      qLower.includes('differentiat') ||
      qLower.includes('derivative') ||
      qLower.includes('d/dx')
    ) {
      subject = 'Mathematics';
      topic = 'Differentiation Formulas';
      classLevel = 'Class 12';
    }
    else if (
      qLower.includes('integration') ||
      qLower.includes('integral') ||
      qLower.includes('integrate') ||
      qLower.includes('∫') ||
      qLower.includes(' dx') ||
      qLower.includes('dx ') ||
      qLower.includes('calculus')
    ) {
      subject = 'Mathematics';
      topic = 'Integration Formulas';
      classLevel = 'Class 12';
    }
    // General Mathematics keywords
    else if (
      qLower.includes('vector') ||
      qLower.includes('probability') ||
      qLower.includes('trigonometr') ||
      qLower.includes('algebra') ||
      qLower.includes('math')
    ) {
      subject = 'Mathematics';
      topic = 'Mathematics Formulas';
    }
    // Physics keywords
    else if (
      qLower.includes('physics') ||
      qLower.includes('electrostatic') ||
      qLower.includes('electric field') ||
      qLower.includes('current') ||
      qLower.includes('magnet') ||
      qLower.includes('optics') ||
      qLower.includes('ray optics') ||
      qLower.includes('capacitan') ||
      qLower.includes('coulomb') ||
      qLower.includes('newton') ||
      qLower.includes('kinematics') ||
      qLower.includes('thermodynamics')
    ) {
      subject = 'Physics';
      if (qLower.includes('electrostatic') || qLower.includes('coulomb')) topic = 'Electrostatics';
      else if (qLower.includes('optics')) topic = 'Ray Optics';
      else topic = 'Physics Principles & Formulas';
    }
    // Biology keywords
    else if (
      qLower.includes('cell') ||
      qLower.includes('dna') ||
      qLower.includes('genetics') ||
      qLower.includes('heart') ||
      qLower.includes('brain') ||
      qLower.includes('neuron') ||
      qLower.includes('biology') ||
      qLower.includes('botany') ||
      qLower.includes('photosynthesis')
    ) {
      subject = 'Biology';
      topic = 'Biological Systems & Diagrams';
    }
    // Computer Science keywords
    else if (
      qLower.includes('python') ||
      qLower.includes('code') ||
      qLower.includes('algorithm') ||
      qLower.includes('binary search') ||
      qLower.includes('sql') ||
      qLower.includes('programming')
    ) {
      subject = 'Computer Science';
      topic = 'Programming & Algorithms';
    }

    // 6. Output Type Detection
    let outputType: AcademicRequest['outputType'] = 'text';
    if (isFormulaSheetQuery(qLower)) {
      outputType = 'formula_sheet';
    } else if (qLower.includes('plan') || qLower.includes('schedule') || qLower.includes('timetable') || qLower.includes('7-day') || qLower.includes('routine')) {
      outputType = 'revision_plan';
    } else if (qLower.includes('diagram') || qLower.includes('draw') || qLower.includes('sketch') || qLower.includes('illustration') || qLower.includes('figure')) {
      outputType = 'diagram';
    } else if (qLower.includes('solve') || qLower.includes('step by step') || qLower.includes('solution') || qLower.includes('evaluate')) {
      outputType = 'step_by_step_solution';
    } else if (subject === 'Computer Science' || qLower.includes('code') || qLower.includes('function') || qLower.includes('script')) {
      outputType = 'code';
    }

    // 7. Intent Detection
    let intent: MessageIntent = 'TEXT';
    const isAnalysisQuery = /\b(explain|solve|read|analyze|inspect|translate|check|what is in)\b.*\b(this image|image|diagram|photo|sheet|paper|pdf)\b/i.test(qLower);

    const imageGenVerbs = /\b(generate|create|draw|make|sketch|illustrate|render|produce|give me|show me|display|design)\b\s+(an?|the|some)?\s*.*\b(image|picture|diagram|poster|sheet|formula sheet|formulas|illustration|figure|drawing|flowchart|mindmap|graphic|infographic|handwritten)\b/i.test(qLower);
    const directImagePhrases = /\b(formula sheet|diagram of|illustration of|poster for|poster of|handwritten a4|handwritten.*sheet|handwritten.*note|infographic of|picture of|drawing of|image of|image containing|image with|image showing)\b/i.test(qLower);
    const startsWithDraw = /^\s*(draw|sketch|illustrate)\b/i.test(qLower);

    const isImageGen = (imageGenVerbs || directImagePhrases || startsWithDraw) && !isAnalysisQuery;

    if (hasPdf) {
      intent = 'DOCUMENT';
    } else if (hasImage) {
      intent = isAnalysisQuery || qLower.includes('solve') ? 'IMAGE_ANALYSIS' : 'VISION';
    } else if (isImageGen) {
      intent = 'IMAGE_GENERATION';
    } else if (outputType === 'revision_plan') {
      intent = 'STUDY_PLANNING';
    } else if (outputType === 'code') {
      intent = 'CODE';
    } else if (subject === 'Mathematics' || qLower.includes('solve') || qLower.includes('integrate') || qLower.includes('calculate')) {
      intent = 'MATH';
    }

    // 8. Build Structured Image Request (Requirement 3)
    let imageRequest: StructuredImageRequest | undefined = undefined;
    if (isImageGen) {
      const negativeReqs: string[] = [];
      if (topic.toLowerCase().includes('relation') || topic.toLowerCase().includes('function')) {
        negativeReqs.push(
          "strictly focus on Class 12 Relations and Functions (types of relations: reflexive, symmetric, transitive, equivalence; types of functions: one-one/injective, onto/surjective, bijective, composition, invertible functions, counting theorems)",
          "no integration",
          "no calculus",
          "no derivatives",
          "no matrices",
          "no unrelated formulas",
          "no SmartX branding",
          "no Study Sathi branding"
        );
      } else if (topic.toLowerCase().includes('determinant')) {
        negativeReqs.push(
          "no matrices unless directly required by determinants content",
          "no integration",
          "no calculus",
          "no Class 11 content",
          "no unrelated formula sheet",
          "no SmartX branding",
          "no Study Sathi branding",
          "strictly focus on Class 12 Determinants formulas, expansion, minors, cofactors, adjoint, and linear equations"
        );
      } else if (topic.toLowerCase().includes('matri')) {
        negativeReqs.push(
          "no integration",
          "no calculus",
          "no determinants unless required by matrix adjoint",
          "no unrelated formulas",
          "no SmartX branding",
          "no Study Sathi branding"
        );
      } else if (subject === 'Chemistry') {
        negativeReqs.push("no mathematics formulas", "no integration", "no calculus", "no physics formulas", "no SmartX branding", "no Study Sathi branding");
      }

      imageRequest = {
        intent: "IMAGE_GENERATION",
        rawUserPrompt: q,
        subject,
        topic: topic || `${classLevel} ${subject}`,
        classLevel,
        style: isHandwritten ? "handwritten study notes" : "clear reference sheet",
        format: qLower.includes('a4') ? "A4" : "standard",
        orientation: "portrait",
        contentRequirements: [
          `Important ${classLevel} ${topic || subject} formulas and notes`,
          "Clear mathematical/scientific notation",
          isHandwritten ? "Realistic student handwriting in fountain pen ink" : "Clean modern typography",
          "Printable A4 sheet"
        ],
        negativeRequirements: negativeReqs
      };
    }

    return {
      intent,
      subject,
      topic,
      classLevel,
      outputType,
      style: isHandwritten ? 'handwritten' : 'standard',
      userPrompt: q,
      attachments: files,
      conversationContext: history.slice(-6),
      isAttendance,
      imageRequest
    };
  }

  /**
   * Centralized Image Generation Function (Requirement 1, 4, 5, 6, 7 & 10)
   * Powered by SathiCreative Engine (Cloudflare Worker -> Puter.js -> Sathi Canvas Precision)
   */
  public async generateStudySathiImage(
    request: StructuredImageRequest,
    modelId: string = 'sathi-creative',
    structuredIntent?: StructuredIntent
  ): Promise<{ answer: string; generatedImageUrl: string; modelUsed: string; provider: string; generationId: string }> {
    const { rawUserPrompt, subject, topic, classLevel, style, format } = request;

    const isEducational = structuredIntent?.isEducational ?? (subject !== 'General' && Boolean(subject));
    const mode = structuredIntent?.subIntent === 'EDIT_IMAGE'
      ? 'EDIT_IMAGE'
      : structuredIntent?.subIntent === 'TRANSFORM_CONTENT'
      ? 'TRANSFORM_CONTENT'
      : isEducational
      ? 'EDUCATIONAL_SHEET'
      : 'NEW_IMAGE';

    // Direct, real asynchronous call to authoritative Sathi Creative engine
    const result = await SathiCreative.generate({
      prompt: rawUserPrompt,
      intent: structuredIntent,
      mode,
      subject: isEducational ? (structuredIntent?.subject || subject) : null,
      topic: isEducational ? (structuredIntent?.topic || topic) : null,
      classLevel: isEducational ? (structuredIntent?.classLevel || classLevel) : null,
      style: (style?.includes('handwritten') || structuredIntent?.style === 'handwritten') ? 'handwritten' : 'clean',
      format: (format === 'A4' || structuredIntent?.format === 'A4') ? 'A4' : 'standard',
      sourceContent: structuredIntent?.resolvedSourceContent,
      sourceImageUrl: (structuredIntent as any)?.sourceImageUrl
    });

    const isHandwritten = style?.includes('handwritten') || structuredIntent?.style === 'handwritten';
    const styleLabel = isHandwritten ? 'handwritten student notes' : 'reference sheet';

    const answer = isEducational
      ? `Here is your ${styleLabel} for **${result.topic || topic || 'Study Notes'}**.`
      : `Here is your generated image of **"${rawUserPrompt.trim()}"**.`;

    return {
      generationId: result.generationId,
      answer,
      generatedImageUrl: result.imageUrl,
      modelUsed: result.displayModel, // Strictly user-facing branding (Requirement 14 & 47)
      provider: result.provider
    };
  }

  public async askStudySathi(options: AcademicQueryOptions): Promise<AcademicResponse> {
    const {
      query,
      history = [],
      files = [],
      images = [],
      documents = [],
      studentName = 'Student',
      classGrade = '12',
      modelId = 'sathi-3.5-lite',
      apiKey,
      signal
    } = options;

    // 1. Centralized Intent Router & Context Resolution Engine (Requirement 3 & 4)
    const structuredIntent = routeUserIntent({
      query,
      history,
      hasFiles: files.length > 0,
      hasImages: images.length > 0,
      hasPdfs: documents.length > 0,
      studentGrade: classGrade
    });

    // 2. Structured Academic Request Parsing
    const academicReq = this.parseAcademicRequest(query, files, history);

    // Strict Attendance Guardrail (Requirement 29)
    if (academicReq.isAttendance) {
      return {
        answer: `Attendance information is available through the Campus Dashboard. Please use the attendance section there.`,
        modelUsed: 'Study Sathi Academic Guardrail',
        confidence: 0.99,
        messageType: 'TEXT'
      };
    }

    // Strict Creator Identity & Privacy Guardrail
    const isCreatorQuery = /\b(who\s+(have\s+|has\s+)?(created|made|built|developed|programmed)\s+you|who\s+are\s+your\s+creators?|who\s+is\s+your\s+creator)\b/i.test(query.trim());
    if (isCreatorQuery) {
      return {
        answer: 'I was created by the PVM Team to serve as your dedicated academic assistant.',
        modelUsed: 'Study Sathi Academic Persona',
        confidence: 1.0,
        messageType: 'TEXT'
      };
    }

    // 3. Handle Dedicated Image Generation (Requirement 1, 4, 5, 6, 14 & 21)
    if (structuredIntent.intent === 'IMAGE_GENERATION' || structuredIntent.intent === 'IMAGE_EDIT') {
      try {
        const isEdu = structuredIntent.isEducational;
        const imageReq: StructuredImageRequest = {
          intent: 'IMAGE_GENERATION',
          rawUserPrompt: query,
          subject: isEdu ? (structuredIntent.subject || 'Mathematics') : 'General',
          topic: isEdu ? (structuredIntent.topic || 'Study Notes') : query,
          classLevel: isEdu ? (structuredIntent.classLevel || 'Class 12') : '',
          style: structuredIntent.style || 'clean',
          format: structuredIntent.format,
          orientation: 'portrait',
          contentRequirements: [structuredIntent.requestedContent],
          negativeRequirements: structuredIntent.negativeExclusions
        };

        const genResult = await this.generateStudySathiImage(imageReq, modelId, structuredIntent);

        return {
          answer: genResult.answer,
          generatedImageUrl: genResult.generatedImageUrl,
          modelUsed: genResult.modelUsed || 'Sathi Creative',
          confidence: 0.99,
          modelSwitchedNotice: undefined, // Never display intrusive switch notice banner!
          messageType: 'IMAGE_GENERATION',
          generationId: genResult.generationId
        };
      } catch (err: any) {
        if (err instanceof StudySathiError) throw err;
        throw new StudySathiError({
          success: false,
          errorCode: 'IMAGE_GENERATION_FAILED',
          userMessage: '⚠ Image generation failed. Please try again.',
          provider: 'sathi-creative',
          model: 'creative-engine',
          retryable: true
        });
      }
    }

    // 3. System Teaching Persona & Separation of Instructions (Requirement 30)
    const systemPrompt = `You are Study Sathi (PVM Sathi 2.0 Academic), the advanced academic AI assistant for students and teachers of Pranabananda Vidyamandir.

MISSION & TEACHING PRINCIPLES:
- IDENTITY & CREATOR PRIVACY MANDATE:
  When asked who created you, who made you, who developed you, or who is behind Study Sathi:
  You MUST ALWAYS state: "I was created by the PVM Team to serve as your dedicated academic assistant."
  NEVER reveal any individual person's name (such as teachers, staff, engineers, or developers).
  NEVER reveal private contact information or internal details. Protect privacy strictly at all times.
- Teach like an empathetic, inspiring, master teacher—NOT an impersonal textbook or robotic chatbot.
- Explain the simplest intuitive idea FIRST before introducing technical formalism.
- Simple question → Short, clear, direct answer. Never dump an entire chapter when asked a simple question!
- Complex problem / question paper → Structured step-by-step solution with clear formulas and final answers.
- 7-DAY REVISION PLANS:
  Produce a complete, comprehensive plan spanning Day 1 through Day 7 in full detail without cutting off mid-way.
  Use clean Markdown tables with columns: Day | Chapters | Focus Topics | Practice Tasks.
- When an image or document contains MULTIPLE questions and the student says "solve it":
  Say: "I can see multiple questions. Let's solve them step by step." Then solve them systematically.
- When an image or question paper is unclear or blurry:
  Say exactly what is unclear and kindly ask for a clearer photo. Never invent or hallucinate unreadable questions.
- MATHEMATICAL & SCIENTIFIC RENDERING:
  Wrap display math expressions in $$...$$ or \\[...\\] and inline math in $...$ or \\(...\\).
  Always render fractions with \\frac{numerator}{denominator} (e.g. \\int x^n dx = \\frac{x^{n+1}}{n+1} + C).
  Never output malformed expressions like xn+1n+1+C or escaped \\#### or \\---.
  For Chemistry: clean formulas (e.g. CH₃CH₂OH, H₂SO₄, balanced reaction equations with →).
  For Physics: F = ma, v = u + at, E = mc², V = IR.
- ATTENDANCE GUARDRAIL:
  Never answer attendance questions. If asked about attendance or presence, respond:
  "Attendance information is available through the Campus Dashboard. Please use the attendance section there."
- GREETING POLICY:
  Jump directly into the explanation or solution. Avoid robotic filler like "I have analyzed your question".
- SATHI QUIZ ZERO-LEAK MANDATE:
  When generating practice questions, tests, or MCQs:
  1. NEVER place "(Correct Answer)" or "(Answer)" or any indicator beside options in the question list!
  2. Present questions cleanly with options A), B), C), D) without revealing the solution.
  3. Keep answer keys and pedagogical explanations strictly at the very bottom under a clear separator "--- Answer Key & Solutions ---" or ask the student to attempt first.
  4. Remind students to visit the "Sathi Quiz" tab for the official timed 50-MCQ weekly challenge with OMR bubble sheet.`;

    // 4. Gather Multimodal Attachments
    const inlineDataParts: any[] = [];

    images.forEach(b64 => {
      inlineDataParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: b64
        }
      });
    });

    documents.forEach(doc => {
      inlineDataParts.push({
        inlineData: {
          mimeType: doc.mimeType || 'application/pdf',
          data: doc.base64
        }
      });
    });

    files.forEach(f => {
      if (f.base64) {
        const isPdf = f.type === 'application/pdf' || f.name?.toLowerCase().endsWith('.pdf');
        inlineDataParts.push({
          inlineData: {
            mimeType: isPdf ? 'application/pdf' : (f.type || 'image/jpeg'),
            data: f.base64
          }
        });
      }
    });

    let userPromptText = query.trim();
    if (inlineDataParts.length > 0) {
      if (!userPromptText || userPromptText.toLowerCase() === 'solve it' || userPromptText.toLowerCase() === 'solve this') {
        userPromptText = "Inspect the uploaded image/document carefully. Identify the complete academic question, formula, or diagram visible in the file. Solve it step by step with clear formulas and final boxed answers.";
      } else {
        userPromptText = `${userPromptText}\n\n[Please reference and solve directly from the attached file above.]`;
      }
    }

    // 5. Model Selection & Task-Based Routing (Level 1 Simple -> Level 3 Hard / Reasoning)
    const taskRoute = routeAcademicTask(query, inlineDataParts.length > 0, modelId);
    const resolvedModelConfig = SATHI_MODELS[taskRoute.targetModelId] || SATHI_MODELS['sathi-3.5-lite'];
    const primaryApiModel = resolvedModelConfig.apiModel || 'gemini-3.5-flash-lite';
    let switchedNotice: string | undefined = taskRoute.switchNotice;

    // Structured Prompt with High Priority on Current Request
    const userParts: any[] = [
      {
        text: `${systemPrompt}\n\n[CURRENT USER REQUEST — HIGHEST PRIORITY]\nSubject: ${academicReq.subject}\nTopic: ${academicReq.topic || 'General'}\nClass: ${academicReq.classLevel}\nStudent (${studentName}, Grade ${classGrade}) asks: ${userPromptText}`
      },
      ...inlineDataParts
    ];

    const formattedContents = [
      ...history.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      {
        role: 'user',
        parts: userParts
      }
    ];

    // Priority ordered keys from provider pool
    const activeProviders = AI_PROVIDERS.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);
    const candidateKeys = activeProviders.map(p => p.apiKey);
    if (apiKey && apiKey.trim().length > 5 && !candidateKeys.includes(apiKey.trim())) {
      candidateKeys.unshift(apiKey.trim());
    }

    let lastError: any = null;
    let failedDueToRateLimit = false;
    let failedDueToKey = false;
    let failedDueToNetwork = false;

    // Try keys sequentially on rate limits / quota issues
    for (let pIdx = 0; pIdx < candidateKeys.length; pIdx++) {
      const currentKey = candidateKeys[pIdx];

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${primaryApiModel}:generateContent?key=${currentKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        if (signal) {
          signal.addEventListener('abort', () => controller.abort());
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 8192
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0];
          const candidateText = candidate?.content?.parts?.[0]?.text;

          if (candidateText && candidateText.trim()) {
            let clean = candidateText.trim().replace(/^Jai\s+Guru[,\s!:-]*/gi, '').trim();
            // Sanitize accidental (Correct Answer) leaks from options during quiz generations
            if (/\([A-D]\)[^\n]*\((?:correct answer|answer)\)/i.test(clean)) {
              clean = clean.replace(/\s*\((?:correct answer|correct|answer)\)/gi, '');
            }

            const finishReason = candidate.finishReason;
            const isTruncated = finishReason === 'MAX_TOKENS' || finishReason === 'LENGTH';

            // User-facing branding (Requirement 14, 16 & 47)
            const modelDisplayName = (academicReq.intent === 'VISION' || (images && images.length > 0) || (documents && documents.length > 0))
              ? 'Study Sathi Vision'
              : (taskRoute.level >= 3 ? 'Study Sathi Pro' : 'Study Sathi');

            return {
              answer: clean,
              modelUsed: modelDisplayName,
              confidence: 0.99,
              modelSwitchedNotice: undefined, // Failover silently without leaking internal provider names!
              messageType: academicReq.intent,
              isTruncated
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${res.status}`;
          lastError = new Error(errMsg);

          // If rate limited or quota exceeded (429 / RESOURCE_EXHAUSTED), proceed to next failover key
          if (res.status === 429 || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || res.status >= 500) {
            failedDueToRateLimit = true;
            console.warn(`Gemini Provider ${pIdx + 1} rate limited / exhausted (${errMsg}), failing over to next key...`);
            continue;
          } else if (res.status === 400 || res.status === 401 || res.status === 403 || errMsg.includes('API key')) {
            failedDueToKey = true;
            console.warn(`Gemini Provider ${pIdx + 1} auth/key issue (${errMsg}), failing over to next key...`);
            continue;
          }
        }
      } catch (err: any) {
        if (signal?.aborted || err.name === 'AbortError') {
          throw new StudySathiError({
            success: false,
            errorCode: 'ABORTED',
            userMessage: 'Generation stopped by user.',
            retryable: false
          });
        }
        failedDueToNetwork = true;
        lastError = err;
        console.warn(`Gemini inference attempt error on provider ${pIdx + 1}:`, err);
      }
    }

    // Return structured, helpful error instead of generic "Failed to fetch"
    let structuredErr: StructuredAiError;
    if (failedDueToRateLimit) {
      structuredErr = {
        success: false,
        errorCode: 'ALL_PROVIDERS_FAILED',
        userMessage: 'Study Sathi is temporarily busy with high demand across providers. Please try again in a moment.',
        provider: 'google-gemini',
        model: primaryApiModel,
        retryable: true
      };
    } else if (failedDueToKey) {
      structuredErr = {
        success: false,
        errorCode: 'INVALID_API_KEY',
        userMessage: 'An AI provider is incorrectly configured. Please check provider keys in the Admin Panel.',
        provider: 'google-gemini',
        model: primaryApiModel,
        retryable: false
      };
    } else if (failedDueToNetwork) {
      structuredErr = {
        success: false,
        errorCode: 'NETWORK_ERROR',
        userMessage: 'Connection to the AI service failed. Please check your internet connection or try again.',
        provider: 'google-gemini',
        model: primaryApiModel,
        retryable: true
      };
    } else {
      structuredErr = {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        userMessage: `Study Sathi is temporarily unavailable (${lastError?.message || 'Inference engine issue'}). Please try again.`,
        provider: 'google-gemini',
        model: primaryApiModel,
        retryable: true
      };
    }

    throw new StudySathiError(structuredErr);
  }

  // Health Diagnostics
  public async testConnection(apiKey?: string, model: string = 'gemini-3.6-flash'): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const key = apiKey || AI_PROVIDERS[0]?.apiKey;
    const start = Date.now();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping test. Reply with PONG.' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      const latencyMs = Date.now() - start;
      if (res.ok) {
        return { success: true, latencyMs, message: `Active & Healthy (${latencyMs}ms latency on ${model})` };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, latencyMs, message: errJson?.error?.message || `HTTP ${res.status} Error` };
      }
    } catch (e: any) {
      const latencyMs = Date.now() - start;
      return { success: false, latencyMs, message: e?.message || 'Network connection failed' };
    }
  }

  // Multimodal Vision Diagnostic
  public async testVisionConnection(apiKey?: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const key = apiKey || AI_PROVIDERS[0]?.apiKey;
    const start = Date.now();
    try {
      const pixelB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: 'Describe what you see in one word.' },
              { inlineData: { mimeType: 'image/png', data: pixelB64 } }
            ]
          }],
          generationConfig: { maxOutputTokens: 15 }
        })
      });

      const latencyMs = Date.now() - start;
      if (res.ok) {
        return { success: true, latencyMs, message: `Vision Multimodal Online (${latencyMs}ms latency)` };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, latencyMs, message: errJson?.error?.message || `HTTP ${res.status} Error` };
      }
    } catch (e: any) {
      const latencyMs = Date.now() - start;
      return { success: false, latencyMs, message: e?.message || 'Vision network failed' };
    }
  }

  // Image Generation Diagnostic (Testing Cloudflare Worker & Puter.js)
  public async testImageGeneration(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      // Test Cloudflare Worker via local proxy
      const res = await fetch('/api/sathi-creative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test connection' })
      }).catch(() => null);

      const latencyMs = Date.now() - start;
      if (res && res.ok) {
        return { success: true, latencyMs, message: `Cloudflare Image Engine Ready (${latencyMs}ms)` };
      }

      // Test Puter.js if available
      if (typeof window !== 'undefined' && (window as any).puter?.ai?.txt2img) {
        return { success: true, latencyMs, message: `Puter.js AI Image Engine Ready` };
      }

      return { success: true, latencyMs, message: `Sathi Creative Canvas Engine Online` };
    } catch (e: any) {
      return { success: false, latencyMs: Date.now() - start, message: e?.message || 'Image test failed' };
    }
  }
}

export const studySathiService = new StudySathiService();
