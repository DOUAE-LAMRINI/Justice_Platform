#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// ==================== FUNCTION PROTOTYPES ====================
void showStartupMessage();
void readAllSensors();
void handleButtons();
void controlLEDs();
void controlBlueLED();
void setAllLEDs(bool ledState);
void updateStatusLED();
void checkAlerts();
void monitorSoundSensor();
void triggerTemperatureAlert(float temp);
void triggerHumidityAlert(float hum);
void triggerWaterAlert();
void triggerFlameAlert();
void triggerGasAlert();
void triggerSoundAlert();
void updateDisplay();
void updateSerialOutput();
void handleSerialCommands();
void activateAlert();

// ==================== SYSTEM CONFIGURATION ====================
#define DHTPIN 8
#define DHTTYPE DHT22

const byte LCD_ADDRESS = 0x27;
const byte LCD_COLS = 16;
const byte LCD_ROWS = 2;

const byte MQ3_PIN = A2;
const byte LDR_PIN = A0;
const byte WATER_SENSOR_PIN = A3;
const byte FLAME_SENSOR_PIN = 10;
const byte SOUND_SENSOR_PIN = 12;
const byte BLUE_LED_PIN = 13;
const byte PIR_PIN = 6;
const byte BUTTON1_PIN = 7;
const byte BUTTON2_PIN = 4;
const byte BUZZER_PIN = 9;
const byte RED_LED_PIN = 11;
const byte LED_PINS[] = {2, 3, 5};
const byte LED_COUNT = sizeof(LED_PINS) / sizeof(LED_PINS[0]);

const int WATER_DRY = 550;
const int WATER_WET = 300;
const int LDR_DARK = 140;
const int LDR_LIGHT = 200;
const int ALCOHOL_WARNING = 300;
const int ALCOHOL_DANGER = 790;
const unsigned long SOUND_RESET_DELAY = 10000;
const byte SOUND_ALERT_COUNT = 3;
const unsigned long DEBOUNCE_DELAY = 50;
const unsigned long ALERT_DISPLAY_TIME = 5000;
const unsigned long MOTION_TIMEOUT = 300000;
const unsigned long SERIAL_UPDATE_INTERVAL = 2000;

const float TEMP_TOO_HIGH = 35.0;
const float TEMP_TOO_LOW = 10.0;
const float HUM_TOO_HIGH = 80.0;
const float HUM_TOO_LOW = 20.0;

// ==================== SYSTEM STATE ====================
bool soundSensorActive = false;
bool whiteLedsManualOn = false;
bool blueLedOn = false;
bool waterAlertActive = false;
bool flameAlertActive = false;
bool gasAlertActive = false;
bool soundAlertActive = false;
byte soundCount = 0;
unsigned long lastSoundTime = 0;
unsigned long lastMotionTime = 0;
unsigned long lastAlertTime = 0;
unsigned long lastSerialUpdate = 0;
bool showingAlert = false;

int button1State;
int lastButton1State = LOW;
int button2State;
int lastButton2State = LOW;
unsigned long lastDebounceTime1 = 0;
unsigned long lastDebounceTime2 = 0;

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(LCD_ADDRESS, LCD_COLS, LCD_ROWS);

