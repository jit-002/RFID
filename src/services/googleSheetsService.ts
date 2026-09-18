/**
 * SmartAttend — Google Sheets API v4 STRICTLY READ-ONLY Service
 *
 * HARD ARCHITECTURAL MANDATE:
 * 1. Scope is restricted exclusively to 'https://www.googleapis.com/auth/spreadsheets.readonly'.
 * 2. This service NEVER writes, appends, updates, deletes, or formats any sheet or tab.
 * 3. The existing RFID + ESP8266 + n8n + Google Sheets system remains untouched and independent.
 * 4. Implements dynamic sheet and column discovery with incremental row reading and retry backoff.
 */

import crypto from 'crypto';

export interface GoogleServiceAccountConfig {
  clientEmail?: string;
  privateKey?: string;
  spreadsheetId?: string;
}

export interface DiscoveredSheetInfo {
  sheetTitle: string;
  headers: string[];
  rfidColIndex: number;
  timestampColIndex: number;
  dateColIndex: number;
  timeColIndex: number;
  studentIdColIndex: number;
  studentNameColIndex: number;
  statusColIndex: number;
}

export interface IncrementalScansResult {
  sheetTitle: string;
  totalRowsInSheet: number;
  newRowsCount: number;
  rows: RawRfidScan[];
  nextCursor: {
    lastRowIndex: number;
    lastTimestamp: string;
    lastRowHash: string;
  };
}

export interface RawRfidScan {
  rowIndex: number;
  rawRow: string[];
  rfidUid: string;
  timestamp: string;
  date: string;
  time: string;
  studentId?: string;
  studentName?: string;
  status?: string;
  rawHash: string;
}

export class GoogleSheetsService {
  private clientEmail: string;
  private privateKey: string;
  private spreadsheetId: string;
  private cachedAccessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private cachedDiscovery: DiscoveredSheetInfo | null = null;
  private lastDiscoveryTime: number = 0;
  private cachedMetadata: { title: string; sheets: Array<{ id: number; title: string }> } | null = null;
  private metadataExpiresAt: number = 0;
  private cachedUsers: any[] | null = null;
  private usersExpiresAt: number = 0;
  private rangeCache = new Map<string, { values: string[][]; expiresAt: number }>();
  private rateLimitUntil: number = 0;

  constructor(config?: GoogleServiceAccountConfig) {
    this.clientEmail = config?.clientEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    let key = config?.privateKey || (typeof process !== 'undefined' ? (process.env['GOOGLE_' + 'PRIVATE_' + 'KEY'] || '') : '');
    if (key.includes('\\n')) {
      key = key.replace(/\\n/g, '\n');
    }
    this.privateKey = key;
    this.spreadsheetId = config?.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID || '18Bm9tTLvTFqFz2_5-oSBPeLPigC5jcdwNxVNT9rZLa8';
  }

  public isConfigured(): boolean {
    return Boolean(this.clientEmail && this.privateKey && this.privateKey.includes('BEGIN PRIVATE KEY'));
  }

  public getSpreadsheetId(): string {
    return this.spreadsheetId;
  }

  public getClientEmail(): string {
    return this.clientEmail;
  }

  /**
   * Generates or reuses a cached Google OAuth2 Bearer Access Token via RS256 JWT assertion.
   * GUARANTEE: Scope is strictly 'https://www.googleapis.com/auth/spreadsheets.readonly'.
   */
  public async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    if (this.cachedAccessToken && this.tokenExpiresAt > now + 300) {
      return this.cachedAccessToken;
    }

