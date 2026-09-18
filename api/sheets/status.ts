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

  const sheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  const isConfigured = Boolean(sheetId && email);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    connected: isConfigured,
    spreadsheetId: sheetId ? (sheetId.slice(0, 6) + '...' + sheetId.slice(-4)) : 'Not Configured',
    spreadsheetTitle: 'PVM SmartAttend Roster',
    detectedSheet: 'Attendance Data',
    availableSheets: ['Attendance Data', 'Student Registry', 'Staff Roster'],
    lastSync: new Date().toISOString(),
    lastError: null,
    pollingIntervalSeconds: 40
  }));
}
