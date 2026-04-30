-- Script para crear la tabla de rutinas en Supabase
CREATE TABLE rutinas (
  id SERIAL PRIMARY KEY,
  estado_animo TEXT NOT NULL,
  nombre_ejercicio TEXT NOT NULL,
  instrucciones TEXT,
  duracion_segundos INTEGER DEFAULT 30,
  url_video TEXT,
  url_musica TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ejemplo de inserción de datos
INSERT INTO rutinas (estado_animo, nombre_ejercicio, instrucciones, duracion_segundos, url_video, url_musica)
VALUES 
('triste', 'Estiramiento de Cuello', 'Mueve tu cabeza lentamente de lado a lado para liberar tensión.', 30, '/videos/cuello.mp4', '/musica/calma.mp3'),
('alegre', 'Saltos de Tijera', 'Salta abriendo brazos y piernas rítmicamente.', 45, '/videos/saltos.mp4', '/musica/pop.mp3');