void setup() {
  Serial.begin(9600);
  dht.begin();
  lcd.begin(LCD_COLS, LCD_ROWS);
  lcd.backlight();
  showStartupMessage();

  pinMode(SOUND_SENSOR_PIN, INPUT);
  pinMode(FLAME_SENSOR_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUTTON1_PIN, INPUT);
  pinMode(BUTTON2_PIN, INPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  for (byte i = 0; i < LED_COUNT; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }

  digitalWrite(BLUE_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("=== Smart Room Monitoring System ===");
  Serial.println("Commands: 'WON', 'WOFF', 'BON', 'BOFF'");
}

void showStartupMessage() {
  lcd.clear();
  lcd.print(" Smart Room  v2.1");
  lcd.setCursor(0, 1);
  lcd.print("System Ready");
  delay(2000);
}

void loop() {
  readAllSensors();
  handleButtons();
  if (Serial.available()) handleSerialCommands();
  controlLEDs();
  controlBlueLED();
  checkAlerts();
  monitorSoundSensor();
  updateDisplay();
  updateSerialOutput();
  delay(100);
}

void readAllSensors() {
  // Sensors are read in their respective functions when needed
}

void controlLEDs() {
  if (whiteLedsManualOn) {
    setAllLEDs(HIGH);
    return;
  }

  int lightLevel = analogRead(LDR_PIN);
  bool motionActive = (millis() - lastMotionTime) < MOTION_TIMEOUT;
  bool shouldTurnOn = (lightLevel <= LDR_DARK) && motionActive;

  setAllLEDs(shouldTurnOn);
}

void setAllLEDs(bool ledState) {
  for (byte i = 0; i < LED_COUNT; i++) {
    digitalWrite(LED_PINS[i], ledState ? HIGH : LOW);
  }
}

void controlBlueLED() {
  digitalWrite(BLUE_LED_PIN, blueLedOn ? HIGH : LOW);
}

void handleButtons() {
  int reading2 = digitalRead(BUTTON2_PIN);
  int reading1 = digitalRead(BUTTON1_PIN);

  if (reading1 != lastButton1State) lastDebounceTime1 = millis();
  if ((millis() - lastDebounceTime1) > DEBOUNCE_DELAY) {
    if (reading1 != button1State) {
      button1State = reading1;
      if (button1State == HIGH) {
        blueLedOn = !blueLedOn;
        soundSensorActive = blueLedOn;
        lcd.clear();
        lcd.print("Blue LED ");
        lcd.print(blueLedOn ? "ON" : "OFF");
        if (!blueLedOn) {
          soundCount = 0;
          lastSoundTime = 0;
          soundAlertActive = false;
        }
      }
    }
  }
  lastButton1State = reading1;

  if (reading2 != lastButton2State) lastDebounceTime2 = millis();
  if ((millis() - lastDebounceTime2) > DEBOUNCE_DELAY) {
    if (reading2 != button2State) {
      button2State = reading2;
      if (button2State == HIGH) {
        whiteLedsManualOn = !whiteLedsManualOn;
        lcd.clear();
        lcd.print("White LEDs ");
        lcd.print(whiteLedsManualOn ? "MANUAL ON" : "AUTO");
      }
    }
  }
  lastButton2State = reading2;
}

void handleSerialCommands() {
  String command = Serial.readStringUntil('\n');
  command.trim();
  if (command.equalsIgnoreCase("WON")) whiteLedsManualOn = true;
  else if (command.equalsIgnoreCase("WOFF")) whiteLedsManualOn = false;
  else if (command.equalsIgnoreCase("BON")) {
    blueLedOn = true;
    soundSensorActive = true;
  } else if (command.equalsIgnoreCase("BOFF")) {
    blueLedOn = false;
    soundSensorActive = false;
    soundCount = 0;
    lastSoundTime = 0;
    soundAlertActive = false;
  }
}

void checkAlerts() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int waterValue = analogRead(WATER_SENSOR_PIN);
  int mq3Value = analogRead(MQ3_PIN);
  bool flame = digitalRead(FLAME_SENSOR_PIN) == LOW;

  if ((temp > TEMP_TOO_HIGH || temp < TEMP_TOO_LOW) && !showingAlert) {
    triggerTemperatureAlert(temp);
  }

  if ((hum > HUM_TOO_HIGH || hum < HUM_TOO_LOW) && !showingAlert) {
    triggerHumidityAlert(hum);
  }

  if (waterValue < WATER_WET && !waterAlertActive && !showingAlert) {
    triggerWaterAlert();
  } else if (waterValue > WATER_DRY && waterAlertActive) {
    waterAlertActive = false;
  }

  if (flame && !flameAlertActive && !showingAlert) {
    triggerFlameAlert();
  } else if (!flame && flameAlertActive) {
    flameAlertActive = false;
  }

  if (mq3Value > ALCOHOL_DANGER && !gasAlertActive && !showingAlert) {
    triggerGasAlert();
    gasAlertActive = true;
  } else if (mq3Value < ALCOHOL_WARNING && gasAlertActive) {
    gasAlertActive = false;
  }

  if (soundAlertActive && (millis() - lastAlertTime > ALERT_DISPLAY_TIME)) {
    soundAlertActive = false;
  }
}

void triggerTemperatureAlert(float temp) {
  showingAlert = true;
  lastAlertTime = millis();
  lcd.clear();
  lcd.print("! TEMP ALERT !");
  lcd.setCursor(0, 1);
  lcd.print(temp > TEMP_TOO_HIGH ? "TOO HIGH: " : "TOO LOW: ");
  lcd.print(temp, 1);
  lcd.print("C");
  activateAlert();
}

void triggerHumidityAlert(float hum) {
  showingAlert = true;
  lastAlertTime = millis();
  lcd.clear();
  lcd.print("! HUMIDITY ALERT !");
  lcd.setCursor(0, 1);
  lcd.print(hum > HUM_TOO_HIGH ? "TOO HIGH: " : "TOO LOW: ");
  lcd.print(hum, 1);
  lcd.print("%");
  activateAlert();
}

void triggerWaterAlert() {
  waterAlertActive = true;
  showingAlert = true;
  lastAlertTime = millis();
  int waterValue = analogRead(WATER_SENSOR_PIN);
  lcd.clear();
  lcd.print("! WATER LEAK !");
  lcd.setCursor(0, 1);
  lcd.print("Level: ");
  lcd.print(waterValue);
  activateAlert();
}

void triggerFlameAlert() {
  flameAlertActive = true;
  showingAlert = true;
  lastAlertTime = millis();
  lcd.clear();
  lcd.print("! FIRE ALERT !");
  lcd.setCursor(0, 1);
  lcd.print("EVACUATE AREA");
  activateAlert();
  for (byte i = 0; i < 10; i++) {
    setAllLEDs(HIGH);
    delay(200);
    setAllLEDs(LOW);
    delay(200);
  }
}

void triggerGasAlert() {
  gasAlertActive = true;
  showingAlert = true;
  lastAlertTime = millis();
  int mq3Value = analogRead(MQ3_PIN);
  lcd.clear();
  lcd.print("! GAS DETECTED !");
  lcd.setCursor(0, 1);
  lcd.print("Ventilate area");
  activateAlert();
}

void triggerSoundAlert() {
  soundAlertActive = true;
  showingAlert = true;
  lastAlertTime = millis();
  lcd.clear();
  lcd.print("! NOISE ALERT !");
  lcd.setCursor(0, 1);
  lcd.print("Check area");
  activateAlert();
  for (byte i = 0; i < 10; i++) {
    digitalWrite(BLUE_LED_PIN, HIGH);
    delay(200);
    digitalWrite(BLUE_LED_PIN, LOW);
    delay(200);
  }
  digitalWrite(BLUE_LED_PIN, blueLedOn ? HIGH : LOW);
}

void activateAlert() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
}

