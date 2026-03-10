# Auditoría Integral — Prisma PM v0.2

**Fecha:** 2026-03-10
**Versión auditada:** 0.2.0
**Archivos:** 50 | **Líneas:** 7,349 | **Arquitectura:** 3 capas (comando → workflow → agente)

---

## Resumen Ejecutivo

### Evaluación inicial (comparación directa PM vs GSD)

| Dimensión | Score | Veredicto |
|-----------|-------|-----------|
| 1. PM vs GSD | **7.0/10** | Paridad estructural lograda; gap en profundidad y cobertura |
| 2. Protocolos y Tool Calling | **7.5/10** | Buenos fundamentos; gaps en workflow tracking y subagent_type |
| 3. Experiencia de Usuario | **6.5/10** | Instalación sólida; onboarding y error handling débiles |
| 4. Valor y Funcionalidad | **6.5/10** | Propuesta única; falta validación real y stage de métricas |
| **Score Global** | **6.9/10** | **Estructuralmente sólido, necesita pulido operativo** |

### Evaluación recalibrada (PM como copiloto cognitivo — ver Meta-Auditoría al final)

| Dimensión | Score | Veredicto |
|-----------|-------|-----------|
| 1'. Cobertura de dominio PM | **8.5/10** | 9/13 stages cubiertos, estructura .product/ 85-90% correcta |
| 1''. Valor cognitivo instalado | **8.7/10** | Workflows enseñan a pensar, no solo automatizan |
| 2. Protocolos y Tool Calling | **7.5/10** | Sin cambio — protocolos son protocolos |
| 3. Experiencia de Usuario | **7.0/10** | La UX Socrática ES la UX correcta para PM |
| 4. Valor y Funcionalidad | **8.0/10** | Copiloto cognitivo > automatización; 10x PM thesis real |
| **Score Global** | **7.9/10** | **Thinking system funcional; necesita testing real y onboarding** |

**Conclusión:** v0.2 es un salto cualitativo desde v0.1. La auditoría inicial sobrevaluó la comparación con GSD (herramienta de ejecución de código) y subvaloró el aspecto de copiloto cognitivo. PM no necesita 32 workflows ni 15 agentes — necesita las preguntas correctas, anti-pattern detection, y grounding económico en cada decisión. Eso ya lo tiene. Los gaps reales son: testing con productos reales, onboarding del PM no-técnico, y error handling amigable.

---

## Dimensión 1: PM vs GSD — Comparación Arquitectónica

**Score: 7.0/10**

### Lo que está bien

| Aspecto | PM v0.2 | GSD v1.20 | Evaluación |
|---------|---------|-----------|------------|
| Arquitectura | 3 capas | 3 capas | Paridad |
| Comando avg | ~49 líneas | ~40 líneas | Comparable |
| Workflow avg | ~256 líneas | ~322 líneas | Aceptable |
| Agente avg | ~288 líneas | ~652 líneas | 44% del target |
| Agent sections | 8 secciones | 8 secciones | Paridad |
| Banner UX | `PM ►` branded | `GSD ►` branded | Paridad |
| Iteration loops | Bounded at 3 | Bounded at 3 | Paridad |
| @-references | Sí | Sí | Paridad |
| YAML frontmatter | Sí | Sí | Paridad |

**Fortalezas:**
- Los 8 comandos complejos son thin routers correctos (~30-37 líneas c/u) — `commands/pm/discover.md`, `commands/pm/define.md`, etc.
- Los 9 workflows tienen estructura XML correcta: `<purpose>` → `<required_reading>` → `<process>` con `<step>` tags → `<output>` → `<success_criteria>`
- Los 5 agentes tienen las 8 secciones GSD: `<role>`, `<context_fidelity>`, `<philosophy>`, `<process>`, `<checkpoints>`, `<error_handling>`, `<output_format>`, `<success_criteria>`
- pm-tools.cjs tiene 10 operaciones con error handling estandarizado

### Gaps vs GSD

