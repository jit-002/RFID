import type { IncomingMessage, ServerResponse } from 'http';

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const payload = await parseBody(req);
    const { prompt, subject, topic, classLevel, isEducational } = payload;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Prompt is required' }));
      return;
    }

    // ABSOLUTE CONTEXT FIREWALL:
    // Prompt sent to image provider must contain ONLY current request
    const cleanPrompt = prompt.trim();
    const generationId = 'gen_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    const workerUrl = process.env.SATHI_IMAGE_WORKER_URL;
    const workerToken = process.env.SATHI_IMAGE_WORKER_TOKEN;

    if (!workerUrl || !workerToken) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        errorCode: 'IMAGE_GENERATION_NOT_CONFIGURED',
        message: 'Image generation is not configured. SATHI_IMAGE_WORKER_URL and SATHI_IMAGE_WORKER_TOKEN required.'
      }));
      return;
    }

    // Call Cloudflare Worker
    const cfRes = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workerToken}`
      },
      body: JSON.stringify({
        prompt: cleanPrompt,
        generationId,
        subject: isEducational ? subject : undefined,
        topic: isEducational ? topic : undefined,
        classLevel: isEducational ? classLevel : undefined
      })
    });

    if (!cfRes.ok) {
      const errText = await cfRes.text();
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        errorCode: 'IMAGE_GENERATION_FAILED',
        message: 'Image worker returned an error: ' + (errText || `HTTP ${cfRes.status}`)
      }));
      return;
    }

    const contentType = cfRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await cfRes.json();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        generationId,
        imageUrl: data.imageUrl || data.url || data.image,
        metadata: { prompt: cleanPrompt, generationId }
      }));
      return;
    }

    // Binary image returned
    const buffer = await cfRes.arrayBuffer();
    const b64 = Buffer.from(buffer).toString('base64');
    const mime = contentType.includes('image/') ? contentType : 'image/jpeg';
    const dataUrl = `data:${mime};base64,${b64}`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      generationId,
      imageUrl: dataUrl,
      metadata: { prompt: cleanPrompt, generationId }
    }));
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      errorCode: 'INTERNAL_ERROR',
      message: e.message || 'Image generation encountered an unexpected failure.'
    }));
  }
}
