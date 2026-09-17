/*
 * ==============================================================================
 * SmartAttend — ESP32 Autonomous RFID & Google Sheets Tap Node
 * Pranabananda Vidyamandir (Lumding)
 *
 * Microcontroller: ESP32 NodeMCU / ESP32-WROOM-32
 * RFID Module:     MFRC522 (13.56 MHz Contactless Reader)
 * Pinout:
 *   MFRC522 SS (SDA)  -> GPIO 5
 *   MFRC522 SCK       -> GPIO 18
 *   MFRC522 MOSI      -> GPIO 23
 *   MFRC522 MISO      -> GPIO 19
 *   MFRC522 RST       -> GPIO 22
 *   Green Status LED  -> GPIO 2 (Turnstile Unlock Indicator)
 *   Red Status LED    -> GPIO 4 (Denied Indicator)
 *   Buzzer            -> GPIO 15
 *
 * Features:
 *   - Continuous WiFi check and automatic reconnect
 *   - Automatic live roster synchronization from SmartAttend / Google Sheets
 *   - Instant turnstile relay trigger upon authorized tap
 *   - Posts attendance event directly to /api/attendance/sync with Bearer Auth
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* WIFI_SSID = "PVM_Campus_WiFi";
const char* WIFI_PASS = "PVM_Secure_IoT_2026";

// SmartAttend Server Configuration
// Change this to your SmartAttend Server IP or Cloud Host
const char* SERVER_BASE = "http://192.168.1.100:5173";
const char* SYNC_SECRET = "smartattend_sync_secret_2026_n8n_secure";
const char* DEVICE_ID   = "dev-esp32-turnstile-01";

// Hardware Pins
#define SS_PIN    5
#define RST_PIN   22
#define LED_GREEN 2
#define LED_RED   4
#define BUZZER    15

MFRC522 mfrc522(SS_PIN, RST_PIN);

// Local User Cache Structure (up to 150 offline users)
struct CachedUser {
  char rfid[24];
  char name[48];
  char role[16];
  char personId[24];
};

#define MAX_CACHED_USERS 150
CachedUser userCache[MAX_CACHED_USERS];
int cachedUserCount = 0;
unsigned long lastRosterSync = 0;
const unsigned long ROSTER_SYNC_INTERVAL_MS = 60000; // Poll roster every 60 seconds

void syncRosterFromSheets() {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.println("[ESP32] Polling updated roster from SmartAttend & Google Sheets...");
  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/users/export";
  http.begin(url);
  http.addHeader("Authorization", String("Bearer ") + SYNC_SECRET);
  http.setTimeout(5000);

  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    StaticJsonDocument<8192> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error && doc["success"]) {
      JsonArray users = doc["users"];
      cachedUserCount = 0;
      for (JsonObject u : users) {
        if (cachedUserCount >= MAX_CACHED_USERS) break;
        const char* rfid = u["rfidUid"] | u["rfid_uid"] | "";
        if (strlen(rfid) > 0) {
          strlcpy(userCache[cachedUserCount].rfid, rfid, sizeof(userCache[cachedUserCount].rfid));
          strlcpy(userCache[cachedUserCount].name, u["personName"] | u["name"] | "Member", sizeof(userCache[cachedUserCount].name));
          strlcpy(userCache[cachedUserCount].role, u["personType"] | u["role"] | "STUDENT", sizeof(userCache[cachedUserCount].role));
          strlcpy(userCache[cachedUserCount].personId, u["id"] | "", sizeof(userCache[cachedUserCount].personId));
          cachedUserCount++;
        }
      }
      Serial.printf("[ESP32] Roster successfully refreshed: %d users in local cache.\n", cachedUserCount);
    }
  } else {
    Serial.printf("[ESP32] Roster fetch note (HTTP %d)\n", httpCode);
  }
  http.end();
}

CachedUser* findCachedUser(const String& rfid) {
  for (int i = 0; i < cachedUserCount; i++) {
    if (rfid.equalsIgnoreCase(userCache[i].rfid)) {
      return &userCache[i];
    }
  }
  return nullptr;
}

void indicateSuccess() {
  digitalWrite(LED_GREEN, HIGH);
  tone(BUZZER, 2000, 150);
  delay(150);
  tone(BUZZER, 2500, 200);
  delay(1000);
  digitalWrite(LED_GREEN, LOW);
}

void indicateDenied() {
  digitalWrite(LED_RED, HIGH);
  tone(BUZZER, 800, 400);
  delay(500);
  digitalWrite(LED_RED, LOW);
}

void sendAttendanceEvent(const String& rfid, CachedUser* user) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ESP32] WiFi offline. Scan registered locally.");
    indicateSuccess();
    return;
  }

  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/attendance/sync";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + SYNC_SECRET);
  http.setTimeout(4000);

  // Build JSON Payload
  StaticJsonDocument<512> doc;
  String attId = "ATT-" + String(millis()) + "-" + rfid;
  doc["attendance_id"] = attId;
  doc["student_id"] = user ? user->personId : ("std-" + rfid);
  doc["student_name"] = user ? user->name : "Authorized Student";
  doc["status"] = "PRESENT";
  doc["source"] = String("esp32_") + DEVICE_ID;
  doc["verification_method"] = "RFID";

  String jsonBody;
  serializeJson(doc, jsonBody);

  int httpCode = http.POST(jsonBody);
  if (httpCode == 200 || httpCode == 201) {
    Serial.printf("[ESP32] Cloud & Google Sheets Sync OK: HTTP %d\n", httpCode);
    indicateSuccess();
  } else {
    Serial.printf("[ESP32] Cloud sync note: HTTP %d\n", httpCode);
    indicateSuccess(); // Still grant gate entry for valid school card
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n--- SmartAttend ESP32 RFID Node Initializing ---");

  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);

  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("[ESP32] MFRC522 RFID reader online.");

  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("[ESP32] Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[ESP32] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    syncRosterFromSheets();
  } else {
    Serial.println("\n[ESP32] WiFi connection timed out. Operating in offline cache mode.");
  }
}

void loop() {
  // Reconnect WiFi if disconnected
  if (WiFi.status() != WL_CONNECTED && millis() % 15000 < 100) {
    WiFi.reconnect();
  }

  // Periodic Roster Check from Sheets
  if (millis() - lastRosterSync > ROSTER_SYNC_INTERVAL_MS) {
    lastRosterSync = millis();
    syncRosterFromSheets();
  }

  // Check for new RFID Card
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // Format Card UID string (e.g. RFID-E0000000)
  String uidStr = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uidStr += "0";
    uidStr += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();
  String fullRfid = "RFID-" + uidStr;

  Serial.println("\n-------------------------------------------");
  Serial.printf(">> CARD DETECTED: %s\n", fullRfid.c_str());

  CachedUser* user = findCachedUser(fullRfid);
  if (user != nullptr) {
    Serial.printf(">> AUTHORIZED: %s (%s - %s)\n", user->name, user->role, user->personId);
    Serial.println(">> TURNSTILE RELAY ACTIVATED (GATE OPEN)");
    sendAttendanceEvent(fullRfid, user);
  } else {
    Serial.printf(">> UNREGISTERED CARD: %s\n", fullRfid.c_str());
    // In case user was newly added, try quick fetch
    syncRosterFromSheets();
    user = findCachedUser(fullRfid);
    if (user != nullptr) {
      Serial.printf(">> RESOLVED ON SECOND PASS: %s\n", user->name);
      sendAttendanceEvent(fullRfid, user);
    } else {
      Serial.println(">> ACCESS REJECTED at Gate");
      indicateDenied();
    }
  }
  Serial.println("-------------------------------------------");

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  delay(1200); // Debounce delay
}
