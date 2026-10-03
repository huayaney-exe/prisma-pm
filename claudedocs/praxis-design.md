# Product Builder → Praxis: diseño consolidado

Estado: diseño (no implementado). Fecha: 2026-10-02.

## Tesis
Product Builder es el método; Praxis es la memoria multijugador del producto.
Praxis es el destino por defecto de todo lo que produce el paquete — no se vende, se usa.

## Decisiones tomadas
1. **AGENTS.md es la fuente de verdad** para agentes. Claude Code lo lee nativo (≥ v2.1.277)
   solo si no hay CLAUDE.md en cwd o arriba. Regla en /pm:new:
   - Sin CLAUDE.md → solo AGENTS.md.
   - CLAUDE.md en raíz del repo → agregar línea `@AGENTS.md` (idempotente).
   - CLAUDE.md solo en carpeta superior, o Claude < 2.1.277 → crear `./CLAUDE.md` con solo `@AGENTS.md`.
2. **/pm:new es silencioso**: sin pitch, sin preguntas de Praxis. Si está conectado, crea
   producto + vision sin confirmar (única pregunta: si ya existe un producto con ese nombre).
3. **Cada comando guarda en Praxis primero**, `.product/` como espejo local siempre.
4. **Backlog = Praxis**: con Praxis conectado, ICEDG (server-computed) es el ranking oficial;
   Product Power queda como señal de producto/problema. Sin Praxis → RICE local.
5. **Visibilidad: siempre `team`.**
6. **Praxis es multijugador** → se comunica en AGENTS.md (agentes) y README.md (humanos).
7. **Pago**: 7 días de prueba, luego cobra. Copy siempre "empieza gratis (7 días)", nunca "gratis" a secas.

