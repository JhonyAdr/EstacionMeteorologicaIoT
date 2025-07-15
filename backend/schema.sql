CREATE DATABASE IF NOT EXISTS estacion_meteorologica;
USE estacion_meteorologica;

CREATE TABLE IF NOT EXISTS historial_predicciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    temperatura FLOAT,
    humedad FLOAT,
    presion FLOAT,
    lluvia INT,
    frio INT,
    confort INT
);
   SELECT * FROM historial_predicciones ORDER BY fecha DESC;
   
   DELETE FROM historial_predicciones WHERE fecha < NOW() - INTERVAL 30 DAY;