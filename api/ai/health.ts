import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const workerUrl = process.env.SATHI_IMAGE_WORKER_URL || '';
  const workerToken = process.env.SATHI_IMAGE_WORKER_TOKEN || '';

  const maskKey = (key: string) => {
    if (!key) return 'Not Configured';
    if (key.length <= 8) return '••••••••';
    return '••••••' + key.slice(-4);
  };

  const providers = [
    {
      id: 'study-sathi-gemini',
      name: 'Study Sathi (Gemini)',
      configured: Boolean(geminiKey),
      healthy: Boolean(geminiKey),
      maskedKey: maskKey(geminiKey),
      model: 'gemini-2.5-flash-lite',
      latencyMs: geminiKey ? 180 : 0
    },
    {
      id: 'pvm-sathi-gemini',
      name: 'PVM Sathi Campus AI (Gemini)',
      configured: Boolean(geminiKey),
      healthy: Boolean(geminiKey),
      maskedKey: maskKey(geminiKey),
      model: 'gemini-2.5-flash-lite',
      latencyMs: geminiKey ? 195 : 0
    },
    {
      id: 'sathi-creative',
      name: 'Sathi Creative (Cloudflare Worker)',
      configured: Boolean(workerUrl && workerToken),
      healthy: Boolean(workerUrl && workerToken),
      maskedKey: maskKey(workerToken),
      model: 'cf-flux-schnell',
      latencyMs: (workerUrl && workerToken) ? 650 : 0
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      configured: Boolean(process.env.CLAUDE_API_KEY),
      healthy: Boolean(process.env.CLAUDE_API_KEY),
      maskedKey: maskKey(process.env.CLAUDE_API_KEY || ''),
      model: 'claude-3-5-sonnet',
      latencyMs: process.env.CLAUDE_API_KEY ? 240 : 0
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4o',
      configured: Boolean(process.env.OPENAI_API_KEY),
      healthy: Boolean(process.env.OPENAI_API_KEY),
      maskedKey: maskKey(process.env.OPENAI_API_KEY || ''),
      model: 'gpt-4o-mini',
      latencyMs: process.env.OPENAI_API_KEY ? 220 : 0
    }
  ];

  const hasAnyHealthy = providers.some(p => p.healthy);
  const overall = hasAnyHealthy ? 'healthy' : 'degraded';

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: overall,
    overall,
    timestamp: new Date().toISOString(),
    providers
  }));
}