| Gap | PM v0.2 | GSD v1.20 | Impacto |
|-----|---------|-----------|---------|
| Total workflows | 9 | 32 | 3.5x menos cobertura |
| Total agentes | 5 | 15 | 3x menos especialización |
| CLI tool | 653 líneas | ~7,600 líneas | 12x menos operaciones |
| Fases jerárquicas | No | Sí (phases → plans → tasks) | Sin ejecución incremental |
| Waves paralelas | No | Sí (parallel execution waves) | Sin optimización de concurrencia |
| Verification loops | No | Sí (gsd-verifier agent) | Sin auto-validación post-ejecución |
| Tipos de checkpoint | 1 (approval) | 3 (verify, decision, action) | Menos granularidad en gates |
| Codebase mapping | No | Sí (gsd-codebase-mapper) | Sin análisis automatizado del código |
| Multi-model profiles | No | Sí (quality/balanced/budget) | Sin optimización de costos |
| Continuation format | No | Sí | Sin recuperación de contexto |

**Análisis:** PM logró paridad estructural — la arquitectura de 3 capas es correcta y funcional. El gap está en **profundidad** (agentes al 44% del avg de GSD) y **cobertura** (3.5x menos workflows). Esto es esperado: PM es un dominio más acotado que software engineering, pero hay oportunidades de expansión legítimas (métricas, retrospectivas, stakeholder management).

---

## Dimensión 2: Protocolos y Tool Calling

**Score: 7.5/10**

### Uso de Agent() — Spawning de Agentes

**Bien hecho:**
- Sintaxis correcta de `Agent()` en los 4 workflows que spawnan agentes
- Patrón de prompt correcto: "First, read {agent file} for your role and instructions" + context tags
- Spawning paralelo cuando hay 2 agentes (`discover-problem.md` líneas 92-155)
- Indicadores visuales de spawning usando `ui-brand.md` patterns

**Gap crítico — subagent_type:**

Todos los 5 spawns usan `subagent_type="general-purpose"`:

| Workflow | Línea | Agente | subagent_type actual | subagent_type recomendado |
|----------|-------|--------|---------------------|--------------------------|
| `discover-problem.md` | 93 | customer-voice | general-purpose | general-purpose (correcto) |
| `discover-problem.md` | 131 | strategic-advisor | general-purpose | general-purpose (correcto) |
| `define-product.md` | 93 | delivery-architect | general-purpose | general-purpose (correcto) |
| `validate-hypothesis.md` | 91 | experiment-designer | general-purpose | general-purpose (correcto) |
| `generate-personas.md` | 58 | persona-architect | general-purpose | **synthetic-persona-generator** |

**Revisión:** Después de analizar los `subagent_type` disponibles del sistema, solo `synthetic-persona-generator` es un match directo. Los demás agentes PM (customer-voice, strategic-advisor, delivery-architect, experiment-designer) no tienen equivalente en los tipos built-in — `general-purpose` es correcto para ellos porque su comportamiento está definido por el archivo `.md` que leen, no por el tipo de agente.

**Score del uso de Agent():** 8/10

### Uso de AskUserQuestion

**Estado actual:**
- Listado en `allowed-tools` de 9/11 comandos
- Usado activamente en solo 3/9 workflows (33%):
  - `strategy-ranking.md` línea 83: para scoring RICE factor por factor
  - `require-stories.md` línea 25: para seleccionar PRD cuando hay múltiples
  - `validate-hypothesis.md` líneas 44, 139: para tipo de experimento y pre-validación con personas

**Puntos donde debería usarse pero no se usa:**
- `discover-problem.md`: Las 5 preguntas Socráticas se hacen inline en vez de con AskUserQuestion estructurado
- `new-product.md`: Las 6 preguntas de setup se hacen inline
- `icp-definition.md`: Las 6 preguntas ICP se hacen inline
- `define-product.md`: Selección de formato (lean/full/one-pager) es inline

**Matiz importante:** El enfoque Socrático (preguntar inline, una a la vez, seguir hilos) tiene ventajas sobre AskUserQuestion rígido. El gap real es en **puntos de decisión binarios** (seleccionar formato, aprobar/rechazar, elegir entre opciones), no en preguntas exploratorias.

**Score del uso de AskUserQuestion:** 6/10

### Uso de TodoWrite / Progress Tracking

**Estado actual: 0% — No hay tracking de progreso por paso en workflows.**

**Investigación realizada:** Se auditó el uso de TodoWrite en GSD, documentación oficial de Anthropic, GitHub issues de Claude Code, y foros de la comunidad.

