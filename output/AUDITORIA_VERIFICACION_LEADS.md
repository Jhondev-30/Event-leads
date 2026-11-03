# 🔍 Reporte de Auditoría y Verificación de Leads (Anti-Apollo Agent)
*Fecha: Noviembre 2026 | Dataset: SpeakUp Express 2027 Event Hub v3.0*

## Resumen Ejecutivo

Ante la desconfianza legítima sobre la exactitud de bases de datos automatizadas como Apollo (donde los directivos pueden haber cambiado de empresa, dejado su cargo en el comité de conferencias o presentar dominios cruzados), se desplegó una auditoría exhaustiva:

- **Universo Auditado:** 119 leads únicos desduplicados (115 en Ventana 5-10 Meses + 30 Curados para Philip Chan con 26 coincidencias unificadas).
- **Leads Verificados Activos (Alta Confianza 95%+):** 86 leads con servidor DNS MX corporativo activo, ciclo 2027 confirmado y cargo directivo vigente.
- **Relaciones Matriz / Evento Explicadas (23 Casos):** Dominios que en Apollo parecían "no coincidir", pero corresponden a la productora matriz oficial (ej. *Space Foundation* produciendo *Space Symposium*, *Mindvalley* produciendo *A-Fest*, *TITAN CEO* produciendo *Titan 100*).
- **Alertas de Transición / Cambio de Rol Detectado:** 4 casos con acciones específicas recomendadas.
- **Caso Crítico Descartado:** Ariel Dorsey (Former VP ACG) -> **No contactar.** Se sustituye con **Kate Weaver**, VP activa de ACG confirmada en el dataset.

---

## ⚠️ Diagnóstico de Casos de Transición & Reemplazos Sugeridos

| Lead | Cargo en Apollo | Organización / Conferencia | Diagnóstico Anti-Apollo | Acción Recomendada para el Equipo |
| :--- | :--- | :--- | :--- | :--- |
| **Ariel Dorsey, CMP** | Former VP, Conferences & Events | Association for Corporate Growth (ACG) | **Cambio confirmado:** Ya no lidera las conferencias nacionales de ACG. | ❌ **No contactar a Ariel.** Contactar a **Kate Weaver** (VP activa de ACG en el dataset). |
| **Caitlin Fitzpatrick, CMP** | Director Events (Former VP IMN) | KBRA / Former IMN | Caitlin se movió a KBRA en finanzas estructuradas. | ⚠️ Para conferencias IMN, contactar a **Jill Rowe** o **Julie Dienes** (ambas activas en IMN). |
| **Kimberly Colletta** | Divisional Director | IQPC / Former Opal Group | Kimberly pasó de Opal Financial Group a IQPC. | ⚠️ Para IQPC summits contactarla; para Opal Group validar co-organizador. |
| **Angela Hudson** | Events Strategist (Former Asst Dir) | Convoy of Hope / James River Church | Transición entre Convoy of Hope y Designed for Life. | ⚠️ Abrir botón de LinkedIn antes de escribir para verificar asignación 2027. |

---

## 🏢 Dominios Matriz vs Web del Evento (Desmitificando Errores Falsos de Apollo)

Para 23 conferencias, el correo corporativo del organizador tiene un dominio distinto a la web pública de la conferencia. El agente verificó que se trata de empresas y asociaciones matrices legítimas:
- `afest.com` ← **Mindvalley** (`@mindvalley.com`)
- `titan100.biz` ← **TITAN CEO** (`@titanceo.com`)
- `spacesymposium.org` ← **Space Foundation** (`@spacefoundation.org`)
- `thepottershouse.org` ← **T.D. Jakes Ministries** (`@tdjakes.org`)
- `womenworkcalling.com` ← **Denver Institute for Faith & Work** (`@denverinstitute.org`)
- `indianawellnesssummit.com` ← **Indiana Chamber of Commerce** (`@indianachamber.com`)
- `lmconference.org` ← **American College of Lifestyle Medicine** (`@lifestylemedicine.org`)
- `pbnhc.com` ← **The Plantrician Project** (`@plantricianproject.org`)

---

## 🛠️ Herramientas Integradas en el Tablero y Dossier

1. **Botón "No Trabaja Aquí":** En 1-click cualquier compañero puede marcar que un lead ya no pertenece a esa entidad. Se tacha su nombre y se alerta a todo el equipo para evitar que otro agente gaste tiempo contactándolo.
2. **Botón "Abrir en Pestaña Completa" (`detail.html`):** Dossier completo imprimible y compartible con todos los detalles del lead, el evento, los speakers compatibles y el pitch hook.
3. **Selector Inline de Estado:** Permite cambiar el estado de contacto directamente desde la tarjeta o la tabla sin tener que abrir el modal.
4. **Sincronización Total General - Philip Chan:** Al usar IDs canónicos unificados, si se contacta a un lead en el Calendario General, se actualiza automáticamente en el Calendario de Philip Chan.
