-- HealthyLife: estructura de la base de datos
-- Se puede ejecutar varias veces sin borrar datos existentes.

CREATE DATABASE IF NOT EXISTS healthylife
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE healthylife;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  meta_agua_ml INT NOT NULL DEFAULT 2000,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (meta_agua_ml > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registros_sueno (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  hora_acostarse DATETIME NOT NULL,
  hora_despertar DATETIME NOT NULL,
  calidad TINYINT NOT NULL,
  notas TEXT NULL,
  CHECK (calidad BETWEEN 1 AND 5),
  CHECK (hora_despertar > hora_acostarse),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registros_bebida (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  tipo ENUM('agua', 'cafe', 'jugo', 'refresco', 'otra') NOT NULL,
  cantidad_ml INT NOT NULL,
  CHECK (cantidad_ml > 0),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registros_comida (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  tipo_comida ENUM('desayuno', 'comida', 'cena', 'colacion') NOT NULL,
  alimentos VARCHAR(255) NOT NULL,
  porcion VARCHAR(100) NULL,
  calorias INT NULL,
  proteinas_g DECIMAL(6,1) NULL,
  carbohidratos_g DECIMAL(6,1) NULL,
  grasas_g DECIMAL(6,1) NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registros_actividad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  tipo ENUM('gimnasio', 'caminar', 'correr', 'bicicleta', 'otra') NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  duracion_min INT NOT NULL,
  intensidad ENUM('baja', 'media', 'alta') NULL,
  notas TEXT NULL,
  CHECK (duracion_min > 0),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registros_sedentario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha DATE NOT NULL,
  minutos INT NOT NULL,
  notas TEXT NULL,
  CHECK (minutos >= 0),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
