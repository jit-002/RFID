import healthHandler from './api/ai/health';
import studySathiHandler from './api/ai/study-sathi';
import pvmSathiHandler from './api/ai/pvm-sathi';
import sathiCreativeGenerateHandler from './api/sathi-creative/generate';
import sathiCreativeEditHandler from './api/sathi-creative/edit';
import sathiCreativeAnalyzeHandler from './api/sathi-creative/analyze';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { AttendanceSyncEngine } from './src/services/attendanceSyncEngine';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  const syncEngine = new AttendanceSyncEngine();
  const sheetsService = syncEngine.getSheetsService();
  let serverConfig = {
    pollingIntervalSeconds: 10,
    spreadsheetId: sheetsService.getSpreadsheetId(),
    lastSuccessfulSync: null as string | null,
    lastError: null as string | null
  };
  let recentScansCache: any[] = [];
  let unknownScansCache: any[] = [];
  let manualRecordsCache: any[] = [];

  return {
    plugins: [
      react(),
      {
        name: 'attendance-sync-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            const pathname = parsedUrl.pathname;
            const searchParams = parsedUrl.searchParams;

            // Global CORS Headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            if (req.method === 'OPTIONS') {
              res.writeHead(204);
              res.end();
              return;
            }

            const sendJson = (status: number, data: any) => {
              res.writeHead(status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            };

            const parseBody = async (): Promise<any> => {
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
            };

            // 1. Health: GET /health
            if (pathname === '/health') {
              return sendJson(200, {
                status: 'ONLINE',
                mode: 'READ_ONLY_GOOGLE_SHEETS',
                spreadsheetId: sheetsService.getSpreadsheetId()
              });
            }

            // 2. Google Sheets Status: GET /api/sheets/status
            if (pathname === '/api/sheets/status' && req.method === 'GET') {
              try {
                const isConfigured = sheetsService.isConfigured();
                let meta = null;
                let detectedSheet = 'Attendance Data';
                if (isConfigured) {
                  meta = await sheetsService.getSpreadsheetMetadata();
                  const discovery = await sheetsService.discoverRfidSheet();
                  detectedSheet = discovery.sheetTitle;
                }
                return sendJson(200, {
                  connected: isConfigured && Boolean(meta),
                  spreadsheetId: sheetsService.getSpreadsheetId(),
                  spreadsheetTitle: meta?.title || 'SmartAttend Sheets',
                  detectedSheet,
                  availableSheets: meta?.sheets?.map(s => s.title) || [],
                  lastSync: serverConfig.lastSuccessfulSync,
                  lastError: serverConfig.lastError,
                  pollingIntervalSeconds: serverConfig.pollingIntervalSeconds
                });
              } catch (err: any) {
                return sendJson(200, {
                  connected: false,
                  spreadsheetId: sheetsService.getSpreadsheetId(),
                  error: err.message,
                  lastSync: serverConfig.lastSuccessfulSync,
                  lastError: err.message,
                  pollingIntervalSeconds: serverConfig.pollingIntervalSeconds
                });
              }
            }

            // 3. Incremental Sync: POST /api/sheets/sync
            if (pathname === '/api/sheets/sync' && req.method === 'POST') {
              try {
                const result = await syncEngine.syncIncremental();
                if (result.success) {
                  serverConfig.lastSuccessfulSync = result.timestamp;
                  serverConfig.lastError = null;
                } else if (result.errors.length > 0) {
                  serverConfig.lastError = result.errors.join('; ');
                }

                if (result.recentScans && result.recentScans.length > 0) {
                  const map = new Map<string, any>();
                  // New scans prioritized
                  result.recentScans.forEach((s: any) => {
                    const key = `${s.date || ''}-${s.studentId || s.rfidUid || ''}-${s.timestamp || ''}`;
                    if (!map.has(key)) map.set(key, s);
                  });
                  // Retain existing non-duplicate scans
                  recentScansCache.forEach((s: any) => {
                    const key = `${s.date || ''}-${s.studentId || s.rfidUid || ''}-${s.timestamp || ''}`;
                    if (!map.has(key)) map.set(key, s);
                  });
                  recentScansCache = Array.from(map.values()).slice(0, 30);
                }
                if (result.unknownScans && result.unknownScans.length > 0) {
                  const uMap = new Map<string, any>();
                  result.unknownScans.forEach((u: any) => {
                    const key = `${u.rfid || ''}-${u.timestamp || ''}`;
                    if (!uMap.has(key)) uMap.set(key, u);
                  });
                  unknownScansCache.forEach((u: any) => {
                    const key = `${u.rfid || ''}-${u.timestamp || ''}`;
                    if (!uMap.has(key)) uMap.set(key, u);
                  });
                  unknownScansCache = Array.from(uMap.values()).slice(0, 30);
                }

                return sendJson(200, {
                  success: result.success,
                  checkedRows: result.checkedRows,
                  newRows: result.newRows,
                  processed: result.processed,
                  duplicates: result.duplicates,
                  unknownRfid: result.unknownRfid,
                  present: result.present,
                  errors: result.errors,
                  lastProcessedCursor: result.lastProcessedCursor,
                  timestamp: result.timestamp
                });
              } catch (err: any) {
                serverConfig.lastError = err.message;
                return sendJson(500, { success: false, error: err.message });
              }
            }

            // 4. Recent RFID Scans & Full Verified Attendance: GET /api/attendance/recent-scans
            if (pathname === '/api/attendance/recent-scans' && req.method === 'GET') {
              let allRecords = await syncEngine.readAllDateTabsScans();
              if (manualRecordsCache.length > 0) {
                const map = new Map<string, any>();
                allRecords.forEach(r => map.set(`${r.date}-${r.personId.toUpperCase()}`, r));
                manualRecordsCache.forEach(m => map.set(`${m.date}-${m.personId.toUpperCase()}`, m));
                allRecords = Array.from(map.values());
              }

              let scans = recentScansCache;
              if (scans.length === 0 && allRecords.length > 0) {
                scans = allRecords.map(r => ({
                  timestamp: r.timeDisplay,
                  studentId: r.personId,
                  studentName: r.personName,
                  status: r.status,
                  rfidUid: r.rfidUid,
                  date: r.date
                }));
              }

              // Guarantee strict deduplication before sending to client
              const dedupMap = new Map<string, any>();
              scans.forEach(s => {
                const key = `${s.date || ''}-${s.studentId || s.rfidUid || ''}-${s.timestamp || ''}`;
                if (!dedupMap.has(key)) dedupMap.set(key, s);
              });
              const uniqueScans = Array.from(dedupMap.values()).slice(0, 30);

              return sendJson(200, {
                scans: uniqueScans,
                allAttendance: allRecords,
                unknownScans: unknownScansCache
              });
            }

            // 4b. All Attendance Records: GET /api/attendance/records
            if (pathname === '/api/attendance/records' && req.method === 'GET') {
              const allRecords = await syncEngine.readAllDateTabsScans();
              return sendJson(200, {
                records: allRecords
              });
            }

            // 5. Finalize Absent: POST /api/attendance/finalize-absent
            if (pathname === '/api/attendance/finalize-absent' && req.method === 'POST') {
              const body = await parseBody();
              const result = await syncEngine.finalizeAbsentStudents(body.date);
              return sendJson(200, {
                success: true,
                finalized: result.finalized,
                absentMarked: result.absentMarked
              });
            }

            // 5b. Manual / Backdated Attendance Entry: POST /api/attendance/manual-record
            if (pathname === '/api/attendance/manual-record' && req.method === 'POST') {
              try {
                const body = await parseBody();
                const { studentId, date, status, time, reason } = body;

                if (!studentId || !date || !status) {
                  return sendJson(400, { success: false, error: 'studentId, date, and status are required' });
                }

                const students = await syncEngine.getActiveStudents();
                const matchedStudent = students.find(s =>
                  s.studentId.toUpperCase() === String(studentId).toUpperCase() ||
                  s.id.toUpperCase() === String(studentId).toUpperCase() ||
                  s.studentName.toLowerCase() === String(studentId).toLowerCase()
                ) || {
                  studentId: String(studentId),
                  studentName: String(body.studentName || studentId),
                  classGrade: body.classGrade || '12',
                  section: body.section || 'Science',
                  rollNumber: body.rollNumber || '01',
                  rfidUid: body.rfidUid || 'MANUAL-ENTRY',
                  parentMobile: body.parentMobile || '+91 94350 00000',
                  parentGmail: body.parentGmail || 'parent@pvmlumding.edu'
                };

                const attId = `ATT-${date.replace(/-/g, '')}-${matchedStudent.studentId}`;
                const checkInTime = time || (status === 'PRESENT' ? '08:15:00' : '-');

                // 1. Write to Google Sheets Date Tab (e.g. 2026-09-09)
                const dateTabHeaders = [
                  'Student ID', 'Student Name', 'Class', 'Section', 'Roll Number',
                  'RFID UID', 'Check-in Time', 'Status', 'Attendance ID', 'Source',
                  'Website Update Status', 'Website Updated At', 'Website Sync ID',
                  'Website Error', 'Notification Triggered', 'Notification Status',
                  'WhatsApp Status', 'Gmail Status'
                ];

                try {
                  await sheetsService.createTabIfNotExists(date, dateTabHeaders);
                  const existingDateRows = await sheetsService.readRange(`'${date}'!A1:R100`);
                  let rowIndexToUpdate = -1;

                  if (existingDateRows && existingDateRows.length > 1) {
                    for (let r = 1; r < existingDateRows.length; r++) {
                      const rowId = String(existingDateRows[r][0] || '').trim();
                      const rowName = String(existingDateRows[r][1] || '').trim();
                      if (
                        rowId.toUpperCase() === matchedStudent.studentId.toUpperCase() ||
                        rowName.toLowerCase() === matchedStudent.studentName.toLowerCase()
                      ) {
                        rowIndexToUpdate = r + 1;
                        break;
                      }
                    }
                  }

                  const dateRowValues = [
                    matchedStudent.studentId,
                    matchedStudent.studentName,
                    matchedStudent.classGrade,
                    matchedStudent.section,
                    matchedStudent.rollNumber,
                    matchedStudent.rfidUid,
                    checkInTime,
                    status,
                    attId,
                    'STAFF_MANUAL',
                    'UPDATED',
                    new Date().toISOString(),
                    'MANUAL_SYNC',
                    reason || '',
                    'YES',
                    'SENT',
                    'SENT',
                    'SENT'
                  ];

                  if (rowIndexToUpdate > 1) {
                    await sheetsService.updateRange(`'${date}'!A${rowIndexToUpdate}:R${rowIndexToUpdate}`, [dateRowValues]);
                  } else {
                    await sheetsService.appendRow(date, dateRowValues);
                  }
                } catch (sheetErr: any) {
                  console.warn(`[API] Google Sheet date tab sync note for ${date}:`, sheetErr?.message || sheetErr);
                }

                // 2. Write to master 'Attendance Data' tab
                try {
                  const masterHeaders = [
                    'Date', 'Attendance ID', 'Student ID', 'Student Name', 'Class',
                    'Section', 'Status', 'Check-in Time', 'Parent Mobile', 'Parent Gmail',
                    'WhatsApp Status', 'Gmail Status', 'Notification Date', 'Source',
                    'Verification Method', 'Website Update Status', 'Website Updated At',
                    'Website Sync ID', 'Website Error', 'Notification Triggered', 'Notification Status'
                  ];
                  await sheetsService.createTabIfNotExists('Attendance Data', masterHeaders);
                  const masterRows = await sheetsService.readRange(`'Attendance Data'!A1:U200`);
                  let masterRowToUpdate = -1;

                  if (masterRows && masterRows.length > 1) {
                    for (let r = 1; r < masterRows.length; r++) {
                      const rDate = String(masterRows[r][0] || '').trim();
                      const rId = String(masterRows[r][2] || '').trim();
                      const rName = String(masterRows[r][3] || '').trim();
                      if (
                        rDate === date &&
                        (rId.toUpperCase() === matchedStudent.studentId.toUpperCase() ||
                         rName.toLowerCase() === matchedStudent.studentName.toLowerCase())
                      ) {
                        masterRowToUpdate = r + 1;
                        break;
                      }
                    }
                  }

                  const masterRowValues = [
                    date,
                    attId,
                    matchedStudent.studentId,
                    matchedStudent.studentName,
                    matchedStudent.classGrade,
                    matchedStudent.section,
                    status,
                    checkInTime,
                    matchedStudent.parentMobile.startsWith('+') ? `'${matchedStudent.parentMobile}` : `'+91 ${matchedStudent.parentMobile}`,
                    matchedStudent.parentGmail,
                    'SENT',
                    'SENT',
                    date,
                    'STAFF_MANUAL',
                    'STAFF_ENTRY',
                    'UPDATED',
                    new Date().toISOString(),
                    'MANUAL_SYNC',
                    reason || '',
                    'YES',
                    'SENT'
                  ];

                  if (masterRowToUpdate > 1) {
                    await sheetsService.updateRange(`'Attendance Data'!A${masterRowToUpdate}:U${masterRowToUpdate}`, [masterRowValues]);
                  } else {
                    await sheetsService.appendRow('Attendance Data', masterRowValues);
                  }
                } catch (masterErr: any) {
                  console.warn(`[API] Google Sheet Attendance Data sync note:`, masterErr?.message || masterErr);
                }

                // Return created/updated record
                const createdRecord = {
                  id: attId,
                  personId: matchedStudent.studentId,
                  personType: 'STUDENT',
                  personName: matchedStudent.studentName,
                  classOrDept: `Class ${matchedStudent.classGrade}-${matchedStudent.section}`,
                  date,
                  timestamp: `${date}T${checkInTime === '-' ? '08:15:00' : checkInTime}`,
                  timeDisplay: checkInTime,
                  status,
                  verificationMethod: 'MANUAL_STAFF',
                  deviceId: 'staff-portal',
                  location: 'Faculty Desk',
                  rfidUid: matchedStudent.rfidUid,
                  parentNotified: true,
                  googleSheetsSynced: true,
                  isCorrected: true,
                  correctionReason: reason || 'Staff backdated manual entry'
                };

                manualRecordsCache = [
                  createdRecord,
                  ...manualRecordsCache.filter(m => !(m.personId === createdRecord.personId && m.date === createdRecord.date))
                ];

                return sendJson(200, {
                  success: true,
                  record: createdRecord,
                  message: `Successfully marked ${matchedStudent.studentName} as ${status} for ${date}.`
                });
              } catch (err: any) {
                console.error('[API] manual-record error:', err);
                return sendJson(500, { success: false, error: err.message });
              }
            }

            // 6. Settings Config: GET/POST /api/sheets/config
            if (pathname === '/api/sheets/config') {
              if (req.method === 'POST') {
                const body = await parseBody();
                if (body.pollingIntervalSeconds && [10, 20, 30, 60, 300, 1200].includes(Number(body.pollingIntervalSeconds))) {
                  serverConfig.pollingIntervalSeconds = Number(body.pollingIntervalSeconds);
                }
                return sendJson(200, { success: true, config: serverConfig });
              }
              return sendJson(200, { config: serverConfig });
            }

            // 7. Users Roster from Google Sheet & Supabase: GET /api/users
            if (pathname === '/api/users' && req.method === 'GET') {
              const students = await syncEngine.getActiveStudents();
              return sendJson(200, {
                users: students.map(s => ({
                  id: s.id,
                  studentId: s.studentId,
                  studentName: s.studentName,
                  name: s.studentName,
                  classGrade: s.classGrade,
                  section: s.section,
                  rollNumber: s.rollNumber,
                  rollNo: s.rollNumber,
                  phoneNumber: s.parentMobile || s.phoneNumber,
                  parentName: s.parentName,
                  parentMobile: s.parentMobile,
                  parentGmail: s.parentGmail,
                  parentPhone: s.parentMobile,
                  parentEmail: s.parentGmail,
                  rfidUid: s.rfidUid,
                  active: s.active,
                  status: s.active ? 'ACTIVE' : 'SUSPENDED'
                }))
              });
            }

            // 8. Update User: PATCH /api/users/:id
            if (pathname?.startsWith('/api/users/') && req.method === 'PATCH') {
              const targetId = pathname.replace('/api/users/', '').trim();
              const body = await parseBody();
              const current = await syncEngine.getActiveStudents();
              const found = current.find(s => s.id === targetId || s.studentId === targetId);
              if (found) {
                if (body.studentName || body.name) found.studentName = body.studentName || body.name;
                if (body.classGrade) found.classGrade = body.classGrade;
                if (body.section) found.section = body.section;
                if (body.rollNumber || body.rollNo) found.rollNumber = body.rollNumber || body.rollNo;
                if (body.rfidUid !== undefined) found.rfidUid = syncEngine.normalizeRfidUid(body.rfidUid);
                if (body.parentMobile || body.parentPhone) found.parentMobile = body.parentMobile || body.parentPhone;
                if (body.parentGmail || body.parentEmail) found.parentGmail = body.parentGmail || body.parentEmail;
              }
              return sendJson(200, { success: true, user: found });
            }

            // Shared Production API Handlers: Dev-Prod Parity
            if (pathname === '/api/ai/health') {
              return healthHandler(req, res);
            }
            if (pathname === '/api/ai/study-sathi') {
              return studySathiHandler(req, res);
            }
            if (pathname === '/api/ai/pvm-sathi') {
              return pvmSathiHandler(req, res);
            }
            if (pathname === '/api/sathi-creative/generate') {
              return sathiCreativeGenerateHandler(req, res);
            }
            if (pathname === '/api/sathi-creative/edit') {
              return sathiCreativeEditHandler(req, res);
            }
            if (pathname === '/api/sathi-creative/analyze') {
              return sathiCreativeAnalyzeHandler(req, res);
            }

            next();
          });
        }
      }
    ],
    server: {
      port: 5173,
      host: true
    }
  };
});
