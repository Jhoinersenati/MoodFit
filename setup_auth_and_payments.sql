-- 1. Tabla de Perfiles (Se vincula con auth.users de Supabase)
CREATE TABLE perfiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('usuario', 'coach')) NOT NULL,
  precio_mensual DECIMAL(10, 2) DEFAULT 0.00, -- Solo para coaches
  especialidad TEXT, -- Solo para coaches
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Contratos/Suscripciones
CREATE TABLE contratos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id),
  coach_id UUID REFERENCES auth.users(id),
  metodo_pago TEXT NOT NULL, -- 'yape', 'tarjeta'
  monto DECIMAL(10, 2) NOT NULL,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar acceso público para la demo (En producción, usar RLS restrictivo)
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON perfiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON perfiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON perfiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can see own contracts" ON contratos FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() = coach_id);
CREATE POLICY "Users can create contracts" ON contratos FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- IMPORTANTE: Para que funcione el login/registro en esta prueba,
-- asegúrate de ir a Supabase -> Authentication -> Providers -> Email
-- y DESACTIVAR "Confirm email" para que los usuarios puedan entrar directamente al registrarse.
