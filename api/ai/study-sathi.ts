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

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'SERVICE_UNAVAILABLE',
      message: 'Study Sathi is temporarily unavailable because its AI service is not configured.'
    }));
    return;
  }

  try {
    const payload = await parseBody(req);
    const { query, history = [], files = [], images = [], studentName, classGrade, section } = payload;

    if (!query && files.length === 0 && images.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'INVALID_REQUEST', message: 'Query or attachments required' }));
      return;
    }

    // System prompt for Study Sathi (PVM Sathi 2.0)
    const systemPrompt = `You are Study Sathi (PVM Sathi 2.0), an elite personal academic tutor and STEM mentor at Pranabananda Vidyamandir (PVM Lumding).
Student: ${studentName || 'Student'}, Class: ${classGrade || '12'} ${section || 'Science'}.
Provide clear, rigorous, pedagogical explanations across Mathematics, Physics, Chemistry, Biology, and Computer Science.
When solving problems, provide step-by-step mathematical reasoning with KaTeX/LaTeX formatting ($...$ inline, $$...$$ block).
Be encouraging, academic, and structured.`;

    // Construct Gemini contents array
    const contents: any[] = [];

    // Add previous history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-8)) {
        if (h.role && h.text) {
          contents.push({
            role: h.role === 'user' || h.role === 'STUDENT' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
      }
    }

    // Build current user message parts
    const currentParts: any[] = [];
    currentParts.push({ text: query || 'Please analyze this problem step-by-step.' });

    // Handle image attachments for vision questions
    const allImages = [...(images || []), ...(files || []).filter((f: any) => f.type?.startsWith('image/') || f.base64?.startsWith('data:image/'))];
    for (const img of allImages) {
      let b64 = img.base64 || '';
      let mimeType = img.type || 'image/jpeg';
      if (b64.includes(';base64,')) {
        const split = b64.split(';base64,');
        mimeType = split[0].replace('data:', '') || mimeType;
        b64 = split[1];
      }
      if (b64) {
        currentParts.push({
          inlineData: {
            mimeType,
            data: b64
          }
        });
      }
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    // Model fallback hierarchy
    const candidateModels = [
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ];

    let responseText = '';
    let usedModel = candidateModels[0];
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const apiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 2048
            }
          })
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const candidate = data.candidates?.[0];
          responseText = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
          if (responseText) {
            usedModel = model;
            break;
          }
        } else {
          const errData = await apiRes.json().catch(() => ({}));
          lastError = errData?.error?.message || `HTTP ${apiRes.status}`;
        }
      } catch (callErr: any) {
        lastError = callErr.message;
      }
    }

    if (!responseText) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'PROVIDER_ERROR',
        message: 'Study Sathi could not generate a response. ' + (lastError || 'Please try again.')
      }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      text: responseText,
      modelUsed: usedModel,
      success: true
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred in Study Sathi.'
    }));
  }
}
