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

function sanitizeLogMessage(msg: string, keyToMask?: string): string {
  if (!msg) return '';
  let clean = msg;
  if (keyToMask && keyToMask.length > 5) {
    clean = clean.split(keyToMask).join('[MASKED_KEY]');
  }
  clean = clean.replace(/AIza[0-9A-Za-z-_]{35}/g, '[MASKED_KEY]');
  clean = clean.replace(/sk-[0-9A-Za-z-_]{32,}/g, '[MASKED_KEY]');
  return clean;
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

  const apiKey =
    process.env.PVM_SATHI_GEMINI ||
    process.env.GEMINI_API_KEY ||
    (process.env.NODE_ENV !== 'production' ? process.env.VITE_GEMINI_API_KEY : '') ||
    '';

  if (!apiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'SERVICE_UNAVAILABLE',
      errorCode: 'INVALID_API_KEY',
      message: 'PVM Sathi campus intelligence is temporarily offline because its AI key is not configured.'
    }));
    return;
  }

  try {
    const payload = await parseBody(req);
    const { query, history = [], attendanceContext, studentInfo, userRole } = payload;

    const pvmSystemPrompt = `You are PVM Sathi, the official digital campus and attendance assistant for Pranabananda Vidyamandir (Lumding, Assam).
You assist students, parents, faculty, and administrators with attendance inquiries, institutional schedules, campus gate turnstile updates, and academic timetables.
Attendance rules:
- Institutional gate reporting window: 07:30 AM to 08:00 AM IST.
- Late arrivals marked LATE from 08:00 AM to 08:15 AM IST.
- Sundays are institutional weekly holidays (never working days).
Current user role: ${userRole || 'STUDENT'}.
${attendanceContext ? `Verified Attendance Context: ${JSON.stringify(attendanceContext)}` : ''}
Be courteous, concise, professional, and accurate. Do not answer questions outside school policy.`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.sender && h.text) {
          contents.push({
            role: h.sender === 'USER' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: query || 'What is my current attendance status?' }]
    });

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash'
    ];

    let responseText = '';
    let usedModel = candidateModels[0];
    let lastErrorStatus = 500;
    let lastErrorCode = 'AI_PROVIDER_ERROR';
    let lastErrorMessage = '';

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 25000);

        const apiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: pvmSystemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024
            }
          }),
          signal: abortController.signal
        });

        clearTimeout(timeoutId);

        if (apiRes.ok) {
          const data = await apiRes.json();
          const candidate = data.candidates?.[0];
          responseText = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
          if (responseText) {
            usedModel = model;
            break;
          }
        } else {
          lastErrorStatus = apiRes.status;
          const errData = await apiRes.json().catch(() => ({}));
          const providerErr = errData?.error;
          lastErrorCode = providerErr?.status || `HTTP_${apiRes.status}`;
          lastErrorMessage = sanitizeLogMessage(providerErr?.message || `HTTP ${apiRes.status} Error`, apiKey);

          console.warn(`[PVM Sathi] model=${model} status=${apiRes.status} providerCode=${lastErrorCode} message=${lastErrorMessage}`);

          if (apiRes.status === 400 || apiRes.status === 401 || apiRes.status === 403) {
            break;
          }
        }
      } catch (callErr: any) {
        lastErrorMessage = sanitizeLogMessage(callErr.message || 'Connection error', apiKey);
        console.warn(`[PVM Sathi] model=${model} fetchError=${lastErrorMessage}`);
      }
    }

    if (!responseText) {
      res.statusCode = lastErrorStatus >= 400 && lastErrorStatus < 600 ? lastErrorStatus : 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: 'AI_PROVIDER_ERROR',
        errorCode: lastErrorCode,
        message: lastErrorMessage || 'Could not query campus AI engine.'
      }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      text: responseText,
      success: true,
      modelUsed: usedModel
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'INTERNAL_ERROR',
      message: sanitizeLogMessage(err.message || 'Internal server error in PVM Sathi.', apiKey)
    }));
  }
}
