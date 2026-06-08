-- ============================================================
-- 1. Crear tabla de planes
-- ============================================================
CREATE TABLE plans (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,          -- 'starter', 'pro', 'agency'
    display_name TEXT NOT NULL,                -- 'Starter', 'Pro', 'Agency'
    price       NUMERIC(10,2) NOT NULL,        -- 29.00, 59.00, 99.00
    max_candidates  INT,                       -- NULL = ilimitado
    max_jobs        INT,                       -- NULL = ilimitado
    max_users       INT,                       -- NULL = ilimitado
    has_custom_landing  BOOLEAN DEFAULT false,
    has_mass_email      BOOLEAN DEFAULT false,
    storage_mb          INT DEFAULT 500,
    active      BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. Insertar los 3 planes
-- ============================================================
INSERT INTO plans (name, display_name, price, max_candidates, max_jobs, max_users, has_custom_landing, has_mass_email, storage_mb)
VALUES
    ('starter', 'Starter',  29.00, 100,  3,   1, false, false, 500),
    ('pro',     'Pro',      59.00, 500,  10,  3, true,  true,  5000),
    ('agency',  'Agency',   99.00, NULL, NULL, NULL, true, true, 25000);

-- ============================================================
-- 3. Agregar plan_id a organizations
-- ============================================================

-- Obtener el id del plan starter para usarlo como default
-- (ejecutar primero el INSERT de arriba)
ALTER TABLE organizations
    ADD COLUMN plan_id UUID REFERENCES plans(id),
    ADD COLUMN plan_expires_at TIMESTAMPTZ;

-- Asignar plan Starter a todas las orgs existentes
UPDATE organizations
SET plan_id = (SELECT id FROM plans WHERE name = 'starter')
WHERE plan_id IS NULL;

-- Ahora hacer NOT NULL y setear default con el UUID real del plan starter
DO $$
DECLARE
    starter_id UUID;
BEGIN
    SELECT id INTO starter_id FROM plans WHERE name = 'starter';
    
    -- Hacer NOT NULL
    ALTER TABLE organizations ALTER COLUMN plan_id SET NOT NULL;
    
    -- Setear default con el UUID literal
    EXECUTE format('ALTER TABLE organizations ALTER COLUMN plan_id SET DEFAULT %L', starter_id);
END $$;

-- ============================================================
-- 4. RLS (Row Level Security) para plans
-- ============================================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer los planes (son públicos para la landing)
CREATE POLICY "Plans are readable by everyone"
    ON plans FOR SELECT
    USING (true);

-- Solo service_role puede modificar planes
CREATE POLICY "Only service role can modify plans"
    ON plans FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================
-- 5. Índice para búsquedas rápidas
-- ============================================================
CREATE INDEX idx_organizations_plan_id ON organizations(plan_id);
