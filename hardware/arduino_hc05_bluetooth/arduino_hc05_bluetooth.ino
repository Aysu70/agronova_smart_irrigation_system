/*
 * AGRANOVA Smart Irrigation - HC-05 Bluetooth Module
 * 
 * This Arduino sketch reads sensor data and sends it via HC-05 Bluetooth
 * to the AGRANOVA web application using Web Bluetooth API
 * 
 * Hardware Connections:
 * - HC-05 TX -> Arduino RX (Pin 10)
 * - HC-05 RX -> Arduino TX (Pin 11) via voltage divider (5V to 3.3V)
 * - Soil Moisture Sensor -> A0
 * - DHT22 Temperature/Humidity -> Pin 2
 * - Ultrasonic Sensor (HC-SR04) Trig -> Pin 7, Echo -> Pin 8
 * - Relay Module (Pump Control) -> Pin 12
 */

#include <SoftwareSerial.h>
#include <DHT.h>

// Pin Definitions
#define SOIL_MOISTURE_PIN A0
#define DHT_PIN 2
#define TRIG_PIN 7
#define ECHO_PIN 8
#define RELAY_PIN 12
#define BT_RX 10
#define BT_TX 11

// Sensor Configuration
#define DHT_TYPE DHT22
#define TANK_HEIGHT_CM 100  // Total tank height in cm
#define UPDATE_INTERVAL 2000  // Send data every 2 seconds

// Initialize sensors
DHT dht(DHT_PIN, DHT_TYPE);
SoftwareSerial bluetooth(BT_RX, BT_TX);

// Variables
unsigned long lastUpdate = 0;
bool pumpStatus = false;
String deviceId = "AGRO_BT_001";  // Unique device ID

void setup() {
  // Initialize Serial for debugging
  Serial.begin(9600);
  Serial.println("AGRANOVA Bluetooth Sensor Module");
  Serial.println("Initializing...");
  
  // Initialize Bluetooth
  bluetooth.begin(9600);
  delay(100);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Initialize pins
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  
  // Ensure pump is OFF at startup
  digitalWrite(RELAY_PIN, LOW);
  
  Serial.println("✓ Initialization complete");
  Serial.println("Ready to send data via Bluetooth");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Send sensor data at regular intervals
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;
    
    // Read sensors
    int soilMoisture = readSoilMoisture();
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int tankLevel = readTankLevel();
    String pumpState = pumpStatus ? "ON" : "OFF";
    
    // Check for sensor errors
    if (isnan(temperature)) temperature = 0;
    if (isnan(humidity)) humidity = 0;
    
    // Create JSON message
    String jsonData = createJsonMessage(soilMoisture, temperature, humidity, tankLevel, pumpState);
    
    // Send via Bluetooth
    bluetooth.println(jsonData);
    
    // Debug output
    Serial.println("Sent: " + jsonData);
  }
  
  // Check for incoming commands from app
  if (bluetooth.available()) {
    String command = bluetooth.readStringUntil('\n');
    command.trim();
    handleCommand(command);
  }
  
  // Small delay to prevent overwhelming the processor
  delay(10);
}

// Read soil moisture sensor (0-100%)
int readSoilMoisture() {
  int rawValue = analogRead(SOIL_MOISTURE_PIN);
  // Convert to percentage (0 = dry, 100 = wet)
  // Calibrate these values based on your sensor
  int moisturePercent = map(rawValue, 1023, 0, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  return moisturePercent;
}

// Read water tank level using HC-SR04 (0-100%)
int readTankLevel() {
  // Trigger ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo pulse duration
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    return 0; // Sensor error
  }
  
  // Calculate distance in cm
  float distance = (duration * 0.034) / 2;
  
  // Convert to tank level percentage (inverted)
  int levelPercent = map((int)distance, 0, TANK_HEIGHT_CM, 100, 0);
  levelPercent = constrain(levelPercent, 0, 100);
  
  return levelPercent;
}

// Create JSON formatted message
String createJsonMessage(int soil, float temp, float hum, int tank, String pump) {
  String json = "{";
  json += "\"deviceId\":\"" + deviceId + "\",";
  json += "\"soil\":" + String(soil) + ",";
  json += "\"temp\":" + String(temp, 1) + ",";
  json += "\"humidity\":" + String(hum, 1) + ",";
  json += "\"tank\":" + String(tank) + ",";
  json += "\"pump\":\"" + pump + "\"";
  json += "}";
  return json;
}

// Handle commands from the app
void handleCommand(String command) {
  Serial.println("Received command: " + command);
  
  if (command == "PUMP_ON") {
    digitalWrite(RELAY_PIN, HIGH);
    pumpStatus = true;
    bluetooth.println("{\"status\":\"PUMP_ON\"}");
    Serial.println("✓ Pump turned ON");
  } 
  else if (command == "PUMP_OFF") {
    digitalWrite(RELAY_PIN, LOW);
    pumpStatus = false;
    bluetooth.println("{\"status\":\"PUMP_OFF\"}");
    Serial.println("✓ Pump turned OFF");
  }
  else if (command == "STATUS" || command == "GET_DATA") {
    // Send immediate status update
    int soilMoisture = readSoilMoisture();
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int tankLevel = readTankLevel();
    String pumpState = pumpStatus ? "ON" : "OFF";
    
    if (isnan(temperature)) temperature = 0;
    if (isnan(humidity)) humidity = 0;
    
    String jsonData = createJsonMessage(soilMoisture, temperature, humidity, tankLevel, pumpState);
    bluetooth.println(jsonData);
  }
  else if (command == "HELLO") {
    // Handshake response
    bluetooth.println("{\"status\":\"READY\",\"deviceId\":\"" + deviceId + "\"}");
    Serial.println("✓ Handshake complete");
  }
  else {
    bluetooth.println("{\"error\":\"Unknown command\"}");
  }
}
