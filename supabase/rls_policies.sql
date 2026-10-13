-- ==============================================================================
-- FIX: Políticas de Row Level Security (RLS) para Jabhaco Lab en Supabase
-- Ejecuta este script en Supabase: SQL Editor -> New Query -> Run
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- OPCIÓN A (Recomendada): Habilitar RLS con Políticas de Lectura y Escritura
-- Permite operaciones a usuarios públicos (anon) y autenticados (authenticated)
-- ------------------------------------------------------------------------------

-- 0. Soporte para unidad 'metros' (para cintas, cordeles, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'unidad_medida' AND e.enumlabel = 'metros'
  ) THEN
    ALTER TYPE public.unidad_medida ADD VALUE 'metros';
  END IF;
END $$;

-- 1. Tabla 'insumos'
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir select insumos" ON public.insumos;
CREATE POLICY "Permitir select insumos"
ON public.insumos FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir insert insumos" ON public.insumos;
CREATE POLICY "Permitir insert insumos"
ON public.insumos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update insumos" ON public.insumos;
CREATE POLICY "Permitir update insumos"
ON public.insumos FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir delete insumos" ON public.insumos;
CREATE POLICY "Permitir delete insumos"
ON public.insumos FOR DELETE
TO anon, authenticated
USING (true);


-- 2. Tabla 'jabones'
ALTER TABLE public.jabones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir select jabones" ON public.jabones;
CREATE POLICY "Permitir select jabones"
ON public.jabones FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir insert jabones" ON public.jabones;
CREATE POLICY "Permitir insert jabones"
ON public.jabones FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update jabones" ON public.jabones;
CREATE POLICY "Permitir update jabones"
ON public.jabones FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir delete jabones" ON public.jabones;
CREATE POLICY "Permitir delete jabones"
ON public.jabones FOR DELETE
TO anon, authenticated
USING (true);


-- 3. Tabla 'jabon_componentes'
ALTER TABLE public.jabon_componentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir select jabon_componentes" ON public.jabon_componentes;
CREATE POLICY "Permitir select jabon_componentes"
ON public.jabon_componentes FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir insert jabon_componentes" ON public.jabon_componentes;
CREATE POLICY "Permitir insert jabon_componentes"
ON public.jabon_componentes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update jabon_componentes" ON public.jabon_componentes;
CREATE POLICY "Permitir update jabon_componentes"
ON public.jabon_componentes FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir delete jabon_componentes" ON public.jabon_componentes;
CREATE POLICY "Permitir delete jabon_componentes"
ON public.jabon_componentes FOR DELETE
TO anon, authenticated
USING (true);


-- ------------------------------------------------------------------------------
-- OPCIÓN B (Alternativa directa si no necesitas RLS en el taller):
-- Deshabilita RLS por completo en las tablas de formulación
-- ------------------------------------------------------------------------------
-- ALTER TABLE public.insumos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.jabones DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.jabon_componentes DISABLE ROW LEVEL SECURITY;