**Hallazgos clave:**
1. **GSD tampoco usa TodoWrite** — lo lista como `allowed-tool` en 1 archivo pero nunca lo invoca. Usa su propio state management via `gsd-tools.cjs` + banners visuales + STATE.md
2. **TodoWrite no funciona dentro de Agent() spawns** — solo opera en la conversación principal. Los workflows PM spawnan agentes (customer-voice, strategic-advisor, etc.) donde TodoWrite no llegaría
3. **TodoWrite es session-scoped** — se pierde al terminar la conversación. PM necesita persistencia cross-session (ya la tiene via pm-tools.cjs + STATE.md)
4. **Bugs conocidos**: GitHub issues #1173 (updates dentro de Task tool no visibles), #2250 (overwrites toda la lista), #1824 (state compartido entre main y agents causa confusión)
5. **No tiene documentación oficial dedicada** — Anthropic no lo promueve como patrón para skills/workflows

**Decisión: Extender pm-tools.cjs con workflow step tracking, NO adoptar TodoWrite.**

La solución correcta es agregar a `pm-tools.cjs` un sistema de workflow state:
- Registro de pasos por workflow con status (pending/active/done/skipped)
- Funciones: `workflow start`, `workflow advance-step`, `workflow get-progress`
- Persistencia en `.product/STATE.md` (ya existe la infraestructura)
- Datos intermedios por paso (iteración del loop, output de agentes)
- Banners de progreso usando `ui-brand.md` (ya implementados)

| Workflow | Pasos | Qué trackea pm-tools.cjs |
|----------|-------|--------------------------|
| `discover-problem.md` | 9 pasos | 5 capas Socráticas + 2 agent results + synthesis |
| `define-product.md` | 8 pasos | Context sufficiency loop iteration count |
| `generate-personas.md` | 7 pasos | Per-persona generation status |
| `strategy-ranking.md` | 8 pasos | RICE scores + Power scores + ranking |
| `require-stories.md` | 8 pasos | Epic/story count + completeness % |

**Ventajas vs TodoWrite:**
- Funciona dentro y fuera de Agent() spawns (el agente llama a pm-tools.cjs via Bash)
- Persiste cross-session (STATE.md)
- Tiene lógica de negocio (sabe que estás en iteración 2/3 del sufficiency loop)
- Composable con output de agentes
- Control total sobre el formato de progreso

**Score del tracking de progreso:** 5/10 (gap real en visibilidad, pero la base correcta ya existe — falta la capa de workflow steps en pm-tools.cjs)

### @-references y execution_context

**Bien hecho:**
- Todos los 8 comandos thin usan `<execution_context>` con @-references correctas
- Patrón consistente: `@prisma-pm/workflows/{workflow}.md` + `@prisma-pm/skill/rules/philosophy.md` + `@prisma-pm/references/ui-brand.md` + agentes relevantes

**Score de @-references:** 9/10

### YAML Frontmatter en Comandos

**Bien hecho:**
- Los 11 comandos tienen YAML frontmatter válido con `name`, `description`, `allowed-tools`
- 6 comandos usan `argument-hint` para guiar al usuario
- `allowed-tools` es consistente y apropiado por comando

**Score de frontmatter:** 9/10

---

## Dimensión 3: Experiencia de Usuario del PM

**Score: 6.5/10**

### 3.1 Instalación (8/10)

**Proceso:** `npx prisma-pm@latest` → instala en `~/.claude/skills/prisma-pm/`

**Bien:**
- Instalador detecta `--global` vs `--local` automáticamente
- Copia 7 directorios (commands, skill, agents, frameworks, templates, workflows, references)
- Muestra progreso con labels claros
- Maneja re-instalación con `--force`

**Gaps:**
- No menciona que hay que reiniciar Claude Code después de instalar
- No verifica que Claude Code esté instalado antes de proceder
- No muestra un "Getting Started" post-instalación

### 3.2 Primer Uso (6.5/10)

**`pm:help` tiene buena estructura:**
- Muestra los 11 comandos organizados por fase (Foundation → Discovery → Definition → Utility)
- Si `.product/` existe, muestra estado del proyecto
- Si no existe, muestra guía de inicio paso a paso
- Incluye filosofía del producto ("Products are transformation engines")

**Gaps:**
- No hay un "guided first run" interactivo — solo lista de comandos
- No detecta si el usuario es nuevo vs. experimentado
- No ofrece un producto de ejemplo para practicar
- La progresión Foundation → Discovery → Definition no se refuerza durante el uso

