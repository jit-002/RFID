/*
 * SmartAttend NodeMCU / ESP8266 RFID Perimeter Tap Node
 * Interfaces with MFRC522 over SPI and connects to Gateway via WiFi HTTP REST / WebSockets.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN         D3
#define SS_PIN          D4

const char* ssid = "Campus_IoT_WPA2";
const char* password = "Secret_IoT_Network";
const char* serverUrl = "http://192.168.1.101:8000/api/device/events/rfid";
const char* deviceId = "dev-esp-01";

MFRC522 mfrc522(SS_PIN, RST_PIN);
WiFiClient client;

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nESP8266 Connected. IP: " + WiFi.localIP().toString());
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  String uidStr = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidStr += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uidStr += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();
  Serial.println("Card Tag Scanned: " + uidStr);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"deviceId\":\"" + String(deviceId) + "\",\"cardUid\":\"RFID-" + uidStr + "\"}";
    int httpCode = http.POST(json);
    Serial.printf("Gateway Response Code: %d\n", httpCode);
    http.end();
  }

  mfrc522.PICC_HaltA();
  delay(1000); // Debounce
}
