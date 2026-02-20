#include <WiFi.h>
#include <HTTPClient.h>

/* ================= PIN CONFIG ================= */
#define RELAY_PIN 26
#define RFID_RX_PIN 16

/* ================= WIFI CONFIG ================= */
const char* WIFI_SSID = "Xiaomi 14 Civi";
const char* WIFI_PASS = "Helloooo";

/* ================= BACKEND URLs ================= */
const char* POST_URL = "http://10.208.67.154:3000/rfid";
const char* GET_URL  = "http://10.208.67.154:3000/command";

/* ================= RFID VARIABLES ================= */
String buffer = "";
String stableUID = "";
String lastUID = "";

unsigned long lastCharTime = 0;
const unsigned long frameGap   = 50;
const unsigned long cardTimeout = 2000;

bool cardPresent = false;   // ✅ LATCH FLAG

/* ================= WEB LOCK TIMERS ================= */
const unsigned long webOpenDuration = 20000; // 20 sec
bool webUnlockActive = false;
unsigned long webUnlockTime = 0;

unsigned long lastPollTime = 0;

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RFID_RX_PIN, -1);

  pinMode(RELAY_PIN, OUTPUT);

  openLock();   // 🔓 DEFAULT STATE

  connectWiFi();

  delay(2000);
  while (Serial2.available()) Serial2.read();

  Serial.println("SYSTEM READY");
  Serial.println("LOCK CONTROLLED BY WEB ONLY");
  Serial.println("--------------------------------");
}

/* ================= LOOP ================= */
void loop() {

  /* ---------- WEB AUTO CLOSE ---------- */
  if (webUnlockActive && millis() - webUnlockTime >= webOpenDuration) {
    closeLock();
    webUnlockActive = false;
    Serial.println("WEB AUTO CLOSE 🔒 (20s)");
  }

  /* ---------- POLL SERVER ---------- */
  if (millis() - lastPollTime > 2000) {
    checkServerCommand();
    lastPollTime = millis();
  }

  /* ---------- READ RFID RAW ---------- */
  while (Serial2.available()) {
    char c = Serial2.read();
    lastCharTime = millis();

    if (isHexadecimalDigit(c)) buffer += c;
    if (buffer.length() > 16) buffer = "";
  }

  /* ---------- RFID FRAME COMPLETE ---------- */
  if (buffer.length() >= 10 && millis() - lastCharTime > frameGap) {

    stableUID = (buffer.length() >= 12)
                ? buffer.substring(buffer.length() - 12)
                : buffer.substring(buffer.length() - 10);

    buffer = "";

    if (!cardPresent) {   // ✅ READ ONLY ON NEW TAP

      unsigned long long decimalUID =
        strtoull(stableUID.c_str(), NULL, 16);

      Serial.print("RFID HEX: ");
      Serial.println(stableUID);

      Serial.print("RFID DEC: ");
      Serial.println(decimalUID);

      sendRFID(String(decimalUID));

      Serial.println("RFID SENT TO SERVER");
      Serial.println("--------------------------------");

      lastUID = stableUID;
      cardPresent = true;   // 🔒 LATCH UNTIL REMOVAL
    }
  }

  /* ---------- CARD REMOVAL DETECTION ---------- */
  if (cardPresent && millis() - lastCharTime > cardTimeout) {
    cardPresent = false;
    lastUID = "";
    Serial.println("CARD REMOVED");
  }
}

/* ================= RELAY CONTROL ================= */
void openLock() {
  digitalWrite(RELAY_PIN, HIGH);
}

void closeLock() {
  digitalWrite(RELAY_PIN, LOW);
}

/* ================= WIFI ================= */
void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
}

/* ================= POST RFID ================= */
void sendRFID(String uid) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(POST_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"rfid\":\"" + uid + "\"}";
  int code = http.POST(payload);

  Serial.print("POST RFID STATUS: ");
  Serial.println(code);

  http.end();
}

/* ================= GET COMMAND ================= */
void checkServerCommand() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(GET_URL);

  int code = http.GET();
  if (code == 200) {
    String res = http.getString();

    if (res.indexOf("\"unlock\":true") > -1 && !webUnlockActive) {
      Serial.println("WEB COMMAND: UNLOCK");

      openLock();
      webUnlockActive = true;
      webUnlockTime = millis();
    }
  }

  http.end();
}