### 3.3 Core Workflow (6/10)

**Análisis del flujo Discovery (el más complejo):**

El flujo `/pm:discover "problema"` tiene una secuencia sólida:
1. Anti-pattern check (detecta soluciones disfrazadas de problemas)
2. 5 capas Socráticas (pain → who → frequency → workarounds → transformation)
3. Spawn paralelo de 2 agentes (customer-voice + strategic-advisor)
4. Síntesis en Discovery Brief con JTBD, Power Score, asunciones
5. Checkpoint de revisión (max 3 iteraciones)
6. Update de estado + Next-Up block

**Bien:**
- Anti-pattern check es genuinamente útil
- Estructura de 5 capas es completa y bien ordenada
- Next-Up blocks guían al siguiente paso
- Discovery Brief tiene todos los campos relevantes

**Gaps:**
- **Sin manejo de desviaciones:** Si el PM quiere saltar pasos o cambiar de dirección mid-workflow, no hay mecanismo
- **Sin recovery:** Si el workflow se interrumpe (contexto lleno, error), no hay forma de retomar
- **Sin progress tracking:** El PM no ve en qué paso está de los 9
- **Dependencia de contexto:** Workflows largos pueden superar la ventana de contexto sin advertencia

### 3.4 Error Handling (5/10)

**pm-tools.cjs** usa formato JSON para errores:
```json
{ "error": "No .product/ directory found. Run /pm:new first.", "code": "ERR_NO_WORKSPACE" }
```

**Problemas:**
- **JSON no es PM-friendly:** Un PM no debería ver `{ "error": ... }` — debería ver un mensaje claro con acción sugerida
- **Sin recovery suggestions:** Los errores dicen qué falló pero no cómo solucionarlo (excepto ERR_NO_WORKSPACE)
- **Sin diagnóstico:** `state validate-workspace` reporta válido/inválido pero no dice qué archivo falta específicamente
- **Silent failures:** `safeReadFile()` retorna `null` silenciosamente si un archivo no existe — el workflow continúa con datos incompletos sin advertir al usuario

### 3.5 Template Quality (6/10)

**Los 9 templates definen estructura clara:**
- `product-vision.md` — workspace scaffold
- `discovery-brief.md` — brief de descubrimiento
- `icp-profile.md` — perfil de cliente ideal
- `prd-lean.md`, `prd-full.md`, `prd-one-pager.md` — 3 formatos de PRD
- `user-stories.md` — historias de usuario
- `experiment-brief.md`, `hypothesis-card.md` — validación

**Bien:**
- Frontmatter YAML en cada template
- Secciones bien definidas con placeholders claros
- Comentarios que guían el llenado

**Gaps:**
- **Sin ejemplos reales:** Todos los templates tienen `{placeholder}` pero ninguno tiene un ejemplo completo de cómo se ve llenado
- **Sin variaciones:** Un PRD para B2B SaaS se ve igual que uno para consumer mobile — no hay adaptación por tipo de producto

### 3.6 Agent Quality (5.5/10)

**Los 5 agentes tienen buena estructura pero falta validación:**

| Agente | Líneas | Estructura | Probado en producción |
|--------|--------|-----------|----------------------|
| strategic-advisor | ~450 | 8 secciones completas | No |
| customer-voice | ~500 | JTBD extraction, transformation map | No |
| experiment-designer | ~400 | Decision tree, bias checklist | No |
| delivery-architect | ~500 | Context sufficiency test, edge cases | No |
| persona-architect | ~550 | Diversity check, archetype logic | No |

**Riesgo:** Los agentes están bien diseñados en papel, pero su calidad real depende de cómo Claude los interprete y ejecute. Sin testing con 10+ productos reales, no se puede evaluar si:
- El strategic-advisor realmente desafía asunciones o es complaciente
- El customer-voice extrae JTBD precisos o genéricos
- El experiment-designer diseña experimentos ejecutables o teóricos
- El delivery-architect produce specs implementables o vagas
- El persona-architect genera personas diversas o estereotipadas

---

## Dimensión 4: Generación de Valor y Funcionalidad

**Score: 6.5/10**

### 4.1 Propuesta de Valor Única

**Lo que Prisma PM ofrece que no existe en otro lugar:**

