# Análisis de alineación con el temario del máster

Este documento recoge una revisión deliberada del proyecto contra el contenido real del máster — no solo "aplicar buenas prácticas generales", sino contrastar el código y la documentación existentes contra lecciones concretas del temario, lección por lección, para encontrar huecos reales antes de que los encontrara un evaluador.

## Metodología

El 2026-08-08, tras 5 capítulos ya construidos, se lanzaron 4 revisiones en paralelo (una por módulo), cada una leyendo en profundidad el contenido del módulo asignado y contrastándolo contra el estado real del repositorio (`README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/reglas-de-negocio.md`, `docs/guion-tfm.md`, y el código en `src/`/`api/`):

| Módulo | PDFs revisados | Enfoque |
|---|---|---|
| Módulo 1 — Ingeniería del Software | 64 | Ciclo de vida, análisis de requisitos, paradigmas, SOLID/principios de diseño, Spec Driven Development |
| Módulo 2 — Arquitectura de software | 74 | Estilos arquitectónicos, Clean Architecture con TypeScript, arquitecturas distribuidas |
| Módulo 6 — Calidad | 52 (+1 ya leída antes) | Testing, code smells/refactor, métricas/coverage, observabilidad, seguridad, documentación, usabilidad |
| Módulo 9 — Seguridad | 78 | Desarrollo seguro, OWASP Top 10 (2021 y 2025), codificación segura |

**268 PDFs en total.** Para las lecciones puramente introductorias/de presentación se hizo una pasada ligera (título + puntos clave); para las lecciones con ejercicios, checklists o código se leyó en profundidad completa. Cada hallazgo se clasificó como:

- ✅ **Ya aplicado** — el proyecto ya lo cumplía antes de leer la lección.
- ❌ **Hueco real, aplicado** — se corrigió tras el análisis (ver capítulo correspondiente en `docs/guion-tfm.md`).
- ⏳ **Pendiente / aplicable en un capítulo futuro** — documentado en `CLAUDE.md`/`AGENTS.md` o en `docs/reglas-de-negocio.md` para no perderse.
- ➖ **No relevante** — la práctica no aplica a este proyecto (justificado caso por caso, casi siempre porque es una SPA sin backend real).

## Hallazgos aplicados (❌ → resuelto)

| Hallazgo | Módulo de origen | Dónde se resolvió |
|---|---|---|
| Umbrales de coverage no exigidos automáticamente | 6 (Testing/Métricas) | `vite.config.ts` — `coverage.thresholds` (100% funciones, 80% resto) |
| Orden de la cascada de descuentos incorrecto en la documentación | (hallado al leer la lección de Testing, no específico de un módulo) | `docs/reglas-de-negocio.md` §2, antes de escribir el capítulo 2 |
| Regla "adulto" para el cargador gratuito ambigua | 1 (Spec Driven Development — detección de ambigüedad como práctica) | `docs/reglas-de-negocio.md` §4, corregida a mitad del capítulo 3 |
| Especificación de seguridad del PIN incompleta | 6 y 9 (coincidentes de forma independiente) | `docs/reglas-de-negocio.md` §6, antes de escribir el capítulo 5 |
| `.oxlintrc.json` sobrescrito accidentalmente por una herramienta de inspección | — (incidente operativo durante la propia revisión) | Restaurado y verificado con `git diff` |
| Warning de lint por exportar componente + hook en el mismo archivo (`react/only-export-components`) | 6/10 (patrón ya usado en el proyecto de referencia) | `AgentSessionContext` dividido en 3 archivos, capítulo 5 |
| Requisito de diseño del capítulo 6 no detectado a tiempo (catálogo importado como constante fija, no parametrizable) | 1 (DIP) | `docs/reglas-de-negocio.md` §7 y `CLAUDE.md`, antes de empezar el capítulo 6 |

## Deuda técnica pendiente (⏳ — ver `CLAUDE.md` §"Deuda técnica conocida")

1. Violación de OCP en `calculateQuote.ts` (caso especial de `referral`) — solución ya redactada (Módulo 1, patrón Strategy con funciones).
2. Sin Architecture Decision Records (`docs/adr/`) — señalado independientemente por Módulo 1, Módulo 2 y Módulo 6.
3. Sin alias de rutas TypeScript (`@shared/*`, `@features/*`) — Módulo 2.
4. Sin sección de Requisitos No Funcionales en `docs/reglas-de-negocio.md` — Módulo 1.

## Otros hallazgos ⏳ relevantes para capítulos futuros

- **Capítulo 6 (tarifas):** patrón repositorio/adaptador para `localStorage` en vez de acceso directo (Módulo 2); validar la forma de los datos leídos de `localStorage` antes de usarlos, por si están corruptos o manipulados (Módulo 9, equivalente a validación de entrada).
- **Capítulo 7 (Excel):** protección contra *CSV/Excel Formula Injection* — si un valor introducido por el usuario empieza por `=`, `+`, `-` o `@`, Excel puede interpretarlo como fórmula al abrirlo (Módulo 9).
- **Capítulo 8 (despliegue):** cabeceras de seguridad HTTP vía `vercel.json` (`X-Frame-Options`, `Content-Security-Policy`, etc.) (Módulo 9); `pnpm audit` / escaneo de dependencias (Módulo 6 y 9); justificación explícita de "TDD exhaustivo en vez de Sentry" apoyada en el propio framework "Testear vs. Observar" del Módulo 6 (el proyecto cae de lleno en la zona "testear mucho": cálculos de dinero, reglas estables, sin usuarios externos que observar).
- **Testing de integración (capítulo 4, ya construido):** query hierarchy de Testing Library (`getByRole` > `getByLabelText` > `getByText` > `getByTestId`) y `userEvent` en vez de `fireEvent` — verificado que ya se siguió este patrón en los componentes del capítulo 4 sin haberlo indicado explícitamente antes de construirlos.

## Lo descartado explícitamente (➖), y por qué

- **Arquitecturas distribuidas, microservicios, Event-Driven Architecture, Sagas** (Módulo 2, Módulo 4 completo) — el proyecto es una SPA cliente con una única función serverless sin estado compartido; no hay red de servicios que coordinar.
- **Sentry / observabilidad de producción completa** (Módulo 6) — sin tráfico real ni guardia 24/7; el propio temario señala esto como un caso legítimo de exclusión.
- **SQL Injection, gestión de sesiones de servidor, MFA, SSRF** (Módulo 9) — requieren backend con estado y base de datos, que este proyecto no tiene.
- **Storybook, OpenAPI/Swagger completo** (Módulo 6) — sobredimensionado para ~10 componentes y un único endpoint.
- **Strategy/Factory/Observer forzados** donde un array de datos ya resuelve el problema (Módulo 1 y 2, citando explícitamente el propio temario: *"no usar patrones por usar patrones"*).

## Nota metodológica

Este análisis no sustituye la lectura completa del temario — es una revisión dirigida por lo que el proyecto necesitaba en el momento de hacerla (capítulos 1-5 ya construidos). Los módulos no cubiertos aquí (3, 4 completo, 5, 7, 8, 10, 11) se revisarán si surge una necesidad concreta que los haga relevantes, siguiendo el mismo criterio: profundidad donde hay algo accionable, pasada ligera donde es solo contexto.
