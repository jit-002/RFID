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

    const model = 'gemini-2.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
      })
    });

    if (!apiRes.ok) {
      const errData = await apiRes.json().catch(() => ({}));
      res.statusCode = apiRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'AI_PROVIDER_ERROR',
        message: errData?.error?.message || 'Could not query campus AI engine.'
      }));
      return;
    }

    const data = await apiRes.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || 'I am ready to assist with your campus attendance inquiries.';

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      text,
      success: true,
      modelUsed: model
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error in PVM Sathi.'
    }));
  }
}