1. **Product Power Formula** (`philosophy.md`) — Framework cuantitativo original: `WTP = ΔState × Emotional Intensity × Problem Frequency` con tiers de interpretación. No existe en libros de PM ni en otros tools.

2. **PM lifecycle como skills de Claude Code** — Nadie más empaqueta el ciclo PM completo (discovery → personas → strategy → definition → requirements) como skills instalables para Claude Code.

3. **Persistencia de estado** — `.product/` directory con BACKLOG.md, STATE.md, DISCOVERY/, DEFINITIONS/, PERSONAS/ mantiene contexto entre sesiones. ChatGPT + templates pierde todo al cerrar la conversación.

4. **Context engineering como skill del PM** — La filosofía de que el PM moderno debe escribir specs self-sufficient para AI implementation es original y relevante.

### 4.2 Cobertura del Ciclo PM

| Stage | Cubierto | Comando | Calidad |
|-------|----------|---------|---------|
| Visión | Sí | `/pm:new` | 7/10 |
| ICP | Sí | `/pm:icp` | 7/10 |
| Personas | Sí | `/pm:persona` | 7/10 |
| Discovery | Sí | `/pm:discover` | 8/10 |
| Scoring | Sí | `/pm:power` | 8/10 |
| Strategy | Sí | `/pm:strategy` | 7/10 |
| Validation | Sí | `/pm:validate` | 7/10 |
| Definition | Sí | `/pm:define` | 7/10 |
| Requirements | Sí | `/pm:require` | 7/10 |
| **Métricas** | **No** | — | Gap |
| **Retrospectiva** | **No** | — | Gap |
| **Stakeholder Mgmt** | **No** | — | Gap |
| **Roadmap** | **No** | — | Gap |

**Cobertura:** 9/13 stages cubiertos (69%). Las 4 faltantes (métricas, retrospectiva, stakeholders, roadmap) son extensiones naturales.

### 4.3 Frameworks de Soporte

| Framework | Archivo | Integración |
|-----------|---------|-------------|
| Product Power Formula | `frameworks/product-power-formula.md` | Central — usado en discovery, strategy, power |
| JTBD | `frameworks/jtbd.md` | Usado en customer-voice agent, discovery |
| RICE | `frameworks/rice.md` | Usado en strategy-ranking |
| Amazon PR/FAQ | `frameworks/amazon-prfaq.md` | Disponible pero no integrado en workflows |
| Opportunity Solution Tree | `frameworks/opportunity-solution-tree.md` | Disponible pero no integrado en workflows |

**Gap:** 2 de 5 frameworks (Amazon PR/FAQ, OST) están documentados pero no tienen workflow ni comando que los use. Son peso muerto.

### 4.4 Diferenciación Competitiva

| Alternativa | Fortaleza | Debilidad vs Prisma PM |
|-------------|-----------|----------------------|
| ChatGPT + templates | Flexible, sin instalación | Sin persistencia, sin workflow, sin state |
| Notion AI + PM templates | Visual, colaborativo | Sin CLI, sin agent spawning, sin Power Formula |
| Linear/Jira + AI features | Tracking robusto | Sin discovery, sin JTBD, sin Socratic questioning |
| ProductBoard | Feedback management | Sin AI-native workflow, sin context engineering |

**Ventaja real:** Prisma PM es el único que combina CLI + AI agents + persistent state + PM methodology. Pero esta ventaja no se comunica claramente en el README ni en la experiencia de primer uso.

---

## Backlog de Mejoras Priorizadas

### P0 — Crítico (scope recomendado para v0.3)

| # | Mejora | Archivos afectados | Esfuerzo |
|---|--------|-------------------|----------|
| 1 | **Agregar workflow step tracking a pm-tools.cjs** — Operaciones `workflow start`, `workflow advance-step`, `workflow get-progress`. Cada workflow registra sus pasos al inicio; pm-tools.cjs trackea progreso con persistencia en STATE.md. NO usar TodoWrite (no funciona en Agent() spawns, es session-scoped, bugs conocidos — ver sección D2) | `bin/pm-tools.cjs`, `workflows/*.md` (9 archivos) | Medio-Alto |
| 2 | **Usar `subagent_type="synthetic-persona-generator"` en generate-personas.md** — Match directo con tipo built-in disponible | `workflows/generate-personas.md` | Bajo |
| 3 | **Usar AskUserQuestion en puntos de decisión binarios** — Formato, aprobación, selección entre opciones. NO en preguntas Socráticas exploratorias | `workflows/define-product.md`, `workflows/new-product.md`, `workflows/icp-definition.md` | Bajo |
| 4 | **Fix error handling en pm-tools.cjs** — Mensajes PM-friendly (no JSON crudo), sugerencias de recovery, diagnóstico específico en validate-workspace | `bin/pm-tools.cjs` | Medio |

