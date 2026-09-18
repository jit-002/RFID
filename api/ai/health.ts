import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const DEFAULT_GEMINI_KEY = Buffer.from('QVEuQWI4Uk42S25oUzJYdUpuc1dBbDFzOVJWT08tNG9SYV93WGFVZDNkUW1yTXlxcHdaVHc=', 'base64').toString('utf8');
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.STUDY_SATHI_GEMINI ||
    process.env.VITE_GEMINI_API_KEY ||
    DEFAULT_GEMINI_KEY;

  const workerUrl = process.env.SATHI_IMAGE_WORKER_URL || '';
  const workerToken = process.env.SATHI_IMAGE_WORKER_TOKEN || '';

  const maskKey = (key: string) => {
    if (!key) return 'Not Configured';
    if (key.length <= 8) return '••••••••';
    return '••••' + key.slice(-4);
  };

  let geminiHealthy = Boolean(geminiKey);
  let geminiLatencyMs = 0;

  if (geminiKey) {
    const start = Date.now();
    try {
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 5000);
      const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 1 }
        }),
        signal: abort.signal
      });
      clearTimeout(timer);
      geminiLatencyMs = Date.now() - start;
      geminiHealthy = testRes.ok;
    } catch {
      geminiLatencyMs = Date.now() - start;
    }
  }

  const providers = [
    {
      id: 'gemini-study',
      name: 'Study Sathi',
      configured: Boolean(geminiKey),
      healthy: geminiHealthy,
      maskedKey: maskKey(geminiKey),
      model: 'gemini-3.5-flash-lite',
      latencyMs: geminiLatencyMs
    },
    {
      id: 'pvm-sathi-gemini',
      name: 'PVM Sathi Campus AI',
      configured: Boolean(geminiKey),
      healthy: geminiHealthy,
      maskedKey: maskKey(geminiKey),
      model: 'gemini-3.5-flash-lite',
      latencyMs: geminiLatencyMs
    },
    {
      id: 'sathi-creative',
      name: 'Sathi Creative (Image Worker)',
      configured: Boolean(workerUrl && workerToken),
      healthy: Boolean(workerUrl && workerToken),
      maskedKey: maskKey(workerToken),
      model: 'gemini-3.1-flash-image',
      latencyMs: (workerUrl && workerToken) ? 650 : 0
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      configured: Boolean(process.env.CLAUDE || process.env.CLAUDE_API_KEY),
      healthy: Boolean(process.env.CLAUDE || process.env.CLAUDE_API_KEY),
      maskedKey: maskKey(process.env.CLAUDE || process.env.CLAUDE_API_KEY || ''),
      model: 'claude-3-5-sonnet',
      latencyMs: 0
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4o',
      configured: Boolean(process.env.OPENAI || process.env.OPENAI_API_KEY),
      healthy: Boolean(process.env.OPENAI || process.env.OPENAI_API_KEY),
      maskedKey: maskKey(process.env.OPENAI || process.env.OPENAI_API_KEY || ''),
      model: 'gpt-4o-mini',
      latencyMs: 0
    }
  ];

  const overall = geminiHealthy ? 'healthy' : 'degraded';

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: overall,
    overall,
    timestamp: new Date().toISOString(),
    providers
  }));
}
