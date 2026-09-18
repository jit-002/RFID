/**
 * SmartX Production AI API Client
 * Centralized, secure abstraction communicating exclusively with authenticated /api/* endpoints.
 * Browser NEVER contacts external AI provider APIs directly.
 */

export interface StudySathiApiRequest {
  query: string;
  history?: Array<{ role: string; text: string }>;
  files?: any[];
  images?: any[];
  documents?: any[];
  modelId?: string;
  studentName?: string;
  classGrade?: string;
  section?: string;
}

export interface StudySathiApiResponse {
  success: boolean;
  text: string;
  modelUsed?: string;
  error?: string;
}

export interface PvmSathiApiRequest {
  query: string;
  history?: Array<{ sender: string; text: string }>;
  attendanceContext?: any;
  studentInfo?: any;
  userRole?: string;
}

export interface PvmSathiApiResponse {
  success: boolean;
  text: string;
  modelUsed?: string;
  error?: string;
}

export interface SathiCreativeGenerateRequest {
  prompt: string;
  subject?: string;
  topic?: string;
  classLevel?: string;
  isEducational?: boolean;
  mode?: string;
  format?: string;
  orientation?: string;
}

export interface SathiCreativeGenerateResponse {
  success: boolean;
  imageUrl?: string;
  generationId?: string;
  metadata?: any;
  error?: string;
  errorCode?: string;
}

export interface AiProviderHealth {
  id: string;
  name: string;
  configured: boolean;
  healthy: boolean;
  maskedKey: string;
  model: string;
  latencyMs: number;
}

export interface AiHealthResponse {
  status: 'healthy' | 'degraded' | 'offline';
  overall: 'healthy' | 'degraded' | 'offline';
  timestamp: string;
  providers: AiProviderHealth[];
}

export class SmartXAiApiClient {
  /**
   * Send query to Study Sathi (PVM Sathi 2.0 academic intelligence)
   */
  public static async askStudySathi(req: StudySathiApiRequest): Promise<StudySathiApiResponse> {
    try {
      const res = await fetch('/api/ai/study-sathi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          text: data.message || data.error || 'Study Sathi is temporarily unavailable.',
          error: data.error
        };
      }

      return {
        success: true,
        text: data.text || '',
        modelUsed: data.modelUsed
      };
    } catch (err: any) {
      return {
        success: false,
        text: 'Network error contacting Study Sathi AI. Please check your connection.',
        error: err.message
      };
    }
  }

  /**
   * Send query to PVM Sathi (campus / attendance intelligence)
   */
  public static async askPvmSathi(req: PvmSathiApiRequest): Promise<PvmSathiApiResponse> {
    try {
      const res = await fetch('/api/ai/pvm-sathi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          text: data.message || data.error || 'PVM Sathi campus intelligence is temporarily offline.',
          error: data.error
        };
      }

      return {
        success: true,
        text: data.text || '',
        modelUsed: data.modelUsed
      };
    } catch (err: any) {
      return {
        success: false,
        text: 'Network error contacting PVM Sathi campus service.',
        error: err.message
      };
    }
  }

  /**
   * Generate image via Sathi Creative
   */
  public static async generateImage(req: SathiCreativeGenerateRequest): Promise<SathiCreativeGenerateResponse> {
    try {
      const res = await fetch('/api/sathi-creative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || data.error || 'Image generation failed.',
          errorCode: data.errorCode || 'IMAGE_GENERATION_FAILED'
        };
      }

      return {
        success: true,
        imageUrl: data.imageUrl,
        generationId: data.generationId,
        metadata: data.metadata
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error reaching image generation service.',
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Retrieve AI providers health status
   */
  public static async getAiHealth(): Promise<AiHealthResponse> {
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    return {
      status: 'degraded',
      overall: 'degraded',
      timestamp: new Date().toISOString(),
      providers: []
    };
  }
}