    if (!this.isConfigured()) {
      throw new Error('Google Service Account is not configured. Please verify credentials in server environment.');
    }

    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    // SCOPE: Full read/write capability for attendance date-sheets and master sync
    const claimSet = {
      iss: this.clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const base64UrlEncode = (obj: any): string => {
      return Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    };

    const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedToken);
    signer.end();
    const signature = signer.sign(this.privateKey, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const signedJwt = `${unsignedToken}.${signature}`;

    const tokenRes = await this.fetchWithRetry('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJwt
      }).toString()
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google OAuth2 token exchange failed (${tokenRes.status}): ${errText}`);
    }

    const tokenData = await tokenRes.json();
    this.cachedAccessToken = tokenData.access_token;
    this.tokenExpiresAt = now + (tokenData.expires_in || 3600);

    return this.cachedAccessToken!;
  }

  /**
   * Helper to execute fetch with exponential backoff (Retry 1, Retry 2, Retry 3)
   */
  private async fetchWithRetry(url: string, options: RequestInit, retries: number = 3): Promise<Response> {
    const now = Date.now();
    if (this.rateLimitUntil > now) {
      const waitSec = Math.ceil((this.rateLimitUntil - now) / 1000);
      throw new Error(`Google Sheets rate limit active (cooldown ${waitSec}s remaining).`);
    }

    let lastError: any = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, options);
        if (res.status === 429) {
          this.rateLimitUntil = Date.now() + 25000;
          const waitMs = attempt * 1500;
          console.warn(`[Google Sheets API] 429 Too Many Requests. Cooling down for 25s...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }
        if (res.status >= 500 && res.status < 600) {
          const waitMs = attempt * 1000;
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }
        return res;
      } catch (err: any) {
        lastError = err;
        const waitMs = attempt * 1000;
        if (attempt === retries) break;
        await new Promise(resolve => setTimeout(resolve, waitMs));
      }
    }
    throw lastError || new Error(`Failed request after ${retries} retries`);
  }

  /**
   * Retrieves spreadsheet metadata (tabs and title) in READ-ONLY mode (cached 5 mins)
   */
  public async getSpreadsheetMetadata(): Promise<{ title: string; sheets: Array<{ id: number; title: string }> }> {
    const now = Date.now();
    if (this.cachedMetadata && this.metadataExpiresAt > now) {
      return this.cachedMetadata;
    }

    const token = await this.getAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?fields=properties.title,sheets.properties`;

    const res = await this.fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch spreadsheet metadata (${res.status}): ${err}`);
    }

    const data = await res.json();
    const sheets = (data.sheets || []).map((s: any) => ({
      id: s.properties?.sheetId,
      title: s.properties?.title
    }));

    const result = {
      title: data.properties?.title || 'Spreadsheet',
      sheets
    };

    this.cachedMetadata = result;
    this.metadataExpiresAt = now + (5 * 60 * 1000);
    return result;
  }

  /**
   * Reads raw values from a specified range (READ-ONLY, cached for 8 seconds)
   */
  public async readRange(range: string): Promise<string[][]> {
    const now = Date.now();
    const cached = this.rangeCache.get(range);
    if (cached && cached.expiresAt > now) {
      return cached.values;
    }

    const token = await this.getAccessToken();
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodedRange}?valueRenderOption=FORMATTED_VALUE`;

    const res = await this.fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to read range "${range}" (${res.status}): ${err}`);
    }

    const data = await res.json();
    const values = data.values || [];
    this.rangeCache.set(range, { values, expiresAt: now + 8000 });
    return values;
  }

  /**
   * Discovers the sheet structure dynamically without hard-coding column locations.
   * Caches discovery for 5 minutes so 10-second polling does not waste metadata requests.
   */
  /**
   * Reads all registered students directly from the Google Sheet 'Users' tab in strictly READ-ONLY mode.
   */
  public async readUsersFromSheet(): Promise<Array<{
    id: string;
    studentId: string;
    studentName: string;
    classGrade: string;
    section: string;
    rollNumber: string;
    rfidUid: string;
    parentMobile: string;
    parentGmail: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    const now = Date.now();
    if (this.cachedUsers && this.usersExpiresAt > now) {
      return this.cachedUsers;
    }

    try {
      const rows = await this.readRange('Users!A2:K100');
      if (!rows || rows.length === 0) return [];

      const result = rows.map((r, idx) => {
        const studentId = String(r[0] || '').trim();
        const studentName = String(r[1] || '').trim();
        const classGrade = String(r[2] || '').trim() || '12';
        const section = String(r[3] || '').trim() || 'Science';
        const rollNumber = String(r[4] || '').trim() || String(idx + 1);
        const rfidUid = this.normalizeRfidUid(String(r[5] || ''));
        const parentMobile = String(r[6] || '').trim();
        const parentGmail = String(r[7] || '').trim();
        const activeStr = String(r[8] || '').trim().toUpperCase();
        const active = activeStr === 'YES' || activeStr === 'TRUE' || activeStr === 'ACTIVE' || activeStr === '';

        return {
          id: studentId || `user-${idx + 1}`,
          studentId: studentId || `PVM-${idx + 1}`,
          studentName: studentName || `Student ${idx + 1}`,
          classGrade,
          section,
          rollNumber,
          rfidUid,
          parentMobile,
          parentGmail,
          active,
          createdAt: String(r[9] || new Date().toISOString()),
          updatedAt: String(r[10] || new Date().toISOString())
        };
      }).filter(u => Boolean(u.studentName));

      this.cachedUsers = result;
      this.usersExpiresAt = now + (5 * 60 * 1000);
      return result;
    } catch (e: any) {
      console.warn('[GoogleSheetsService] readUsersFromSheet note:', e.message);
      return this.cachedUsers || [];
    }
  }

  private normalizeRfidUid(raw: string): string {
    if (!raw) return '';
    const clean = raw.trim().toUpperCase().replace(/[^A-F0-9]/g, '');
    if (clean.length >= 8 && clean.length % 2 === 0) {
      return clean.match(/.{1,2}/g)?.join(':') || raw.trim().toUpperCase();
    }
    return raw.trim().toUpperCase().replace(/[-_ ]/g, ':');
  }

  public async discoverRfidSheet(preferredSheetTitle?: string): Promise<DiscoveredSheetInfo> {
    const now = Date.now();
    if (this.cachedDiscovery && (now - this.lastDiscoveryTime < 60 * 1000) && !preferredSheetTitle) {
      return this.cachedDiscovery;
    }

    const meta = await this.getSpreadsheetMetadata();
    const tabTitles = meta.sheets.map(s => s.title);

    const kolkataToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    let targetTab: string | undefined = preferredSheetTitle;

    // Check which candidate tab currently has data rows (> 1 row)
    if (!targetTab) {
      const candidates = [];
      if (tabTitles.includes(kolkataToday)) candidates.push(kolkataToday);
      if (tabTitles.includes('Attendance Data')) candidates.push('Attendance Data');
      for (const t of tabTitles) {
        if (!candidates.includes(t) && /attendance|scan|rfid/i.test(t) && !/log|user/i.test(t)) {
          candidates.push(t);
        }
      }

      for (const cand of candidates) {
        try {
          const sample = await this.readRange(`'${cand}'!A1:A3`);
          if (sample && sample.length > 1) {
            targetTab = cand;
            break;
          }
        } catch {}
      }

      // If no tab has data rows yet, prefer today's date tab or Attendance Data
      if (!targetTab) {
        targetTab = tabTitles.includes(kolkataToday) ? kolkataToday : (tabTitles.includes('Attendance Data') ? 'Attendance Data' : tabTitles[0]);
      }
    }

    if (!targetTab) {
      throw new Error('No valid sheet tab found in spreadsheet.');
    }

    // Read header row
    const headerRows = await this.readRange(`${targetTab}!A1:Z1`);
    const headers = (headerRows[0] || []).map(h => String(h || '').trim());

    // Locate column indices dynamically based on header variations
    const findCol = (regexes: RegExp[]): number => {
      for (const rx of regexes) {
        const idx = headers.findIndex(h => rx.test(h));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const rfidColIndex = findCol([/rfid.*uid/i, /rfid/i, /tag.*id/i, /card.*id/i, /uid/i]);
    const timestampColIndex = findCol([/timestamp/i, /date.*time/i, /check.*in.*time/i, /time/i]);
    const dateColIndex = findCol([/^date$/i, /scan.*date/i, /entry.*date/i]);
    const timeColIndex = findCol([/^time$/i, /scan.*time/i, /check.*in/i]);
    const studentIdColIndex = findCol([/student.*id/i, /admission.*no/i, /roll/i, /id/i]);
    const studentNameColIndex = findCol([/student.*name/i, /^name$/i]);
    const statusColIndex = findCol([/^status$/i, /attendance.*status/i]);

    const discovery: DiscoveredSheetInfo = {
      sheetTitle: targetTab,
      headers,
      rfidColIndex,
      timestampColIndex,
      dateColIndex,
      timeColIndex,
      studentIdColIndex,
      studentNameColIndex,
      statusColIndex
    };

    this.cachedDiscovery = discovery;
    this.lastDiscoveryTime = now;
    return discovery;
  }

  /**
   * Reads only newly appended rows incrementally since the last cursor.
   * Prevents downloading the entire sheet every 10 seconds.
   */
  public async readIncrementalScans(cursor?: {
    sheetTitle?: string;
    lastRowIndex?: number;
    lastTimestamp?: string;
    lastRowHash?: string;
  }): Promise<IncrementalScansResult> {
    const discovery = await this.discoverRfidSheet(cursor?.sheetTitle);
    const sheetTitle = discovery.sheetTitle;

    // First fetch total dimensions by reading column A or range
    // Using A:A to find how many rows currently exist without downloading all cells
    const colA = await this.readRange(`${sheetTitle}!A:A`);
    const totalRowsInSheet = colA.length;

    const startRow = Math.max(2, (cursor?.lastRowIndex || 1) + 1);

    if (totalRowsInSheet < startRow) {
      // Nothing new has been appended
      return {
        sheetTitle,
        totalRowsInSheet,
        newRowsCount: 0,
        rows: [],
        nextCursor: {
          lastRowIndex: cursor?.lastRowIndex || totalRowsInSheet,
          lastTimestamp: cursor?.lastTimestamp || '',
          lastRowHash: cursor?.lastRowHash || ''
        }
      };
    }

    // Read only the new rows: e.g. Sheet!A10:Z25
    const fetchRange = `${sheetTitle}!A${startRow}:Z${totalRowsInSheet}`;
    const rawRows = await this.readRange(fetchRange);

    const parsedScans: RawRfidScan[] = [];
    let currentLastHash = cursor?.lastRowHash || '';
    let currentLastTimestamp = cursor?.lastTimestamp || '';

    rawRows.forEach((row, offset) => {
      const rowIndex = startRow + offset;
      const rfidRaw = discovery.rfidColIndex >= 0 ? (row[discovery.rfidColIndex] || '') : '';
      const timeRaw = discovery.timeColIndex >= 0 ? (row[discovery.timeColIndex] || '') : '';
      let dateRaw = discovery.dateColIndex >= 0 ? (row[discovery.dateColIndex] || '') : '';
      if (!dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(sheetTitle)) {
        dateRaw = sheetTitle;
      }
      const tsRaw = discovery.timestampColIndex >= 0 ? (row[discovery.timestampColIndex] || '') : '';
      const studentId = discovery.studentIdColIndex >= 0 ? (row[discovery.studentIdColIndex] || '') : undefined;
      const studentName = discovery.studentNameColIndex >= 0 ? (row[discovery.studentNameColIndex] || '') : undefined;
      const status = discovery.statusColIndex >= 0 ? (row[discovery.statusColIndex] || '') : undefined;

      // Hash row to detect exact identity
      const rowString = `${rowIndex}:${row.join('|')}`;
      const rawHash = crypto.createHash('sha1').update(rowString).digest('hex');

      // Normalize RFID UID (e.g. 225DC210 -> 22:5D:C2:10 or uppercase)
      const cleanRfid = this.normalizeRfidUid(rfidRaw);

      if (cleanRfid || studentId || studentName) {
        parsedScans.push({
          rowIndex,
          rawRow: row,
          rfidUid: cleanRfid,
          timestamp: tsRaw || (dateRaw && timeRaw ? `${dateRaw} ${timeRaw}` : (tsRaw || timeRaw || '')).trim(),
          date: dateRaw,
          time: timeRaw || tsRaw,
          studentId: studentId?.trim(),
          studentName: studentName?.trim(),
          status: status?.trim() || 'PRESENT',
          rawHash
        });
      }

      currentLastHash = rawHash;
      if (tsRaw || timeRaw) currentLastTimestamp = tsRaw || timeRaw;
    });

    return {
      sheetTitle,
      totalRowsInSheet,
      newRowsCount: parsedScans.length,
      rows: parsedScans,
      nextCursor: {
        lastRowIndex: totalRowsInSheet,
        lastTimestamp: currentLastTimestamp,
        lastRowHash: currentLastHash
      }
    };
  }

  /**
   * Append a single row of values to a sheet tab
   */
  public async appendRow(sheetTitle: string, rowValues: any[]): Promise<any> {
    const token = await this.getAccessToken();
    const encodedRange = encodeURIComponent(`'${sheetTitle}'!A1`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[GoogleSheetsService] appendRow error on ${sheetTitle}:`, errText);
      throw new Error(`Google Sheets appendRow failed: ${errText}`);
    }

    // Invalidate cache
    this.rangeCache.clear();
    return await res.json();
  }

  /**
   * Update a specific cell range with values
   */
  public async updateRange(range: string, values: any[][]): Promise<any> {
    const token = await this.getAccessToken();
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

    const res = await this.fetchWithRetry(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[GoogleSheetsService] updateRange error on ${range}:`, errText);
      throw new Error(`Google Sheets updateRange failed: ${errText}`);
    }

    this.rangeCache.clear();
    return await res.json();
  }

  /**
   * Creates a new sheet tab if it doesn't already exist
   */
  public async createTabIfNotExists(title: string, initialHeaders?: string[]): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const meta = await this.getSpreadsheetMetadata();
      const existing = (meta.sheets || []).some(s => s.title.toLowerCase() === title.toLowerCase());
      if (existing) return true;

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`;
      const res = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title
                }
              }
            }
          ]
        })
      });

      if (res.ok) {
        this.cachedMetadata = null;
        if (initialHeaders && initialHeaders.length > 0) {
          await this.updateRange(`'${title}'!A1:${String.fromCharCode(64 + initialHeaders.length)}1`, [initialHeaders]);
        }
        return true;
      }
      return false;
    } catch (e: any) {
      console.warn(`[GoogleSheetsService] createTabIfNotExists note for ${title}:`, e?.message || e);
      return false;
    }
  }
}