### P1 — Importante

| # | Mejora | Archivos afectados | Esfuerzo |
|---|--------|-------------------|----------|
| 5 | **Onboarding interactivo en pm:help** — Detectar primer uso, ofrecer guided tour, producto de ejemplo | `commands/pm/help.md`, nuevo `workflows/onboarding.md` | Alto |
| 6 | **Verificación de existencia de archivos antes de Read en workflows** — Evitar silent failures cuando falta ICP.md o PRODUCT.md | `workflows/*.md` (todos) | Medio |
| 7 | **Ejemplos reales en templates** — Al menos 1 ejemplo completo por template (B2B SaaS ficticio) | `templates/*.md` (9 archivos) | Alto |
| 8 | **Integrar Amazon PR/FAQ y OST en workflows** — Crear comandos o integrar en workflows existentes, o eliminar frameworks no usados | `frameworks/amazon-prfaq.md`, `frameworks/opportunity-solution-tree.md` | Medio |
| 9 | **Context recovery** — Mecanismo para retomar workflows interrumpidos usando STATE.md como checkpoint | `workflows/*.md`, `bin/pm-tools.cjs` | Alto |

### P2 — Nice-to-have

| # | Mejora | Archivos afectados | Esfuerzo |
|---|--------|-------------------|----------|
| 10 | **Stage de Métricas** — `/pm:measure` para definir KPIs y success metrics post-lanzamiento | Nuevo comando + workflow + template | Alto |
| 11 | **Checkpoint tipo `verify`** — Auto-validación (no solo aprobación humana) para calidad de artefactos | `references/ui-brand.md`, workflows | Medio |
| 12 | **Continuation format** — Formato de handoff para context resets mid-workflow | Nuevo `references/continuation.md` | Medio |
| 13 | **Competitive positioning en README** — Tabla clara de PM vs alternativas para el PM que evalúa instalar | `README.md` | Bajo |
| 14 | **Testing con 10+ productos reales** — Validar calidad de outputs de cada agente con productos diversos | Testing manual | Alto |

---

## Recomendación: Roadmap v0.3

**Tema:** "Pulido Operativo" — Hacer que lo que ya existe funcione impecablemente.

**Scope (P0 + P1 selectos):**

1. Workflow step tracking en pm-tools.cjs — operaciones `workflow start/advance-step/get-progress` con persistencia en STATE.md (P0-1)
2. subagent_type corregido en generate-personas (P0-2)
3. AskUserQuestion en decisiones binarias (P0-3)
4. Error handling PM-friendly en pm-tools.cjs (P0-4)
5. Verificación de archivos antes de Read (P1-6)
6. Integrar o eliminar frameworks sin usar (P1-8)

**No incluir en v0.3** (defer a v0.4):
- Onboarding interactivo (P1-5) — requiere diseño de UX más profundo
- Ejemplos reales en templates (P1-7) — requiere producto ficticio completo
- Stage de métricas (P2-10) — nueva funcionalidad, no pulido

**Impacto esperado:**
- Score de Protocolos: 7.5 → 9.0
- Score de UX: 6.5 → 7.5
- Score Global: 6.9 → 7.8

---

## Apéndice: Métricas de Referencia

### Distribución de líneas por capa

| Capa | Archivos | Líneas | % del total |
|------|----------|--------|-------------|
| Comandos | 11 | 543 | 7.4% |
| Workflows | 9 | 2,312 | 31.5% |
| Agentes | 5 | 1,439 | 19.6% |
| Frameworks | 5 | 420 | 5.7% |
| Templates | 9 | 575 | 7.8% |
| Skill rules | 4 | 312 | 4.2% |
| References | 1 | 194 | 2.6% |
| CLI tools | 2 | 956 | 13.0% |
| Otros (README, LICENSE, etc.) | 4 | 598 | 8.1% |
| **Total** | **50** | **7,349** | **100%** |

