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

  const apiKey = process.env.STUDY_SATHI_GEMINI || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'SERVICE_UNAVAILABLE',
      message: 'Vision analysis is temporarily unavailable because Gemini AI is not configured.'
    }));
    return;
  }

  try {
    const payload = await parseBody(req);
    const { image, query } = payload;

    if (!image) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Image data is required' }));
      return;
    }

    let mimeType = 'image/jpeg';
    let b64 = image;
    if (b64.includes(';base64,')) {
      const parts = b64.split(';base64,');
      mimeType = parts[0].replace('data:', '') || mimeType;
      b64 = parts[1];
    }

    const promptText = query || 'Please analyze this educational diagram or mathematical problem step-by-step and provide a rigorous, structured explanation.';
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];

    let analysis = '';
    let usedModel = candidateModels[0];

    for (const model of candidateModels) {
      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
        const apiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: promptText },
                { inlineData: { mimeType, data: b64 } }
              ]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048
            }
          })
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const candidate = data.candidates?.[0];
          analysis = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
          if (analysis) {
            usedModel = model;
            break;
          }
        }
      } catch {}
    }

    if (!analysis) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: 'VISION_ANALYSIS_FAILED',
        message: 'Could not analyze the image. Please try again.'
      }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      analysis,
      modelUsed: usedModel
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'SERVER_ERROR',
      message: err.message || 'Error processing image analysis.'
    }));
  }
}
