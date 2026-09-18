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

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    logs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        type: 'AUTO_INCREMENTAL',
        status: 'SUCCESS',
        rowsChecked: 14,
        rowsImported: 0,
        duplicatesFiltered: 0,
        unknownRfidCount: 0,
        latencyMs: 140
      }
    ]
  }));
}
