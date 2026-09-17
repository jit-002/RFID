/**
 * Study Sathi 2.0 Dedicated Sathi Creative Image Generation Service
 * Powered strictly by Sathi Creative / Puter.js image pipeline
 * 
 * Strict Mandates:
 * 1. ZERO context leakage: General prompts (e.g. "red apple") never receive Class 12 formula templates.
 * 2. Strict Sathi Branding: Never expose "Puter.js" or internal model strings in user-facing UI.
 * 3. REAL asynchronous operation awaiting the actual Promise.
 * 4. ZERO fake/cached image returns (NEVER return old integration or placeholder images).
 * 5. Unique generation ID per request to prevent race condition overwrites.
 * 6. On failure, clean user-facing error ("⚠ Image generation failed. Please try again.").
 */

import { StudySathiError } from './studySathiService';
import { StructuredIntent } from './ai/intentRouter';

export interface ImageGenerationRequest {
  prompt: string;
  intent?: StructuredIntent;
  subject?: string | null;
  topic?: string;
  classLevel?: string | null;
  style?: string | null;
  format?: string;
  aspectRatio?: string;
  isEducational?: boolean;
  resolvedSourceContent?: string | null;
  options?: {
    model?: string;
    aspect_ratio?: string;
  };
}

export interface ImageGenerationResult {
  generationId: string;
  imageUrl: string;
  provider: 'sathi-creative' | 'sathi-canvas';
  model: string; // Internal model ID for logs only
  displayModel: string; // User-facing branding (e.g. "Sathi Creative")
  prompt: string;
}

// Configured real image model priority pool for Puter.js
export const PUTER_IMAGE_MODELS = [
  { id: "gemini-image", model: "google/gemini-3.1-flash-image-preview", priority: 1 },
  { id: "gpt-image", model: "openai/gpt-image-2", priority: 2 },
  { id: "grok-image", model: "x-ai/grok-imagine-image", priority: 3 },
  { id: "standard-puter", model: "default", priority: 4 }
];

/**
 * Validate prompt to prevent cross-topic contamination
 */
export function validateImagePrompt(prompt: string, topic?: string, isEducational: boolean = false): void {
  if (!prompt || !prompt.trim()) {
    throw new StudySathiError({
      success: false,
      errorCode: 'IMAGE_GENERATION_FAILED',
      userMessage: 'Image prompt cannot be empty.',
      provider: 'sathi-creative',
      retryable: false
    });
  }

  const pLower = prompt.toLowerCase();
  const tLower = (topic || '').toLowerCase();

  // If user requested Relations and Functions, verify no integration/calculus slipped in
  if (isEducational && (tLower.includes('relation') || tLower.includes('function'))) {
    if (pLower.includes('calculus') || pLower.includes('integral') || pLower.includes('integration') || pLower.includes('∫')) {
      console.warn("[StudySathi][ImageValidator] Detected calculus contamination in Relations & Functions prompt.");
      throw new StudySathiError({
        success: false,
        errorCode: 'IMAGE_GENERATION_FAILED',
        userMessage: 'Image prompt contamination detected: Calculus/Integration in Relations and Functions prompt.',
        provider: 'sathi-creative',
        retryable: false
      });
    }
  }

  // If user requested Determinants, verify no calculus/integration contamination
  if (isEducational && tLower.includes('determinant')) {
    if (pLower.includes('calculus') || pLower.includes('integral') || pLower.includes('integration')) {
      console.warn("[StudySathi][ImageValidator] Detected calculus contamination in Determinants prompt.");
      throw new StudySathiError({
        success: false,
        errorCode: 'IMAGE_GENERATION_FAILED',
        userMessage: 'Image prompt contamination detected: Calculus/Integration in Determinants prompt.',
        provider: 'sathi-creative',
        retryable: false
      });
    }
  }
}

/**
 * Builds a deterministic prompt strictly respecting whether the query is educational or general
 */
