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
  errorCode?: string;
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        let userFacingMessage = data.message || 'Study Sathi is temporarily unavailable.';
        if (data.errorCode === 'INVALID_API_KEY') {
          userFacingMessage = 'Study Sathi is not configured correctly. Please contact the administrator.';
        } else if (data.errorCode === 'RATE_LIMITED') {
          userFacingMessage = 'Study Sathi is temporarily busy. Retrying with another AI engine...';
        } else if (data.errorCode === 'NETWORK_ERROR') {
          userFacingMessage = 'Study Sathi could not reach the AI service. Please check your connection.';
        } else if (data.errorCode === 'SERVICE_UNAVAILABLE') {
          userFacingMessage = 'Study Sathi is temporarily unavailable.';
        } else if (data.error === 'PROVIDER_ERROR' && data.message) {
          userFacingMessage = data.message;
        }

        return {
          success: false,
          text: userFacingMessage,
          error: userFacingMessage,
          errorCode: data.errorCode
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
        error: err.message,
        errorCode: 'NETWORK_ERROR'
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return {
          success: false,
          text: data.message || 'PVM Sathi campus intelligence is temporarily offline.',
          error: data.message || data.error
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

      const data = await res.json().catch(() => ({}));
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
   * Edit image via Sathi Creative
   */
  public static async editImage(req: { image: string; editInstruction: string }): Promise<any> {
    try {
      const res = await fetch('/api/sathi-creative/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      const data = await res.json().catch(() => ({}));
      return data;
    } catch (err: any) {
      return {
        success: false,
        errorCode: 'IMAGE_EDITING_FAILED',
        message: 'Image editing failed: ' + err.message
      };
    }
  }

  /**
   * Analyze image via Sathi Creative Vision
   */
  public static async analyzeImage(req: { image: string; query?: string }): Promise<any> {
    try {
      const res = await fetch('/api/sathi-creative/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      const data = await res.json().catch(() => ({}));
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'Vision analysis failed.'
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
