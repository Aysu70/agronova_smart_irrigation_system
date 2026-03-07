/*
 * AGRANOVA Smart Irrigation - ESP32 WiFi Module
 * 
 * This ESP32 sketch reads sensor data and sends it to the AGRANOVA
 * backend server via WiFi using HTTP POST requests
 * 
 * Hardware Connections:
 * - Soil Moisture Sensor -> GPIO 34 (ADC1_CH6)
 * - DHT22 Temperature/Humidity -> GPIO 4
 * - Ultrasonic Sensor (HC-SR04) Trig -> GPIO 5, Echo -> GPIO 18
 * - Relay Module (Pump Control) -> GPIO 19
 * - Status LED -> GPIO 2 (built-in LED)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <WebSocketsClient.h>

// WiFi Credentials - CHANGE THESE
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration - CHANGE THIS TO YOUR SERVER IP/DOMAIN
const char* serverUrl = "http://192.168.1.100:5001/api/hardware/data";
const char* wsServerHost = "192.168.1.100";
const int wsServerPort = 5001;

// Device Configuration
const String deviceId = "AGRO_ESP32_001";  // Unique device ID - CHANGE THIS
const String deviceName = "ESP32 Field Sensor";

// Pin Definitions
#define SOIL_MOISTURE_PIN 34
#define DHT_PIN 4
#define TRIG_PIN 5
#define ECHO_PIN 18
#define RELAY_PIN 19
#define LED_PIN 2

// Sensor Configuration
#define DHT_TYPE DHT22
#define TANK_HEIGHT_CM 100
#define UPDATE_INTERVAL 5000  // Send data every 5 seconds
#define RECONNECT_INTERVAL 10000  // Try reconnect every 10 seconds

// Initialize sensors
DHT dht(DHT_PIN, DHT_TYPE);
WebSocketsClient webSocket;

// Variables
unsigned long lastUpdate = 0;
unsigned long lastReconnect = 0;
bool pumpStatus = false;
bool wifiConnected = false;
bool wsConnected = false;

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n==================================");
  Serial.println("AGRANOVA ESP32 WiFi Sensor Module");
  Serial.println("==================================");
  
  // Initialize pins
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Ensure pump is OFF at startup
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize DHT sensor
  dht.begin();
  delay(2000);
  
  // Connect to WiFi
  connectWiFi();
  
  // Initialize WebSocket
  initWebSocket();
  
  Serial.println("✓ Initialization complete");
  Serial.println("Device ID: " + deviceId);
  Serial.println("Ready to send data");
  Serial.println("==================================\n");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Maintain WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    if (currentMillis - lastReconnect >= RECONNECT_INTERVAL) {
      lastReconnect = currentMillis;
      Serial.println("WiFi disconnected. Reconnecting...");
      connectWiFi();
    }
  } else {
    wifiConnected = true;
  }
  
  // Maintain WebSocket connection
  webSocket.loop();
  
  // Send sensor data at regular intervals
  if (wifiConnected && (currentMillis - lastUpdate >= UPDATE_INTERVAL)) {
    lastUpdate = currentMillis;
    sendSensorData();
  }
  
  // Blink LED to show activity
  blinkLED();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    wifiConnected = true;
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
    wifiConnected = false;
    digitalWrite(LED_PIN, LOW);
  }
}

void initWebSocket() {
  webSocket.begin(wsServerHost, wsServerPort, "/socket.io/?EIO=4&transport=websocket");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      wsConnected = false;
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      wsConnected = true;
      // Join device room
      String joinMsg = "{\"type\":\"join_device\",\"deviceId\":\"" + deviceId + "\"}";
      webSocket.sendTXT(joinMsg);
      break;
    case WStype_TEXT:
      Serial.printf("WebSocket Message: %s\n", payload);
      handleWebSocketMessage((char*)payload);
      break;
  }
}

void handleWebSocketMessage(String message) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (error) {
    Serial.println("JSON parse error");
    return;
  }
  
  String command = doc["command"];
  
  if (command == "ON") {
    controlPump(true);
  } else if (command == "OFF") {
    controlPump(false);
  }
}

void sendSensorData() {
  // Read all sensors
  int soilMoisture = readSoilMoisture();
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int tankLevel = readTankLevel();
  String pumpState = pumpStatus ? "ON" : "OFF";
  
  // Validate sensor readings
  if (isnan(temperature)) temperature = 0.0;
  if (isnan(humidity)) humidity = 0.0;
  
  // Print to Serial for debugging
  Serial.println("\n--- Sensor Reading ---");
  Serial.print("Soil Moisture: "); Serial.print(soilMoisture); Serial.println("%");
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println("°C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println("%");
  Serial.print("Tank Level: "); Serial.print(tankLevel); Serial.println("%");
  Serial.print("Pump Status: "); Serial.println(pumpState);
  Serial.println("---------------------");
  
  // Create JSON payload
  StaticJsonDocument<300> doc;
  doc["deviceId"] = deviceId;
  doc["soil"] = soilMoisture;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["tankLevel"] = tankLevel;
  doc["pumpStatus"] = pumpState;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    Serial.print("Sending to server... ");
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("✓ Response: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.print("✗ Error: ");
      Serial.println(httpResponseCode);
      Serial.println("Error: " + http.errorToString(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("✗ WiFi not connected");
  }
}

int readSoilMoisture() {
  int rawValue = analogRead(SOIL_MOISTURE_PIN);
  // ESP32 ADC is 12-bit (0-4095)
  // Calibrate these values based on your sensor
  int moisturePercent = map(rawValue, 4095, 0, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  return moisturePercent;
}

int readTankLevel() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  
  if (duration == 0) {
    return 0;
  }
  
  float distance = (duration * 0.034) / 2;
  int levelPercent = map((int)distance, 0, TANK_HEIGHT_CM, 100, 0);
  levelPercent = constrain(levelPercent, 0, 100);
  
  return levelPercent;
}

void controlPump(bool turnOn) {
  pumpStatus = turnOn;
  digitalWrite(RELAY_PIN, turnOn ? HIGH : LOW);
  Serial.print("Pump turned ");
  Serial.println(turnOn ? "ON" : "OFF");
  
  // Send immediate status update
  sendSensorData();
}

void blinkLED() {
  static unsigned long lastBlink = 0;
  static bool ledState = false;
  
  if (millis() - lastBlink > (wifiConnected ? 1000 : 200)) {
    lastBlink = millis();
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
  }
}
