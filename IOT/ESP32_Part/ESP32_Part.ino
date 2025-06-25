#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "VIRSUS";
const char* password = "+010203+";

// Server details
const char* serverUrl = "http://192.168.137.39:5000/api/iot/data";

// Serial communication with Arduino
#define SERIAL_RX_BUFFER_SIZE 512

// Global HTTP client and WiFi client
WiFiClient client;
HTTPClient http;

// Sensor data structure
struct SensorData {
  float temperature = 0;
  float humidity = 0;
  int alcohol_level = 0;
  bool flame_detected = false;
  bool water_detected = false;
  unsigned long timestamp = 0;
};

SensorData lastGoodData;
bool hasInitialData = false;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;
unsigned int connectionAttempts = 0;
const unsigned int maxConnectionAttempts = 5;

void setup() {
  Serial.begin(115200);
  Serial1.begin(9600, SERIAL_8N1, 16, 17); // RX=16, TX=17
  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Connection lost - reconnecting...");
    connectToWiFi();
  }

  readArduinoData();

  if (WiFi.status() == WL_CONNECTED && hasInitialData && 
      millis() - lastSendTime >= sendInterval) {
    if (sendToServer(lastGoodData)) {
      lastSendTime = millis();
    } else {
      delay(1000);
    }
  }

  delay(10);
}

void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("[WIFI] Connecting to WiFi...");
  WiFi.disconnect(true);
  delay(100);
  WiFi.begin(ssid, password);
  
  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && 
         millis() - startAttemptTime < 20000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    connectionAttempts = 0;
    Serial.println("\n[WIFI] Connected!");
    Serial.print("[WIFI] IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WIFI] RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    connectionAttempts++;
    Serial.println("\n[WIFI] Connection failed");
    
    if (connectionAttempts >= maxConnectionAttempts) {
      Serial.println("[WIFI] Max attempts reached. Restarting...");
      ESP.restart();
    }
  }
}

void readArduinoData() {
  static String jsonBuffer;
  static bool inJson = false;
  
  while (Serial1.available()) {
    char c = Serial1.read();
    
    if (c == '{') {
      jsonBuffer = "{";
      inJson = true;
    } else if (c == '}' && inJson) {
      jsonBuffer += '}';
      processJson(jsonBuffer);
      jsonBuffer = "";
      inJson = false;
    } else if (inJson) {
      jsonBuffer += c;
    }

    if (jsonBuffer.length() > 500) {
      jsonBuffer = "";
      inJson = false;
      Serial.println("[SERIAL] Buffer overflow - resetting");
    }
  }
}

void processJson(String jsonString) {
  if (jsonString.length() < 10) {
    Serial.println("[JSON] Invalid JSON (too short)");
    return;
  }

  DynamicJsonDocument doc(512);
  DeserializationError error = deserializeJson(doc, jsonString);
  
  if (error) {
    Serial.print("[JSON] Parse error: ");
    Serial.println(error.c_str());
    Serial.println("[JSON] Received: ");
    Serial.println(jsonString);
    return;
  }

  SensorData newData;
  newData.temperature = doc["temperature"] | -1.0;
  newData.humidity = doc["humidity"] | -1.0;
  newData.alcohol_level = doc["alcohol_level"] | -1;
  newData.flame_detected = doc["flame_detected"] | false;
  newData.water_detected = doc["water_detected"] | false;
  newData.timestamp = millis();

  // Validate sensor values
  if (newData.temperature < -40 || newData.temperature > 100 ||
      newData.humidity < 0 || newData.humidity > 100 ||
      newData.alcohol_level < 0 || newData.alcohol_level > 5000) {
    Serial.println("[DATA] Invalid sensor values received");
    return;
  }

  lastGoodData = newData;
  hasInitialData = true;
  
  Serial.println("[DATA] Received valid sensor data:");
  Serial.print("  Temp: "); Serial.print(newData.temperature); Serial.println("°C");
  Serial.print("  Humidity: "); Serial.print(newData.humidity); Serial.println("%");
  Serial.print("  Alcohol: "); Serial.println(newData.alcohol_level);
  Serial.print("  Flame: "); Serial.println(newData.flame_detected ? "YES" : "NO");
  Serial.print("  Water: "); Serial.println(newData.water_detected ? "YES" : "NO");
}

bool sendToServer(const SensorData& data) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] WiFi not connected - can't send data");
    return false;
  }

  // Reuse connection if possible
  if (!http.connected()) {
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000);
  }

  DynamicJsonDocument doc(256);
  doc["temperature"] = data.temperature;
  doc["humidity"] = data.humidity;
  doc["alcohol_level"] = data.alcohol_level;
  doc["flame_detected"] = data.flame_detected;
  doc["water_detected"] = data.water_detected;

  String payload;
  serializeJson(doc, payload);

  Serial.println("[HTTP] Sending to server:");
  Serial.println(payload);

  bool success = false;
  int httpCode = 0;

  for (int i = 0; i < 3; i++) {
    httpCode = http.POST(payload);

    if (httpCode == HTTP_CODE_OK) {
      String response = http.getString();
      Serial.printf("[HTTP] Response code: %d\n", httpCode);
      Serial.print("[HTTP] Response: ");
      Serial.println(response);
      success = true;
      break;
    } else {
      Serial.printf("[HTTP] Attempt %d failed: %s\n", i + 1, http.errorToString(httpCode).c_str());
      if (i < 2) delay(1000);
    }
  }

  if (!success) {
    Serial.println("[HTTP] All attempts failed");
    http.end(); // Close connection to allow fresh start next time
    if (httpCode < 0 || httpCode == HTTPC_ERROR_CONNECTION_REFUSED) {
      Serial.println("[HTTP] Resetting WiFi connection...");
      WiFi.disconnect();
    }
  }

  return success;
}