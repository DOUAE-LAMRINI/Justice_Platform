CREATE TABLE iot_sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  temperature FLOAT,
  humidity FLOAT,
  alcohol_level INT,
  flame_detected BOOLEAN,
  water_detected BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);