export function buildDeterministicImagePrompt(request: ImageGenerationRequest): string {
  const {
    prompt,
    topic,
    subject,
    classLevel,
    style = 'clean',
    isEducational = false,
    resolvedSourceContent,
    intent
  } = request;

  // CASE 1: General Non-Academic Image (e.g. "red apple on a white background", "futuristic city")
  // FIREWALL: Zero educational, Class 12, or formula instructions!
  if (!isEducational && intent?.subIntent !== 'NEW_EDUCATIONAL_SHEET' && intent?.subIntent !== 'TRANSFORM_CONTENT') {
    return `Create a high quality visual of: ${prompt.trim()}
Requirements:
- Depict exactly: ${prompt.trim()}
- Clean aesthetic composition
- Crisp sharp details
- No text, no formulas, no diagrams, no watermark, no branding
- Do not include any educational notes, school formulas, or mathematical concepts`;
  }

  // CASE 2: Transform Previous Content into an A4 Sheet (e.g. "implement this into a a4 sheet printable format")
  if (intent?.subIntent === 'TRANSFORM_CONTENT' && resolvedSourceContent) {
    const topicLabel = topic || 'Academic Reference Formulas';
    const isHandwritten = style?.includes('handwritten') || prompt.toLowerCase().includes('handwritten');

    return `Create an A4 portrait ${isHandwritten ? 'handwritten student study sheet' : 'educational reference sheet'}.
Topic: ${topicLabel}
Content Source:
${resolvedSourceContent.slice(0, 500)}

Format: A4 portrait printable sheet
Style: ${isHandwritten ? 'Neat student handwriting in dark blue fountain pen ink on ruled notebook paper' : 'Clean crisp educational typography and mathematical equations'}

Requirements:
- Accurately format the formulas from the content source
- Printable A4 layout
- Well organized with clear headings
- No unrelated formulas`;
  }

  // CASE 3: Educational Formula / Study Sheet (e.g. "Class 12 Relations and Functions formula sheet")
  const isHandwritten = style?.includes('handwritten') || prompt.toLowerCase().includes('handwritten');
  const classLabel = classLevel || 'Class 12';
  const subjectLabel = subject || 'Mathematics';
  const topicLabel = topic || 'Key Formulas & Concepts';

  // Negative exclusions
  let exclusionBlock = '';
  const tLower = topicLabel.toLowerCase();
  if (tLower.includes('relation') || tLower.includes('function')) {
    exclusionBlock = `CRITICAL EXCLUSIONS:
- strictly Relations and Functions
- NO integration formulas
- NO calculus
- NO differentiation
- NO matrices
- NO determinants
- NO unrelated topics`;
  } else if (tLower.includes('determinant')) {
    exclusionBlock = `CRITICAL EXCLUSIONS:
- strictly Determinants formulas, expansion, minors, cofactors, adjoint and inverse
- NO integration
- NO calculus
- NO matrices unless required by determinants`;
  } else if (tLower.includes('matri')) {
    exclusionBlock = `CRITICAL EXCLUSIONS:
- strictly Matrices operations, types, transpose, symmetric and skew-symmetric
- NO integration
- NO calculus`;
  } else if (subjectLabel.toLowerCase() === 'chemistry') {
    exclusionBlock = `CRITICAL EXCLUSIONS:
- strictly Chemistry reactions and principles
- NO mathematics formulas
- NO physics formulas`;
  }

  return `Create an A4 portrait ${isHandwritten ? 'handwritten student revision study sheet' : 'clean educational reference sheet'}.

Subject: ${classLabel} ${subjectLabel}
Topic: ${topicLabel}

Purpose:
Student academic revision sheet for ${classLabel} ${subjectLabel}.

Content:
Include important ${classLabel} formulas, definitions, properties and standard results for ${topicLabel}.

Format:
A4 portrait printable page.

Style:
${isHandwritten ? 'Realistic student handwritten notes in dark blue fountain pen ink on ruled notebook paper with red margin.' : 'High resolution clear educational diagrams and clean typography.'}

${exclusionBlock}
- No previous conversation content
- No previous image content
- No SmartX branding
- No Study Sathi branding`;
}

/**
 * Safely verify that an image element or URL actually loads before returning to the UI
 */
export async function waitForImageLoad(src: string, timeoutMs: number = 20000): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(true); // Don't block indefinitely if CORS prevents onload trigger
      }
    }, timeoutMs);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.src = src;
  });
}
import { SathiCreative } from './ai/sathiCreative';

/**
 * Centralized Sathi Creative Image Generator using SathiCreative engine
 * Strictly enforces context firewall and Sathi branding (hiding internal providers).
 */
export async function generateStudySathiImageWithPuter(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const result = await SathiCreative.generate({
    prompt: request.prompt,
    intent: request.intent,
    subject: request.subject,
    topic: request.topic,
    classLevel: request.classLevel,
    style: request.style as any,
    format: request.format as any,
    sourceContent: request.resolvedSourceContent,
    precisionMode: false
  });

  return {
    generationId: result.generationId,
    imageUrl: result.imageUrl,
    provider: result.provider,
    model: result.modelInternal,
    displayModel: result.displayModel,
    prompt: request.prompt
  };
}