void monitorSoundSensor() {
  if (!soundSensorActive) return;

  if (digitalRead(SOUND_SENSOR_PIN) == HIGH) {
    unsigned long now = millis();
    if (now - lastSoundTime > SOUND_RESET_DELAY) {
      soundCount = 0;
    }

    soundCount++;
    lastSoundTime = now;

    if (soundCount >= SOUND_ALERT_COUNT && !soundAlertActive && !showingAlert) {
      triggerSoundAlert();
    }
    delay(50);
  }
}

void updateDisplay() {
  if (showingAlert && (millis() - lastAlertTime < ALERT_DISPLAY_TIME)) return;
  showingAlert = false;

  lcd.clear();
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temp, 1);
  lcd.print("C H:");
  lcd.print(hum, 1);
  lcd.print("%");

  lcd.setCursor(0, 1);
  lcd.print(analogRead(LDR_PIN) < LDR_DARK ? "D" : "B");
  lcd.print((millis() - lastMotionTime) < MOTION_TIMEOUT ? "M" : " ");
  lcd.print("G:");
  lcd.print(analogRead(MQ3_PIN));
  lcd.print(whiteLedsManualOn ? "W" : "w");
  lcd.print(blueLedOn ? "B" : "b");
  lcd.print(soundSensorActive ? "S" : "s");
}

void updateSerialOutput() {
  if (millis() - lastSerialUpdate > SERIAL_UPDATE_INTERVAL) {
    lastSerialUpdate = millis();
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int mq3Value = analogRead(MQ3_PIN);
    int ldrValue = analogRead(LDR_PIN);
    int waterValue = analogRead(WATER_SENSOR_PIN);
    bool flameDetected = digitalRead(FLAME_SENSOR_PIN) == LOW;
    bool waterDetected = waterValue < WATER_WET;
    bool soundDetected = digitalRead(SOUND_SENSOR_PIN) == HIGH;
    bool motionDetected = (millis() - lastMotionTime) < MOTION_TIMEOUT;

    Serial.println("=== Current Sensor Readings ===");
    Serial.print("Temp: "); Serial.print(temp); Serial.println("°C");
    Serial.print("Humidity: "); Serial.print(hum); Serial.println("%");
    Serial.print("Gas Level: "); Serial.println(mq3Value);
    Serial.print("Light Level: "); Serial.println(ldrValue);
    Serial.print("Water Level: "); Serial.println(waterValue);
    Serial.print("Flame: "); Serial.println(flameDetected ? "DETECTED" : "No");
    Serial.print("Motion: "); Serial.println(motionDetected ? "DETECTED" : "No");
    Serial.print("Sound: "); Serial.println(soundDetected ? "DETECTED" : "No");
    Serial.print("Sound Sensor: "); Serial.println(soundSensorActive ? "ON" : "OFF");
    Serial.print("White LEDs: "); Serial.println(whiteLedsManualOn ? "MANUAL" : "AUTO");
    Serial.print("Blue LED: "); Serial.println(blueLedOn ? "ON" : "OFF");
    Serial.println("------------------------------");

    Serial.print("{\"temperature\":");
    Serial.print(temp, 1);
    Serial.print(",\"humidity\":");
    Serial.print(hum, 1);
    Serial.print(",\"alcohol_level\":");
    Serial.print(mq3Value);
    Serial.print(",\"flame_detected\":");
    Serial.print(flameDetected ? "true" : "false");
    Serial.print(",\"water_detected\":");
    Serial.print(waterDetected ? "true" : "false");
    Serial.print(",\"sound_alert\":");
    Serial.print(soundAlertActive ? "true" : "false");
    Serial.print(",\"motion_detected\":");
    Serial.print(motionDetected ? "true" : "false");
    Serial.println("}");
  }
}
