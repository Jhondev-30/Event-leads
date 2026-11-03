# SpeakUp Express: Event Leads Pipeline & Calendario 2027

Sistema de prospección y calendario interactivo SSR en **Astro 5** para el equipo de ventas y conferencistas de SpeakUp Express. Diseñado para gestionar **183 leads verificados** con alta probabilidad de contratación pagada (Keynote Speaker Fees entre $7,500 y $40,000+ USD) en eventos corporativos, médicos, de liderazgo y asociaciones nacionales en EE. UU.

---

## 🚀 Características Principales

- **Calendario Cronológico 2027:** Vista mensual con ventana estratégica de postulación (5 a 10 meses de antelación).
- **183 Leads Verificados (Cero IA Falsa):**
  - Organizadores reales con perfil de LinkedIn y URLs de eventos oficiales comprobadas.
  - Exclusión total de eventos *pay-to-play* o ferias de venta de stands (SaaStr, etc.).
  - Asignación de conferencistas sugeridos (Dra. Saundra Dalton-Smith, Dr. Phillip Meade, etc.) y *pitch hook* redactado a medida.
- **Sincronización en Tiempo Real:** API REST para cambio de estado (`No contactado`, `Contactado`, `En seguimiento`, `Confirmado`, `Descartado`) y bitácora de notas con fecha y nombre de agente.
- **Diseño & UX Premium:**
  - Estética ejecutiva basada en la identidad visual de Rojo Escenario (`#0A0A0A` y `#E50C13`).
  - Iconografía vectorial nativa con [Lucide](https://lucide.dev/).
  - Animaciones fluidas con GSAP para apertura/cierre de meses y acordeones.
- **Listo para VPS / Producción:** Adaptador `@astrojs/node` en modo SSR con soporte para PM2 y Docker.

---

## 📂 Estructura del Repositorio

```text
├── astro-calendar/            # Proyecto principal Astro (SSR + Node adapter)
│   ├── src/
│   │   ├── data/             # Bases de datos JSON (generalLeads.json, philipLeads.json)
│   │   ├── pages/
│   │   │   ├── api/status.js # Endpoint REST para notas y estados colaborativos
│   │   │   └── index.astro   # Interfaz del calendario y ficha de eventos
│   │   └── layouts/
│   ├── Dockerfile            # Configuración para despliegue en contenedor
│   ├── docker-compose.yml
│   └── ecosystem.config.cjs  # Configuración para PM2 en VPS Linux
├── output/                   # Exportaciones de datos en CSV
│   ├── lote-50-verificados.csv
│   └── leads-verificados-total-183.csv
├── src/                      # Scripts de generación, auditoría y deduplicación
├── ICP.md                    # Criterios del Ideal Customer Profile y roster de speakers
└── DEPLOYMENT_VPS_GUIDE.md   # Guía paso a paso para desplegar en cualquier VPS
```

---

## 🛠️ Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Jhondev-30/Event-leads.git
   cd Event-leads/astro-calendar
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:4321](http://localhost:4321) en tu navegador.

4. **Compilar y ejecutar en modo producción:**
   ```bash
   npm run build
   node dist/server/entry.mjs
   ```

---

## 🌐 Despliegue en VPS (Ubuntu 22.04 / 24.04 LTS)

Consulta la guía completa en [`DEPLOYMENT_VPS_GUIDE.md`](./DEPLOYMENT_VPS_GUIDE.md) o sigue estos pasos básicos:

```bash
# 1. Instalar Node.js 20 y PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 2. Compilar y arrancar la app
cd astro-calendar
npm install
npm run build
PORT=80 pm2 start dist/server/entry.mjs --name "speakup-calendar"
pm2 startup
pm2 save
```