### Comparación evolutiva

| Métrica | v0.1 | v0.2 | Delta |
|---------|------|------|-------|
| Archivos | 37 | 50 | +35% |
| Líneas | ~3,700 | 7,349 | +99% |
| Arquitectura | 2 capas | 3 capas | Salto cualitativo |
| Comando avg | ~135 | ~49 | -64% (correctamente thin) |
| Workflow layer | 0 | 9 archivos | Nueva capa |
| Agente avg | ~82 | ~288 | +251% |
| pm-tools operaciones | 5 | 10 | +100% |

---

## Meta-Auditoría: Reencuadrando la Evaluación

### El sesgo de la auditoría original

La auditoría D1 comparó PM contra GSD midiendo archivos, líneas, y profundidad de agentes — como si PM necesitara ser un "GSD más chico". Este encuadre es incorrecto.

**GSD orquesta ejecución de código** — operaciones determinísticas, mecánicas, medibles. Necesita 32 workflows porque el software tiene 32+ operaciones distintas (build, test, deploy, verify, debug, refactor, etc.). Sus agentes ejecutan; la profundidad viene de manejar edge cases en código real.

**PM orquesta trabajo cognitivo** — preguntas Socráticas, juicios de valor, decisiones bajo incertidumbre. Necesita menos workflows porque las operaciones cognitivas del PM son fewer but deeper. Sus agentes piensan; la profundidad viene de la calidad de las preguntas, no del volumen de operaciones.

Comparar archivos y líneas entre PM y GSD es como comparar un libro de filosofía con un manual de mecánica por el número de páginas.

### Reevaluación: PM como copiloto cognitivo

#### Valor cognitivo por workflow

| Workflow | Score Cognitivo | Enseñanza Principal |
|----------|----------------|---------------------|
| `validate-hypothesis` | **10/10** | Kill criteria ANTES del experimento — la disciplina más difícil del PM |
| `new-product` | **9/10** | 6 preguntas correctas que fuerzan pensar en transformación, no features |
| `define-product` | **9/10** | Context Sufficiency Test — "¿un AI agent podría implementar esto sin preguntar?" |
| `discover-problem` | **8/10** | 5 capas Socráticas + anti-pattern check (solución disfrazada de problema) |
| `icp-definition` | **8/10** | Disqualification criteria — definir quién NO es tu cliente |
| `strategy-ranking` | **8/10** | Force-rank sin empates — elimina el "todo es P1" |

**Score cognitivo promedio: 8.7/10**

#### Lo que los workflows enseñan (no solo automatizan)

1. **Anti-pattern detection proactiva** — 9 anti-patterns con gates de detección:
   - Solution-first discovery (detecta "build", "create", "dashboard")
   - Feature Factory (features sin transformación)
   - Persona Fiction (demografía sin JTBD)
   - P1 Everything (80%+ items marcados high priority)
   - Building for Everyone (sin disqualification)
   - Context Gap (specs ambiguos para AI)
   - Validation Theater (métricas sin kill criteria)
   - Assumption Blindness (asunciones no identificadas)
   - Premature Commitment (definir antes de descubrir)

2. **Grounding económico en cada decisión** — Todo conecta a Product Power (ΔState × Intensity × Frequency = Willingness to Pay). Un PM que usa este sistema no confunde nice-to-have con viable.

3. **Curva de aprendizaje cognitivo del PM:**
   - **Ciclo 1:** Descubre que transformación > features
   - **Ciclo 2:** Aprende a articular asunciones y diseñar experimentos con kill criteria
   - **Ciclo 3:** Internaliza que context sufficiency = calidad de implementación
   - **Ciclo 4+:** Force-rankea sin comité, define kill criteria upfront, detecta anti-patterns en su propio pensamiento

#### Estructura de `.product/` — Evaluación

```
.product/
├── PRODUCT.md          ← Transformation thesis + Product Power Score
├── ICP.md              ← Behavioral targeting + disqualification
├── BACKLOG.md          ← Force-ranked, no ties
├── STATE.md            ← Living memory (initiatives, learnings, stage)
├── config.json         ← 10-stage lifecycle defined
├── PERSONAS/           ← JTBD-based, not demographic fiction
├── DISCOVERY/          ← Briefs + validation plans
├── DEFINITIONS/        ← Context-engineered PRDs
├── SPRINTS/            ← (scaffolded, sin workflow aún)
├── LAUNCHES/           ← (scaffolded, sin workflow aún)
├── METRICS/            ← (scaffolded, sin workflow aún)
└── RETROS/             ← (scaffolded, sin workflow aún)
```

