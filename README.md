# Jabhaco Lab 🧼 - Formulación y Costeo de Jabones Artesanales

Aplicación web moderna y responsiva (Mobile-First, estilo Shopify/Linear) desarrollada en **React 18 + TypeScript + Tailwind CSS** conectada a **Supabase PostgreSQL**.

---

## 🚀 Características Principales (Fase 1)

1. **Ficha Técnica & Metadatos del Jabón:**
   - Nombre comercial (*obligatorio*)
   - Precio de venta en COP (*obligatorio*, formateado en tiempo real: `$ 32.000`)
   - Lema o eslogan comercial
   - Tipo de piel recomendado con selector rápido
   - Beneficios botánicos, modo de uso y observaciones del lote
   - Cliente o proyecto especial
   - Toggle para publicación en catálogo comercial

2. **Pestaña "Base Glicerina" (Módulo Activo):**
   - Tabla con bases añadidas a la receta actual con su proveedor, cantidad usada (g), costo unitario por gramo y subtotal en COP.
   - Ajuste rápido en línea de cantidades y eliminación de items.
   - Resumen superior con peso total de la base y costo acumulado.
   - Botón **"Agregar Base"** con modal interactivo:
     - Buscador reactivo en tiempo real por nombre o proveedor.
     - Orden alfabético por defecto.
     - Asignación de cantidad con soporte de decimales (ej. `85.5 g`).
     - Botón **"Crear nueva base en inventario"** para registrar nuevos insumos directamente en la tabla `insumos` con cálculo automático de costo por gramo (`valor_compra / cantidad_comprada`).

3. **Pestaña "Resumen & Costeo" (Métricas Financieras en Tiempo Real):**
   - **Costo Real Total:** Suma dinámica de los subtotales de materias primas.
   - **Precio de Venta:** Tomado de la ficha técnica.
   - **Margen Bruto ($):** `Precio de Venta - Costo Real`.
   - **Rentabilidad (%):** `(Margen / Precio de Venta) * 100`.
   - Semáforo y barra visual de salud de margen (Verde > 50%, Azul 25-50%, Amarillo/Rojo alertas).
   - Tabla analítica con porcentaje de participación en el peso y en el costo.
   - Botón **"Guardar Jabón"** que persiste coordinadamente en `jabones` y `jabon_componentes`.

4. **Conexión Supabase & Modo Sandbox Local:**
   - Si no has configurado tus credenciales de Supabase en `.env`, la aplicación arranca en **Modo Sandbox Local** con bases de glicerina precargadas y persistencia en navegador para que puedas probarla inmediatamente.
   - Puedes configurar la URL y Anon Key en cualquier momento desde el botón de la cabecera o mediante el archivo `.env`.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Vite.
- **Estilos:** Tailwind CSS, tipografía Plus Jakarta Sans / Inter.
- **Iconografía:** Lucide React.
- **Base de Datos:** `@supabase/supabase-js` conectado a Supabase PostgreSQL.

---

## ⚙️ Configuración y Ejecución

### 1. Variables de Entorno (Opcional)
Copia `.env.example` a `.env` y coloca las credenciales de tu proyecto de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 2. Iniciar el Servidor de Desarrollo
```bash
npm install
npm run dev
```
Abre en tu navegador: [http://localhost:5173](http://localhost:5173)

### 3. Compilación para Producción
```bash
npm run build
```