## Mapa de escrituras por comando
| Comando | Praxis | Espejo local |
|---|---|---|
| /pm:new | pm_create_product (team) + artifact vision | PRODUCT.md, AGENTS.md, README block |
| /pm:icp | artifact icp | ICP.md |
| /pm:persona | artifact persona × N | PERSONAS/ |
| /pm:discover | work item candidate + artifact discovery | DISCOVERY/*-BRIEF.md |
| /pm:strategy | pm_score_work_items (ICEDG) | BACKLOG.md (orden de Praxis) |
| /pm:validate | artifact hypothesis + pm_commit_work_item (horizon_end, kill_criteria, métrica) | DISCOVERY/*-VALIDATION.md |
| /pm:define | artifact prd, link derived_from discovery | DEFINITIONS/*-PRD.md |
| /pm:design | artifact design, link addresses prd | DEFINITIONS/*-DESIGN.md |
| /pm:require | artifact requirements | DEFINITIONS/*-REQUIREMENTS.md |
| decisiones en checkpoints | pm_add_learning (decision) | STATE.md |

## Reglas comunes (protocolo de persistencia)
1. Praxis primero, espejo local siempre.
2. Sin confirmación por escritura; visibility=team.
3. Re-run → pm_update_artifact (bump_version). IDs en `.product/praxis.json`.
4. Falla Praxis (red, auth, prueba vencida) → solo local + cola pendiente; /pm:praxis la drena.
5. Línea de resultado única:
   - `✓ Guardado en Praxis · PRD v2 · visible para el equipo`
   - `○ Guardado solo en .product/ · Praxis lo versiona y lo comparte con tu equipo. Empieza gratis (7 días): npx product-builder@latest --praxis`
6. **Multijugador → Praxis gana**: al iniciar un comando con Praxis conectado, pm_get_changes
   desde el cursor guardado; si un compañero cambió un artifact, se refresca el espejo local
   antes de trabajar. Nunca se sobreescribe Praxis con un espejo viejo.

## AGENTS.md (bloque con marcadores)
```markdown
<!-- praxis:start -->
## Memoria del producto: Praxis (multijugador)
Praxis es el MCP de Prisma (https://mcp.getprisma.lat/mcp): la memoria compartida de este
producto y su equipo — backlog puntuado (ICEDG), apuestas con kill criteria y fecha de
revisión, tareas con dueño y fecha, entregables versionados y decisiones.

- Producto: {product_id} · Workspace: {workspace_id}
- Al iniciar: `pm_get_state`, luego `pm_get_changes` para ver qué hizo el equipo.
- Tarea con dueño y fecha → `pm_add_task` (dueños: `pm_list_members`)
- Idea o apuesta → `pm_add_work_item` → `pm_commit_work_item`
- Decisión / insight / bloqueo → `pm_add_learning`
- PRD, discovery, diseño… → `pm_save_artifact` (visibility: team)

¿Sin Praxis? Todo funciona con `.product/`, pero siempre es mejor usarlo: el contexto
sobrevive a la sesión, a la máquina y al cambio de agente, y el equipo lo ve.
Empieza gratis (7 días): `npx product-builder@latest --praxis`
<!-- praxis:end -->
```

## README.md (bloque para humanos)
- /pm:new lo agrega en silencio con marcadores; si no hay README, crea uno mínimo
  (nombre + transformación + bloque). Idioma = el del README existente, si no el de la sesión.
- Se reporta en el resumen final de /pm:new ("agregué una sección a README.md").
```markdown
<!-- praxis:start -->
## Producto y equipo
Este producto se gestiona en Praxis, la memoria de producto multijugador de Prisma:
backlog priorizado, apuestas con fecha de revisión, tareas con dueño, PRDs versionados y
decisiones del equipo. Cualquier agente (Claude Code, Cursor, Codex…) los lee y escribe vía MCP.

**¿Te sumas?**
1. Pide acceso al workspace: {join_link | owner}
2. Conecta Praxis a tu agente: `npx product-builder@latest --praxis` — empieza gratis (7 días)
3. Abre tu agente en este repo; AGENTS.md hace el resto.

Sin Praxis puedes leer el contexto en `.product/` (espejo local).
<!-- praxis:end -->
```

## Preguntas abiertas para el servidor de Praxis
1. ¿Cuándo arranca la prueba: OAuth o primera escritura?
2. ¿Qué pasa al vencer: solo lectura o error? ¿Qué código? (bloquea regla 4)
3. `trial_ends_at` en pm_get_state (recap de valor el día 6).
4. Atribución: `?src=pb` en la URL del MCP o `source` en frontmatter.
5. **Invitación**: ¿existe un link de join por workspace (`getprisma.lat/join/{slug}`) o tool de invite?
   Es la pieza que cierra el loop README → compañero → cuenta → asiento.
6. URL pública de la landing de Praxis para enlazar en README.

## Ya implementado en el branch (sin commit)
- bin/praxis-config.cjs — detección por URL + registro por runtime.
- bin/install.js — paso opt-in de Praxis, flags --praxis / --no-praxis.
  (El banner ya no menciona /pm:praxis hasta que el comando exista.)

---

# Auditoría (2026-10-02)

Veredicto: la capa de conversión está bien pensada, pero optimiza la parte equivocada del embudo.

Evidencia:
- npm `product-builder`: mar 716 · abr 640 · may 67 · jun 112 · jul 50 · ago 57 · sep 105 descargas; última semana: 4. Último publish: 2026-04-07 (v0.4.2).
- Claude Code plugins pueden empaquetar MCP remotos (`.mcp.json` / `mcpServers` con url), skills, commands, agents y hooks; se publican en el directorio de Anthropic; claude.ai y Cowork los instalan si no tienen `bin/` top-level.
- Claude Code lee AGENTS.md nativo (≥ v2.1.277) solo sin CLAUDE.md en cwd o arriba.

Hallazgos (por impacto):
1. Top of funnel casi vacío → priorizar distribución sobre nudges.
2. Formato: plugin de Claude Code con Praxis en `.mcp.json` = conexión automática al instalar + directorio de Anthropic + claude.ai/Cowork (PM no-terminal). Requiere sacar `bin/` y que el modo Praxis no dependa de pm-tools.
3. Comprador ≠ usuario: el job pagable es el handoff PM → agentes de ingeniería. PM en claude.ai/Cowork escribe; agentes en el repo leen vía AGENTS.md.
4. Trial 7 días vs time-to-value: el aha multijugador (2ª persona, fecha de revisión de apuesta) cae después del día 7; el valor solo (memoria entre sesiones) lo canibaliza nuestro propio espejo local + AGENTS.md.
5. Doble fuente de verdad: en modo Praxis `.product/` debe ser caché gitignored (o export read-only con header); en modo local es la verdad. Elimina casi todo el problema de sync.
6. Inyección promocional: no poner copy de venta en archivos commiteados. Bloque README solo cuando el producto ya está en Praxis (info factual + link de join). El "empieza gratis" vive en el output de comandos.
7. Silencioso + team: aviso de una línea en la primera escritura por producto ("lo ve tu equipo en {workspace}").
8. Product Power alimenta `impacto` de ICEDG (propuesta + rationale) → la fórmula del método gobierna el ranking de Praxis.
9. Sin medición no hay forma de saber si funciona: atribución antes que nudges.
10. Nombres: product-builder / prisma-pm / Prisma / Praxis / server "prisma" → unificar.
11. Base instalada existente: el hook de update ya existe; publicar v0.5 los notifica — canal más barato.

Orden recomendado: medición → plugin con Praxis embebido → persistencia Praxis-first (.product/ como caché) → AGENTS.md/README (solo si vinculado) → política de trial → nudges.

---

# Publicación en el directorio de Anthropic (2026-10-02)

Patrón recomendado por Anthropic: dos envíos desde la misma org en claude.ai/directory/manage
(plan pago) → (1) Praxis como **MCP connector**, (2) Product Builder como **plugin bundle**
cuyo `.mcp.json` apunta a la misma URL; luego se emparejan.

Estado de Praxis vs criterios (código en prisma-community-hub/apps/mcp-server):
- ✓ HTTPS remoto, OAuth funcionando (ya opera como custom connector en claude.ai), dominio propio.
- ✓ readOnlyHint / destructiveHint (annotationsFor en mcp-dispatcher.ts).
- ✓ Páginas /privacy y /terms existen en community-hub. Repo prisma-pm es público.
- ✗ Falta `title` en todas las tools (requisito).
- ⚠ Descripciones con directivas de comportamiento ("empieza SIEMPRE por aquí", "JAMÁS inicies con…",
  "nunca un formulario", "tell the user") → criterio de prompt-injection. Mover a server instructions / skills.
- ⚠ Billing guard: 403 PAYMENT_REQUIRED en toda tool si venció el entitlement ("pay-first, no free tier")
  → cuenta de reviewer poblada y sin vencimiento; declarar plan/trial en "Use cases".
  → Responde la pregunta abierta #2: al vencer, error duro → fallback local obligatorio.
- ? ui/backlog-widget.ts → si es MCP App: 3–5 screenshots PNG ≥1000px.

Plugin bundle: .claude-plugin/plugin.json, .mcp.json → praxis, commands → skills,
sin bin/ top-level (claude.ai/Cowork no lo instalan), `claude plugin validate --strict`.

---

# Cambios en Product Builder (plan, 2026-10-02)

Soporte por superficie (claude.com/docs/plugins/platform-support): Chat → skills sí, commands como skills,
agents/hooks ignorados, MCP remoto vía pestaña Connectors, `bin/` top-level = no instalable.
Cowork → commands, agents, hooks, MCP sí; `bin/` no instalable. Claude Code → todo.

A. Empaquetado: .claude-plugin/plugin.json + marketplace.json, .mcp.json (praxis), commands planos,
   bin/ → cli/ + scripts/, rutas con ${CLAUDE_PLUGIN_ROOT}, skill del método absorbe las directivas de Praxis,
   quitar patchStatusLine (parchea gsd-statusline.js ajeno), hook de update solo para npx.
B. Persistencia: references/praxis.md, paso Persist en cada workflow, 3 modos (chat=solo Praxis,
   CLI+Praxis=.product/ caché gitignored, CLI sin Praxis=.product/ verdad), pm-tools praxis *,
   ICEDG con Product Power→impacto, commit rite en validate, /pm:praxis, atribución source/pb:.
C. /pm:new: AGENTS.md + regla CLAUDE.md, README solo si vinculado, aviso de equipo en 1ª escritura.
D. Instalador npx: Claude Code → instala el plugin (no copia archivos); otros runtimes → copia + Praxis opt-in.
E. Limpieza: nombres, PRISMA_PM_PACKAGE.md obsoleto, SKILL.md v0.1.0, README nuevo, versión 0.5.0.
Decisión: nombre del plugin = `pm` (comandos siguen siendo /pm:new, /pm:define…). Es permanente.