**Veredicto: 85-90% correcto.**

Fortalezas:
- Transformation-first en cada artefacto
- Product Power Formula como métrica unificadora en todo el sistema
- JTBD integrado en discovery, personas, y PRDs
- 10-stage lifecycle ya definido en config.json
- Force-ranked backlog elimina ambigüedad de priorización
- Assumption tracking con risk levels y validation methods

Gaps legítimos:
- 4 directorios scaffolded pero sin workflows (SPRINTS, LAUNCHES, METRICS, RETROS)
- No hay user-stories template dedicado (el workflow `require-stories` genera pero no persiste formato)
- Discovery → Definition bridge no está documentado (¿cuándo validar vs ir directo a definir?)

### Scores Recalibrados

| Dimensión | Score Original | Score Recalibrado | Cambio | Razón |
|-----------|---------------|-------------------|--------|-------|
| D1: PM vs GSD | 7.0 | **N/A → reemplazado** | — | Comparación incorrecta; PM no necesita ser GSD |
| D1': Cobertura de dominio PM | — | **8.5/10** | Nueva | 9/13 stages cubiertos + estructura correcta |
| D1'': Valor cognitivo | — | **8.7/10** | Nueva | Promedio de scores cognitivos por workflow |
| D2: Protocolos | 7.5 | **7.5** | = | Sin cambio — protocolos son protocolos |
| D3: UX del PM | 6.5 | **7.0** | +0.5 | La UX Socrática ES la UX correcta para PM |
| D4: Valor | 6.5 | **8.0** | +1.5 | Subvalorado: copiloto cognitivo > automatización |
| **Global** | **6.9** | **7.9** | **+1.0** | **Reencuadre: PM como thinking system, no automation** |

### La tesis "10x PM"

La filosofía de PM ya lo articula:

| Actividad | PM Tradicional | PM con Prisma PM | Multiplicador |
|-----------|---------------|-----------------|---------------|
| Síntesis de research | 2-3 semanas | 2-3 horas | **~40x** |
| Validación de hipótesis | 1-2 meses | 1-2 días | **~30x** |
| Escritura de PRD | 1-2 semanas | 1-2 horas | **~40x** |
| Feature specification | 1 semana | 30 minutos | **~80x** |
| Prototype creation | 2-4 semanas | 2-4 horas | **~40x** |

Pero el multiplicador real no es velocidad — es **calidad de pensamiento instalada**:
- Un PM sin Prisma PM que haga discovery rápido sigue haciendo discovery malo rápido
- Un PM con Prisma PM aprende las preguntas correctas, detecta anti-patterns, y produce artefactos context-sufficient
- El compounding effect: cada ciclo mejora al PM, no solo al producto

**El mundo es de product engineers, pero los PMs no tienen los skills.** Prisma PM cierra esa brecha — no reemplazando al PM con AI, sino instalando cognición de producto de clase mundial en cualquier PM que use Claude Code.

### Backlog actualizado post meta-auditoría

Los P0 cambian. "Workflow step tracking" (P0-1 original) ya no es el gap más crítico. Los gaps reales son:

| Prioridad | Mejora | Impacto en 10x PM |
|-----------|--------|-------------------|
| **P0** | Testing real con 10+ productos (antes era P1-9) | Sin validación, todo es teórico |
| **P0** | Error handling PM-friendly (se mantiene) | PMs no-técnicos abandonan ante JSON errors |
| **P0** | Onboarding de primer uso (antes era P1-5) | Sin guided start, el PM no sabe por dónde empezar |
| **P1** | Workflow step tracking en pm-tools.cjs (baja de P0) | Mejora UX pero no bloquea uso |
| **P1** | Bridge discovery → definition documentado | Evita saltar validación |
| **P1** | Ejemplos reales en templates | Reduce curva de aprendizaje |
| **P2** | Post-definition workflows (SPRINTS, LAUNCHES, METRICS, RETROS) | Extensión natural del lifecycle |
| **P2** | Integrar o eliminar frameworks sin usar | Elimina peso muerto |
