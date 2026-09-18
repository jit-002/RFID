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
    const { image, editInstruction, prompt } = payload;
    const instruction = editInstruction || prompt;

    if (!image || !instruction) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Source image and edit instruction are required' }));
      return;
    }

    const workerUrl = process.env.SATHI_IMAGE_WORKER_URL;
    const workerToken = process.env.SATHI_IMAGE_WORKER_TOKEN;

    if (!workerUrl || !workerToken) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        errorCode: 'IMAGE_GENERATION_NOT_CONFIGURED',
        message: 'Image editing is not configured. SATHI_IMAGE_WORKER_URL and SATHI_IMAGE_WORKER_TOKEN required.'
      }));
      return;
    }

    const generationId = 'edit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    const cfRes = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + workerToken
      },
      body: JSON.stringify({
        mode: 'EDIT',
        sourceImage: image,
        editInstruction: instruction,
        prompt: instruction,
        generationId
      })
    });

    if (!cfRes.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        errorCode: 'IMAGE_EDITING_FAILED',
        message: 'Image editing failed.'
      }));
      return;
    }

    const data = await cfRes.json();
    if (!data.imageUrl) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        errorCode: 'IMAGE_EDITING_FAILED',
        message: 'Image editing failed.'
      }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      imageUrl: data.imageUrl,
      generationId,
      metadata: { mode: 'EDIT', instruction }
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      errorCode: 'IMAGE_EDITING_FAILED',
      message: 'Image editing failed: ' + (err.message || 'Internal server error')
    }));
  }
}
