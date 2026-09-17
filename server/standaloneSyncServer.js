/**
 * SmartAttend — Standalone Production Backend & Attendance Synchronization Server
 *
 * HARD ARCHITECTURAL MANDATES:
 * 1. Google Sheets is strictly READ-ONLY. Never write, append, edit, or format the sheet.
 * 2. Supabase is the sole website database for User Management and Attendance Records.
 * 3. Never communicate with ESP8266 or RFID reader hardware.
 * 4. Never send WhatsApp or Gmail notifications (handled solely by existing n8n).
 * 5. Serves clean REST API endpoints for Frontend consumption.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Auto-load .env
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.warn('Could not auto-load .env:', e?.message || e);
}

import { GoogleSheetsService } from '../src/services/googleSheetsService.ts';
import { AttendanceSyncEngine } from '../src/services/attendanceSyncEngine.ts';

const PORT = process.env.PORT || 3001;
const syncEngine = new AttendanceSyncEngine();
const sheetsService = syncEngine.getSheetsService();

// Supabase server-side client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wrddfwmdowtklncazczs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err: any) {
    console.warn('[Server] Supabase client warning:', err.message);
  }
}

// In-memory cache for fast UI updates & recent scans
let lastSyncResult: any = {
  success: true,
  timestamp: null,
  checkedRows: 0,
  newRows: 0,
  processed: 0,
  duplicates: 0,
  unknownRfid: 0,
  present: 0,
  errors: []
};
let recentScansCache: any[] = [];
let isSyncingServer = false;
let unknownRfidList: any[] = [];
let serverConfig = {
  pollingIntervalSeconds: 40,
  spreadsheetId: sheetsService.getSpreadsheetId(),
  lastSuccessfulSync: null as string | null,
  lastError: null as string | null
};

// Helper to parse JSON body
async function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
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

  const jsonResponse = (statusCode: number, data: any) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  try {
    // 1. Health check: GET /health
    if (pathname === '/health' || pathname === '/') {
      isSyncingServer = false;
        return jsonResponse(200, {
        status: 'ONLINE',
        mode: 'READ_ONLY_GOOGLE_SHEETS',
        service: 'SmartAttend Sync & Supabase User Management API',
        lastSync: serverConfig.lastSuccessfulSync,
        spreadsheetId: serverConfig.spreadsheetId,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Google Sheets Connection Status: GET /api/sheets/status
    if (req.method === 'GET' && pathname === '/api/sheets/status') {
      try {
        const isConfigured = sheetsService.isConfigured();
        let metadata: any = null;
        let detectedSheet = 'Attendance Data';
        if (isConfigured) {
          metadata = await sheetsService.getSpreadsheetMetadata();
          const discovery = await sheetsService.discoverRfidSheet();
          detectedSheet = discovery.sheetTitle;
        }

        return jsonResponse(200, {
          connected: isConfigured && Boolean(metadata),
          spreadsheetId: sheetsService.getSpreadsheetId(),
          spreadsheetTitle: metadata?.title || 'SmartAttend Sheets',
          detectedSheet,
          availableSheets: metadata?.sheets?.map((s: any) => s.title) || [],
          lastSync: serverConfig.lastSuccessfulSync,
          lastError: serverConfig.lastError,
          pollingIntervalSeconds: serverConfig.pollingIntervalSeconds
        });
      } catch (err: any) {
        serverConfig.lastError = err.message;
        return jsonResponse(200, {
          connected: false,
          spreadsheetId: sheetsService.getSpreadsheetId(),
          error: err.message,
          lastSync: serverConfig.lastSuccessfulSync,
          lastError: err.message,
          pollingIntervalSeconds: serverConfig.pollingIntervalSeconds
        });
      }
    }

    // 3. Incremental Sync Trigger: POST /api/sheets/sync
    if (req.method === 'POST' && pathname === '/api/sheets/sync') {
      if (isSyncingServer) {
        return jsonResponse(429, { success: false, error: 'Sync already in progress. Concurrent sync prevented.' });
      }
      isSyncingServer = true;
      try {
        const syncResult = await syncEngine.syncIncremental();
        lastSyncResult = syncResult;

        if (syncResult.success) {
          serverConfig.lastSuccessfulSync = syncResult.timestamp;
          serverConfig.lastError = null;
        } else if (syncResult.errors.length > 0) {
          serverConfig.lastError = syncResult.errors.join('; ');
        }

        // Prepend new recent scans and cap at 30 unique items
        if (syncResult.recentScans && syncResult.recentScans.length > 0) {
          const map = new Map();
          syncResult.recentScans.forEach((s) => {
            const key = `${s.date || ''}-${s.studentId || s.rfidUid || ''}-${s.timestamp || ''}`;
            if (!map.has(key)) map.set(key, s);
          });
          recentScansCache.forEach((s) => {
            const key = `${s.date || ''}-${s.studentId || s.rfidUid || ''}-${s.timestamp || ''}`;
            if (!map.has(key)) map.set(key, s);
          });
          recentScansCache = Array.from(map.values()).slice(0, 30);
        }

        // Track unknown RFIDs
        if (syncResult.unknownScans && syncResult.unknownScans.length > 0) {
          const uMap = new Map();
          syncResult.unknownScans.forEach((u) => {
            const key = `${u.rfid || ''}-${u.timestamp || ''}`;
            if (!uMap.has(key)) uMap.set(key, u);
          });
          unknownRfidList.forEach((u) => {
            const key = `${u.rfid || ''}-${u.timestamp || ''}`;
            if (!uMap.has(key)) uMap.set(key, u);
          });
          unknownRfidList = Array.from(uMap.values()).slice(0, 30);
        }

        return jsonResponse(200, {
          success: syncResult.success,
          checkedRows: syncResult.checkedRows,
          newRows: syncResult.newRows,
          processed: syncResult.processed,
          duplicates: syncResult.duplicates,
          unknownRfid: syncResult.unknownRfid,
          present: syncResult.present,
          errors: syncResult.errors,
          lastProcessedCursor: syncResult.lastProcessedCursor,
          timestamp: syncResult.timestamp
        });
      } catch (syncEx: any) {
        isSyncingServer = false;
        serverConfig.lastError = syncEx.message;
        return jsonResponse(500, {
          success: false,
          error: syncEx.message
        });
      }
    }

    // 4. Today's Attendance: GET /api/attendance/today
    if (req.method === 'GET' && pathname === '/api/attendance/today') {
      const kolkataNow = syncEngine.getKolkataTime();
      const dateStr = searchParams.get('date') || kolkataNow.dateStr;

      if (!supabase) {
        return jsonResponse(200, { records: [], total: 0, date: dateStr });
      }

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', dateStr)
        .order('timestamp', { ascending: false });

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(200, {
        records: data || [],
        total: data?.length || 0,
        date: dateStr
      });
    }

    // 5. Recent RFID Scans: GET /api/attendance/recent-scans
    if (req.method === 'GET' && pathname === '/api/attendance/recent-scans') {
      return jsonResponse(200, {
        scans: recentScansCache,
        unknownScans: unknownRfidList
      });
    }

    // 6. Finalize Absent Students (Cutoff): POST /api/attendance/finalize-absent
    if (req.method === 'POST' && pathname === '/api/attendance/finalize-absent') {
      const body = await parseJsonBody(req);
      const result = await syncEngine.finalizeAbsentStudents(body.date);
      return jsonResponse(200, {
        success: true,
        finalized: result.finalized,
        absentMarked: result.absentMarked
      });
    }

    // 7. Users Management: GET /api/users
    if (req.method === 'GET' && pathname === '/api/users') {
      if (!supabase) {
        return jsonResponse(200, { users: [] });
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('roll_no', { ascending: true });

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      const users = (data || []).map((s: any) => ({
        id: s.id,
        studentId: s.admission_no || s.student_id || s.id,
        studentName: s.name,
        classGrade: s.class_grade || '12',
        section: s.section || 'Science',
        rollNumber: s.roll_no || '1',
        phoneNumber: s.parent_phone || '',
        parentName: s.parent_name || 'Guardian',
        parentMobile: s.parent_phone || '',
        parentGmail: s.parent_email || '',
        rfidUid: syncEngine.normalizeRfidUid(s.rfid_uid || ''),
        active: s.status === 'ACTIVE',
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }));

      return jsonResponse(200, { users });
    }

    // 8. Add User: POST /api/users
    if (req.method === 'POST' && pathname === '/api/users') {
      const body = await parseJsonBody(req);
      if (!supabase) {
        return jsonResponse(500, { error: 'Database connection not initialized' });
      }

      const rfidUid = syncEngine.normalizeRfidUid(body.rfidUid || '');

      // Check RFID Uniqueness in Supabase
      if (rfidUid) {
        const { data: existingRfid } = await supabase
          .from('students')
          .select('id, name')
          .eq('status', 'ACTIVE')
          .eq('rfid_uid', rfidUid)
          .maybeSingle();

        if (existingRfid) {
          return jsonResponse(400, {
            error: `RFID card is already assigned to another student (${existingRfid.name}).`
          });
        }
      }

      const { data, error } = await supabase
        .from('students')
        .insert({
          admission_no: body.studentId || `PVM${Date.now().toString().slice(-4)}`,
          name: body.studentName,
          class_grade: body.classGrade || '12',
          section: body.section || 'Science',
          roll_no: body.rollNumber || '1',
          rfid_uid: rfidUid || null,
          parent_name: body.parentName || `Parent of ${body.studentName}`,
          parent_phone: body.parentMobile || body.phoneNumber || '+91 94350 00000',
          parent_email: body.parentGmail || body.email || null,
          status: body.active === false ? 'SUSPENDED' : 'ACTIVE'
        })
        .select()
        .single();

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(201, { success: true, user: data });
    }

    // 9. Edit User: PATCH /api/users/:id
    if (req.method === 'PATCH' && pathname.startsWith('/api/users/')) {
      const id = pathname.replace('/api/users/', '').split('/')[0];
      const body = await parseJsonBody(req);

      if (!supabase) {
        return jsonResponse(500, { error: 'Database connection not initialized' });
      }

      const updates: any = {};
      if (body.studentName) updates.name = body.studentName;
      if (body.classGrade) updates.class_grade = body.classGrade;
      if (body.section) updates.section = body.section;
      if (body.rollNumber) updates.roll_no = body.rollNumber;
      if (body.phoneNumber || body.parentMobile) updates.parent_phone = body.phoneNumber || body.parentMobile;
      if (body.parentGmail || body.parentEmail) updates.parent_email = body.parentGmail || body.parentEmail;
      if (body.parentName) updates.parent_name = body.parentName;
      if (body.active !== undefined) updates.status = body.active ? 'ACTIVE' : 'SUSPENDED';

      if (body.rfidUid !== undefined) {
        const cleanRfid = syncEngine.normalizeRfidUid(body.rfidUid);
        if (cleanRfid) {
          // Check if UID is already assigned to ANOTHER active student
          const { data: existingRfid } = await supabase
            .from('students')
            .select('id, name')
            .eq('status', 'ACTIVE')
            .eq('rfid_uid', cleanRfid)
            .neq('id', id)
            .maybeSingle();

          if (existingRfid) {
            return jsonResponse(400, {
              error: `RFID card is already assigned to another student (${existingRfid.name}).`
            });
          }
        }
        updates.rfid_uid = cleanRfid || null;
      }

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(200, { success: true, user: data });
    }

    // 10. Soft-Delete User: DELETE /api/users/:id
    if (req.method === 'DELETE' && pathname.startsWith('/api/users/')) {
      const id = pathname.replace('/api/users/', '').split('/')[0];
      if (!supabase) {
        return jsonResponse(500, { error: 'Database connection not initialized' });
      }

      // Soft delete: sets status to 'SUSPENDED' to preserve historical attendance
      const { error } = await supabase
        .from('students')
        .update({ status: 'SUSPENDED', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(200, { success: true, message: 'User deactivated successfully' });
    }

    // 11. Assign RFID UID: POST /api/users/:id/assign-rfid
    if (req.method === 'POST' && pathname.includes('/assign-rfid')) {
      const parts = pathname.split('/');
      const id = parts[3];
      const body = await parseJsonBody(req);
      const cleanRfid = syncEngine.normalizeRfidUid(body.rfidUid);

      if (!cleanRfid) {
        return jsonResponse(400, { error: 'Valid RFID UID is required' });
      }

      if (!supabase) {
        return jsonResponse(500, { error: 'Database connection not initialized' });
      }

      // Validate against all other active students
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id, name')
        .eq('status', 'ACTIVE')
        .eq('rfid_uid', cleanRfid)
        .neq('id', id)
        .maybeSingle();

      if (existingStudent) {
        return jsonResponse(400, {
          error: `RFID card is already assigned to another student (${existingStudent.name}).`
        });
      }

      // Update student RFID in Supabase
      const { data, error } = await supabase
        .from('students')
        .update({ rfid_uid: cleanRfid, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      // Remove from unknown RFIDs if present
      unknownRfidList = unknownRfidList.filter(u => syncEngine.normalizeRfidUid(u.rfid) !== cleanRfid);

      return jsonResponse(200, { success: true, user: data, rfidUid: cleanRfid });
    }

    
    // 11b. Attendance Sync Logs: GET /api/attendance/sync-logs
    if (req.method === 'GET' && pathname === '/api/attendance/sync-logs') {
      try {
        const { getSyncLogs } = await import('../src/services/syncHandler.ts');
        const logs = getSyncLogs ? getSyncLogs() : [];
        return jsonResponse(200, { success: true, logs });
      } catch (err: any) {
        return jsonResponse(200, { success: true, logs: [] });
      }
    }

    // 12. Settings Configuration: GET/POST /api/sheets/config
    if (pathname === '/api/sheets/config') {
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (body.pollingIntervalSeconds && [10, 20, 30, 40, 60, 300, 1200].includes(Number(body.pollingIntervalSeconds))) {
          serverConfig.pollingIntervalSeconds = Number(body.pollingIntervalSeconds);
        }
        return jsonResponse(200, { success: true, config: serverConfig });
      }
      return jsonResponse(200, { config: serverConfig });
    }

    // 404 for unknown endpoints
    return jsonResponse(404, { error: `Endpoint not found: ${req.method} ${pathname}` });

  } catch (globalErr: any) {
    console.error('[Server Error]', globalErr);
    return jsonResponse(500, { error: globalErr?.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`SmartAttend Backend API Server running on port ${PORT}`);
  console.log(`Mode: READ-ONLY Google Sheets Ingestion (Never writes to sheet)`);
  console.log(`Persistence: Supabase PostgreSQL for Users & Attendance`);
  console.log(`=======================================================`);
});
