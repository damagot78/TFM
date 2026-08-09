# Guión y argumentario del TFM — decisiones y por qué

Este documento es el hilo conductor para explicar el proyecto en el vídeo y en las slides del TFM. No es un changelog técnico (para eso está el historial de git y el README) — es el **razonamiento detrás de cada decisión importante**, para poder defenderlas con seguridad. Se actualiza al cerrar cada capítulo.

---

## 0. Preparación (antes de escribir una sola línea de código)

### El problema

Arabella Golf Mallorca (el club de golf donde trabajo) calcula las cuotas de abonado de forma manual: 18 modalidades de abono, hasta 3 descuentos combinables en cascada con una matriz de incompatibilidades, extras con exclusividad de grupo, y distintos modos de pago. Esa complejidad produce tres problemas concretos y medibles:

1. **Errores de cálculo** en los presupuestos.
2. **Tiempos de resolución altos** por cotización.
3. **Curva de aprendizaje elevada** para personal nuevo, que tarda en dominar todas las combinaciones.

*Cómo contarlo en el vídeo:* no es un problema inventado para el TFM — es un problema real de mi trabajo, y por eso lo elegí entre varias ideas que barajé (evaluamos también una herramienta de revisión de PRs con IA, un gestor de gastos, un coach de estudio con RAG, una app de control de cromos y un gestor de libros — esta fue la que mejor combinaba valor real, alcance controlable para un primer proyecto, y ausencia de riesgo de datos sensibles).

### La solución propuesta

Una calculadora **guiada y explicada**: no solo devuelve el importe final, también muestra qué regla se ha aplicado y por qué. Esto es deliberado — un cálculo "a secas" solo atacaría errores y tiempos, pero mostrar el razonamiento también ataca la curva de aprendizaje, que es la tercera causa del problema original.

### Fuentes de los requisitos

Los requisitos de negocio (tarifas, descuentos, extras, edades) se extrajeron de la documentación oficial de Arabella Golf Mallorca, publicada online:

- [Tarifas Membresías 2026](https://arabellagolfmallorca.com/wp-content/uploads/2026/01/Members_2026_rev_QR.pdf)
- [Derechos y Obligaciones del Abonado 2026](https://arabellagolfmallorca.com/wp-content/uploads/2026/04/Derechos_y_obligaciones_del_abonado_2026-ES_04.pdf)

La especificación completa y estructurada de estas reglas está en [`docs/reglas-de-negocio.md`](./reglas-de-negocio.md), que es el documento de referencia para todo el desarrollo (equivalente a un documento de análisis de requisitos, Módulo 1 del máster).

### Por qué "construido desde cero"

**El código de este proyecto se ha escrito desde cero**, aplicando la metodología completa del máster (TDD, arquitectura, tests, documentación, seguridad) a partir del análisis de la documentación oficial. No parte de ningún código previo.

*Cómo contarlo en el vídeo:* el punto de partida fue el análisis del problema y de las tarifas/normativa oficiales (Módulo 1 — Análisis de Requisitos), y desde ahí se construyó todo siguiendo TDD capítulo a capítulo.

### Sobre el diseño de interfaz

El diseño de interfaz (secciones: datos del abonado, modalidad, descuentos, extras, pago, resumen) sigue un flujo pensado para cómo un usuario real completaría esta tarea paso a paso, priorizando claridad sobre originalidad visual — el valor de este proyecto está en la lógica de negocio y la calidad de ingeniería, no en el diseño gráfico.

### Alcance v1 y priorización

Con el plazo real de entrega y siendo mi primer proyecto de programación, definimos un alcance v1 defendible en vez de intentarlo todo:

**Incluido en v1:** motor de cuota + cascada de descuentos + validación de edad + extras con exclusividad de grupo, un solo modo de pago (anual), solo español, identificación de personal por PIN, exportación a Excel, actualizador de precios.

**Fuera de v1, como roadmap priorizado** (se añadiría en este orden si sobra tiempo, se recorta desde el final si no): pago fraccionado/temporal → firma digital → multi-idioma → PDF imprimible → multi-abonado.

*Cómo contarlo en el vídeo:* esto es una decisión de **priorización de producto**, no una limitación técnica — cada una de esas funcionalidades es viable, pero construirlas con tests y buena arquitectura desde cero tiene un coste real, y prefería entregar un núcleo completo y bien hecho antes que muchas funcionalidades a medias. Es una decisión que se puede defender con criterio de ingeniería (MoSCoW / priorización de requisitos, Módulo 1).

### Decisión de seguridad: identificación de personal

El PIN de cada agente **no se valida en el cliente** — aunque es solo una herramienta de uso interno, un PIN comparado en el navegador es visible para cualquiera que inspeccione el código de la app desplegada. Se valida en una única función serverless (`api/validate-pin.ts`), con los PIN en variables de entorno de servidor, nunca expuestas al navegador. El resto de la aplicación sigue siendo 100% cliente (sin backend).

*Cómo contarlo en el vídeo:* es una aplicación directa de una lección de seguridad del Módulo 9 (OWASP): no confiar nunca en el cliente para datos que deben protegerse, incluso en herramientas "internas".

### Metodología de trabajo con IA

El desarrollo se hace con Claude Code, con un reparto de roles explícito: yo dirijo (requisitos, prioridades, verificación de que cada capítulo funciona), la IA escribe el código bajo esa dirección, explicando cada decisión para que yo la entienda y la pueda defender. Esto no es "dejar que la IA lo haga todo" — es exactamente la metodología que enseña el propio máster (Módulos 4, 5 y 10), reflejada también en cómo el profesor documenta su propio proyecto de referencia.

---

## 1. Capítulo 1 — Setup del proyecto

### Stack elegido

- **Vite 8 + React 19 + TypeScript** — plantilla oficial `react-ts`.
- **Tailwind CSS v4** vía `@tailwindcss/vite` — la v4 elimina `tailwind.config.js` y `postcss.config.js`; se configura con una sola línea (`@import "tailwindcss";`) y el plugin de Vite. Un archivo de configuración menos que mantener.
- **Vitest 4 + jsdom + Testing Library** (`@testing-library/react`, `jest-dom`, `user-event`) + `@vitest/coverage-v8` para cobertura.
- **oxlint** como linter — viene por defecto en el scaffold moderno de Vite, más rápido que ESLint y sin configuración adicional.

### Decisiones a poder defender

- **Tailwind v4 en vez de v3:** menos archivos de configuración, setup más simple.
- **Sin `globals: true` en Vitest:** los tests importan `describe/it/expect` explícitamente de `vitest` — más explícito, evita tener que tocar `tsconfig` para tipar globals.
- **`api/validate-pin.ts` no se crea todavía:** pertenece al capítulo 5 (identificación de personal); en este capítulo solo se documenta su ubicación futura.
- **Test de humo (`src/App.test.tsx`):** verifica que Vitest + Testing Library + jsdom funcionan de extremo a extremo. No es lógica de negocio, así que no sigue TDD estricto (el TDD "de verdad" empieza en el capítulo 2, con el motor de cálculo).

### Estructura de carpetas (Scope Rule)

```
src/shared/{types,utils,constants,strategies,hooks,components}/   # usado por 2+ features
src/features/{quote-calculator,staff-identification,tariff-admin,excel-export}/  # específico de una feature
src/context/
src/test/setup.ts
```

*Cómo contarlo en el vídeo:* la organización no es por tipo técnico de archivo, sino por a quién pertenece cada pieza de código (Scope Rule) — si algo se usa en 2+ funcionalidades va a `shared/`, si es específico de una sola, se queda local en su `features/`. Esto hace que la estructura "grite" lo que hace la aplicación con solo mirar las carpetas.

### Verificación

`pnpm lint`, `pnpm test:run` y `pnpm build` verificados en verde (independientemente, no solo por el propio proceso que los ejecutó).

---

## 2. Capítulo 2 — Motor de cuota base y cascada de descuentos

### Qué se construyó

Dos piezas de lógica de negocio, cada una con su propio ciclo TDD (rojo → verde → refactor), verificadas contra [`docs/reglas-de-negocio.md`](./reglas-de-negocio.md):

1. **`calculateQuote`** — el motor de cascada de descuentos: recibe una modalidad y una lista de descuentos ya seleccionados, valida que la combinación sea legal (máximo 3 descuentos, restricción de categoría Premium/No-Premium, matriz de incompatibilidades) y aplica cada descuento en el orden fijo de la cascada, no en el orden en que se seleccionaron.
2. **`calculateMonthlyPremiumPrice`** — la calculadora de precio de la modalidad `monthly_premium`, que se cobra mes a mes según temporada (alta/estándar) en vez de con una tarifa anual fija.

*Cómo contarlo en el vídeo:* aquí empieza el TDD "de verdad" del proyecto — cada función se escribió primero como un test que fallaba, y solo después el código mínimo para pasarlo (Módulo 4 del máster).

### Por qué dos motores separados, no uno

`monthly_premium` es la única modalidad de categoría `Monthly`, y la especificación dice explícitamente que esa categoría **no admite ningún descuento**. Meter su lógica de temporada dentro del motor de cascada habría acoplado dos algoritmos que no comparten ni datos ni reglas: uno reparte un precio fijo entre hasta 3 descuentos porcentuales encadenados, el otro decide qué tarifa mensual aplica según en qué mes natural cae cada mes contratado. Separarlos en dos funciones puras, cada una con su propio archivo y sus propios tests, evita una función con dos responsabilidades y hace que cada una se pueda leer, testear y defender de forma independiente.

### El test dorado (golden test) del motor de cascada

La especificación incluye un caso ya validado con datos reales: abono `sm` (4.400 €) con Lunes a Viernes (15%) + Abono Tarde (25%) + Familiar (10%) debe dar exactamente **2.524,50 €**. Ese caso se escribió como el primer test del motor — si la implementación no reproduce esos números exactos, hay un error de orden o de lógica en la cascada, no solo un test que falla.

*Cómo contarlo en el vídeo:* usar un caso de negocio real y ya verificado como primer test (en vez de inventar un ejemplo) da mucha más confianza de que el motor calcula lo que el club realmente cobra, no solo lo que "parece correcto".

### Decisiones a poder defender

- **Redondeo a 2 decimales en cada paso de la cascada** (`shared/utils/money.ts`, `roundCurrency`): sin este redondeo, algunos porcentajes producen errores de punto flotante que se arrastran y crecen paso a paso (p. ej. `0.1 + 0.2` no da `0.3` exacto en JavaScript). Redondear tras cada paso, igual que hace la tabla de referencia de la especificación, evita ese arrastre. Se extrajo a `shared/` porque la usan ambos motores de este capítulo, y la usará también el módulo de extras en el capítulo 3.
- **Resultado como `{ success: true, ... } | { success: false, errors: string[] }` en vez de lanzar excepciones:** una combinación de descuentos inválida (más de 3, incompatibles, restringida por categoría) es un resultado esperado del negocio, no un fallo del programa. Modelarlo como un tipo de retorno explícito obliga a quien llama a la función a manejar ambos casos en tiempo de compilación, y le da a la futura UI (capítulo 4) el motivo exacto para mostrárselo al agente.
- **`referral` con base de cálculo externa:** es el único descuento de los 10 cuyo porcentaje no se aplica sobre el subtotal de la propia cuota, sino sobre el importe contratado por la persona referida. El motor acepta un parámetro opcional `referralAmount`; si `referral` está seleccionado sin ese importe, o con un importe no positivo, el cálculo se rechaza explícitamente en vez de asumir un valor por defecto silencioso.
- **`monthly_premium` sin precio fijo en el catálogo (`price: null`):** en vez de inventarle un precio anual representativo (que induciría a error si alguien lo usa sin darse cuenta), el motor de cascada rechaza explícitamente cualquier intento de calcularlo, señalando que debe usarse `calculateMonthlyPremiumPrice`. Es una barrera de diseño, no solo una validación: hace imposible mezclar los dos algoritmos por error.
- **Cálculo de temporada sin aritmética real de fechas:** para saber si un "mes contratado" cae limpio en un mes natural o cruza dos, solo hace falta saber en qué mes(es) del año cae, no la fecha exacta de fin — así se evita usar `Date` para sumar meses, que en JavaScript normaliza mal los días de fin de mes (p. ej. "31 de enero + 1 mes" no da un 31 de febrero, que no existe).
- **Cruces de temporada con tarifas distintas sin regla automática:** la especificación es explícita en que esto es una decisión humana del agente, no un algoritmo de días. El motor modela ese caso como `success: false` con un mensaje claro; la UI del capítulo 4 lo convertirá en un selector para el agente, y el motor vuelve a llamarse con la elección ya indicada.

### Verificación

`pnpm lint`, `pnpm test:run` (21 tests: 12 del motor de cascada + 8 de `monthly_premium` + 1 de humo del capítulo 1) y `pnpm build` verificados en verde.

---

## 3. Capítulo 3 — Validación de edad y extras con exclusividad de grupo

### Qué se construyó

Tres piezas más de lógica de negocio, cada una con su propio ciclo TDD, separadas del motor de cascada del capítulo 2:

1. **`calculateAge`** — edad en años cumplidos a partir de la fecha de nacimiento y una fecha de referencia.
2. **`ageEligibility`** (`isDiscountEligibleByAge`, `filterDiscountsEligibleByAge`, `isAdult`) — qué descuentos de la cascada son elegibles según la edad del abonado, y la regla de "adulto" para beneficios como el cargador eléctrico gratuito.
3. **`calculateExtras`** — el motor de extras: exclusividad de grupo (`storage`, `buggy`), restricciones por modalidad y por edad, y las gratuidades (Buggy anual incluido en ciertas modalidades, cargador gratis en Premium para adultos).

*Cómo contarlo en el vídeo:* el capítulo 2 dejó dicho explícitamente que el motor de cascada "no filtra por edad todavía" — este capítulo cierra ese hueco con un módulo de edad independiente, y añade el segundo bloque de precio de la cotización (los extras), que hasta ahora no existía.

### Por qué la edad es un módulo aparte del motor de cascada

El motor de cascada (capítulo 2) recibe una lista de descuentos ya elegibles y solo se ocupa de aplicarlos en el orden correcto. Decidir *qué* descuentos son elegibles según la edad del abonado es una responsabilidad distinta — un filtro que se ejecuta antes, para construir las opciones que se le ofrecen al agente en la UI (capítulo 4). Mantenerlas separadas evita una función que mezcle "qué se puede elegir" con "cómo se calcula lo elegido", y permite testear cada regla de forma aislada.

### Una regla de negocio que cambió a mitad de capítulo: "adulto" para el cargador gratuito

La especificación original decía "Adulto (≥18 años, o sin descuento infantil/junior activo)", una redacción que admitía dos lecturas incompatibles (¿"o" como alternativa real, o como aclaración?). Antes de implementarlo se preguntó explícitamente y se corrigió la especificación con la regla real: **si se conoce la fecha de nacimiento, la edad manda siempre** (18+ es adulto, por debajo no, sin excepciones); **solo cuando no se conoce la fecha de nacimiento** se usa el descuento Niño/Junior activo como indicio para presumir la edad. Un abonado de 15 años sin descuento infantil seleccionado sigue sin ser adulto.

*Cómo contarlo en el vídeo:* este es un ejemplo concreto de por qué el TDD y el trabajo dirigido con IA no significan "aceptar la primera interpretación razonable" — una regla de negocio ambigua se detectó al leer la especificación con la intención de escribir un test para ella, se preguntó antes de asumir, y el documento de reglas de negocio se corrigió como fuente de verdad antes de tocar código (Módulo 1: la especificación manda, no se inventan variantes).

### Decisiones a poder defender

- **`sub25` sin edad mínima:** la tabla de descuentos dice "hasta 25 años" sin fijar un suelo, así que se implementó literalmente como un tope máximo sin mínimo, en vez de asumir un límite inferior no especificado (p. ej. 18). Esto significa que, por edad, un niño de 10 años es elegible tanto para `child` como para `sub25` a la vez — no es una contradicción, porque la matriz de incompatibilidades del capítulo 2 ya impide seleccionar ambos a la vez; el filtro de edad solo decide qué se *ofrece*, no qué combinación final es válida.
- **Edad desconocida (`null`) falla cerrado para descuentos con rango de edad:** si no se conoce la fecha de nacimiento, ningún descuento con restricción de edad se considera elegible (en vez de asumirlo permitido). Es una decisión de seguridad de negocio: sin dato, no se aplica un descuento que depende de un dato que no se tiene.
- **Extras de Buggy bloqueados con edad desconocida:** misma lógica que el punto anterior — la regla "menores de 16 no pueden usar Buggy" solo se puede verificar si se conoce la edad, así que sin fecha de nacimiento el extra se rechaza en vez de permitirse por defecto.
- **`getDiscountOrThrow` extraído a `discountCatalog.ts`:** al escribir el segundo módulo que necesitaba buscar un descuento por ID (`ageEligibility.ts`, además de `calculateQuote.ts`) apareció código duplicado; se extrajo a un archivo compartido dentro de la propia feature `quote-calculator` en vez de copiarlo, sin necesidad de subirlo a `shared/` porque de momento solo lo usa esta feature.
- **El cargador eléctrico sigue siendo un extra seleccionable, no algo "automático":** en vez de añadirlo solo a las modalidades Premium sin que el agente lo pida, se modela como cualquier otro extra pero con precio 0 € cuando se cumplen las condiciones (Premium + adulto). Mantiene una única forma de seleccionar extras en toda la aplicación, en vez de un caso especial en la UI.

### Verificación

`pnpm lint`, `pnpm test:run` (55 tests: 34 nuevos de este capítulo — 4 de `calculateAge`, 12 de elegibilidad por edad, 18 de extras — más los 21 de capítulos anteriores) y `pnpm build` verificados en verde.

---

## 4. Capítulo 4 — UI del formulario y resumen

### Qué se construyó

La interfaz completa sobre los tres motores ya construidos (capítulos 2-3), sin backend: datos del abonado, modalidad de abono (con el selector de mes/temporada para `monthly_premium`), descuentos, extras y un resumen que explica cada paso de la cascada. Se dividió en un hook central (`useQuoteForm`) más seis componentes de presentación, cada uno con sus propios tests de Testing Library.

*Cómo contarlo en el vídeo:* este capítulo no añade lógica de negocio nueva — conecta la ya construida y testeada en los capítulos 2-3 con una interfaz real. Es la diferencia entre "el motor calcula bien" (demostrado con 96 tests unitarios) y "un agente puede usarlo" (demostrado aquí).

### El diseño no venía de un archivo, sino de una descripción funcional

A diferencia de lo que decían `README.md`/`CLAUDE.md` ("la interfaz reutiliza un diseño ya validado"), no había ningún archivo de diseño en el repositorio para este capítulo. Antes de escribir un solo componente se preguntó explícitamente cómo se iba a recibir ese diseño; la respuesta fue una descripción funcional detallada, sección por sección, en vez de una captura o un Figma. La interfaz de este capítulo se construyó a partir de esa descripción, priorizando claridad funcional sobre diseño visual elaborado, tal como se pidió.

*Cómo contarlo en el vídeo:* es un ejemplo de que "dirigir" no siempre significa aportar un artefacto (una imagen, un enlace) — una descripción funcional precisa es una entrada válida y suficiente para construir una interfaz coherente, siempre que sea el alumno quien la defina.

### Arquitectura: un hook central, componentes tontos

`useQuoteForm` concentra todo el estado del formulario (datos del abonado, modalidad, descuentos, extras) y las llamadas a los tres motores (`calculateQuote`, `calculateMonthlyPremiumPrice`, `calculateExtras`), devolviendo un único objeto con el estado derivado y las acciones. Los seis componentes (`SubscriberDataSection`, `ModalitySelector`, `MonthlyPremiumPicker`, `DiscountsSection`, `ExtrasSection`, `QuoteSummary`) no llaman a ningún motor directamente — reciben datos y funciones por props y solo renderizan. Esto permite testear la lógica de orquestación una vez (con `renderHook`) en vez de reproducirla en cada componente, y cada componente se puede testear con datos de prueba simples sin depender de los motores reales.

### Dos piezas de lógica nuevas, extraídas para no duplicar reglas ya testeadas

La UI necesita saber, antes de que el agente intente guardar la cotización, qué opciones mostrar habilitadas o deshabilitadas — y esa información no la daban los motores del capítulo 2-3 tal cual, que solo validan una selección ya hecha:

- **`getEligibleDiscounts(modalidad, edad)`** combina la restricción de categoría (ya existente en `calculateQuote`) con el filtro de edad (capítulo 3) para decidir qué descuentos ofrecer como checkbox activo.
- **`getBlockingSelections` / `getBlockingGroupSelection`** exponen, para un descuento o extra candidato, cuáles de los ya seleccionados lo bloquean por incompatibilidad o por grupo de exclusividad.

En los tres casos, la regla original no se reescribió: se extrajo del motor existente (`calculateQuote.ts`, `calculateExtras.ts`) a una función pura reutilizable, y el motor se refactorizó para usar esa misma función en vez de tener la regla duplicada en dos sitios. Los tests de los capítulos 2-3 se mantuvieron en verde durante todo el refactor, confirmando que el comportamiento no cambió.

### Un caso real de "hay que ver la app funcionando, no solo los tests en verde"

Al escribir el primer test de un componente con varias renderizaciones en el mismo archivo, uno de los tests fallaba de una forma que no tenía sentido a primera vista (un campo de fecha no disparaba su evento). La causa: sin `globals: true` en Vitest (decisión del capítulo 1), Testing Library no limpia el DOM automáticamente entre tests — hace falta registrar `afterEach(cleanup)` explícitamente. Sin ese registro, cada test de un archivo con varias renderizaciones acumula el DOM del test anterior, y una consulta por texto puede encontrar un elemento "fantasma" de otro test. Se corrigió una vez en `src/test/setup.ts`, y afecta a todos los tests de componentes futuros.

*Cómo contarlo en el vídeo:* es un recordatorio de por qué "los tests están en verde" no basta como criterio de cierre — hubo que abrir la app en un navegador real (Playwright headless, sin backend) y reproducir a mano el caso dorado y el cruce de temporada de `monthly_premium` para confirmar que la aplicación, no solo cada pieza por separado, se comporta como se diseñó.

### Decisiones a poder defender

- **Selects nativos en vez de componentes de UI a medida** para modalidad y meses: son accesibles por defecto, no requieren una librería adicional, y encajan con "priorizar claridad funcional" para una herramienta interna.
- **Checkboxes deshabilitados con motivo visible, no ocultos:** un descuento no elegible (por edad, categoría, incompatibilidad o límite de 3) se muestra deshabilitado con el motivo en texto, en vez de desaparecer de la lista. El agente ve el catálogo completo y entiende por qué algo no está disponible, en línea con la propuesta de valor "guiada y explicada" del proyecto.
- **`monthly_premium` no muestra la sección de descuentos:** la especificación dice que esta categoría no admite ningún descuento (capítulo 2), así que la UI ni siquiera ofrece la sección, en vez de mostrarla vacía o deshabilitada.
- **El resumen desglosa cada paso de la cascada con su base, no solo el resultado final:** "Lunes a Viernes (15% sobre 4.400,00 €) −660,00 €" en vez de solo el descuento final. Es la parte de la interfaz que más directamente ataca el problema original del proyecto (errores y curva de aprendizaje) — el agente ve el razonamiento, no solo el número.
- **Cobertura de tests al 100% en funciones** (umbral ya configurado en `vite.config.ts`): se usó para encontrar ramas sin testear que el ojo no detecta a simple vista (p. ej. la rama "elección manual ya guardada" del selector de temporada, o el rechazo de una modalidad desconocida), no como objetivo en sí mismo.

### Verificación

`pnpm lint`, `pnpm test:run` (130 tests: 75 nuevos de este capítulo) y `pnpm build` verificados en verde. Cobertura: 100% funciones/líneas/statements, 99,5% ramas (umbral 80%). Probado además en un navegador real (Chromium headless vía Playwright, sin backend): caso dorado completo con un extra añadido, y el cruce de temporada de `monthly_premium` resuelto manualmente — sin errores de consola inesperados.

---

## 5. Capítulo 5 — Identificación de personal (PIN) y función serverless

### Qué se construyó

La primera pieza de backend del proyecto: `api/validate-pin.ts`, una función serverless de Vercel que valida el PIN de un agente sin exponer nunca esa lógica al cliente, más la pantalla de identificación y el "gate" que bloquea el acceso a la calculadora hasta que un agente se identifica. Es el único punto del proyecto con lógica de seguridad real (Módulos 6 y 9 del máster), y se trató con el mismo rigor TDD que el resto: la lógica pura del endpoint (validación de payload, comparación de PIN) se escribió y testeó antes que el propio endpoint HTTP.

*Cómo contarlo en el vídeo:* hasta este capítulo todo el proyecto era 100% cliente. Aquí se cruza una frontera de confianza real —datos que nunca deben llegar al navegador— y eso cambia las reglas: ya no basta con que la lógica sea correcta, tiene que ser además imposible de eludir desde fuera.

### La especificación de seguridad no la inventó el asistente

Antes de escribir una sola línea de este capítulo, `docs/reglas-de-negocio.md` se amplió con una especificación de seguridad completa y explícita para el endpoint (§6): contrato exacto de petición/respuesta, ocho reglas obligatorias (solo POST, validar forma antes de comparar, `timingSafeEqual`, mensajes de error genéricos, nunca loguear el PIN, fail secure, CORS restrictivo, PIN solo en variables de entorno de servidor), y una decisión de alcance ya razonada sobre rate limiting. El trabajo de este capítulo fue implementar esa especificación fielmente y detectar sus consecuencias no obvias, no diseñar la política de seguridad desde cero.

*Cómo contarlo en el vídeo:* en un proyecto real, la política de seguridad de un endpoint de autenticación no es algo que se improvisa mientras se programa — se decide antes, con las reglas escritas, y el código se audita contra esas reglas. Aquí se siguió ese mismo orden.

### Un fallo de diseño propio, encontrado antes de escribir el endpoint

La regla 4 de la especificación es explícita: un PIN incorrecto y un `agentId` inexistente deben dar **la misma respuesta** (401, mismo mensaje) — si no, alguien podría enumerar qué agentes existen probando IDs y mirando si cambia el código de estado o el mensaje. La primera versión de `parseValidatePinPayload` rechazaba directamente un `agentId` que no estuviera en el catálogo, lo que habría producido un 400 para "agente inexistente" y un 401 para "PIN incorrecto" — exactamente la distinción que la regla prohíbe. Se detectó al releer la especificación con la función ya escrita, antes de llegar al endpoint, y se corrigió moviendo esa comprobación a `isPinValid` (que ya tenía que ser indistinguible por diseño).

*Cómo contarlo en el vídeo:* es un ejemplo concreto de por qué conviene volver a leer la especificación de seguridad contra el propio código antes de dar un módulo por cerrado — el fallo no estaba en la lógica de negocio (la función hacía exactamente lo que parecía razonable), estaba en una interacción entre dos reglas de seguridad distintas que solo se ve si se comprueban juntas.

### Decisiones a poder defender

- **`Request`/`Response` estándar en vez de `@vercel/node`:** el handler se escribe con la API Fetch nativa (`export default function handler(request: Request): Promise<Response>`), no con los tipos `VercelRequest`/`VercelResponse`. Evita una dependencia adicional, y permite testear el endpoint construyendo un `Request` real en Vitest, sin mocks de Express ni de Vercel — los 9 tests de `validate-pin.test.ts` llaman al handler exactamente como lo llamaría Vercel en producción. Sigue corriendo en el runtime Node.js (no Edge), que es lo que exige `timingSafeEqual` de `node:crypto`.
- **Comparación de tiempo constante incluso para agentes inexistentes:** `isPinValid` siempre ejecuta `timingSafeEqual` contra un valor dummy si el agente no tiene PIN configurado, en vez de devolver `false` inmediatamente. Sin esto, el tiempo de respuesta sería un canal lateral que revelaría qué `agentId` son válidos, aunque el mensaje de error fuera idéntico.
- **Los nombres de agente son placeholders deliberados:** `AGENTS` usa "Agente 1"–"Agente 4" en vez de nombres reales del personal, para no versionar datos identificativos de empleados en un repositorio público de GitHub. El PIN de cada uno vive solo en variables de entorno del servidor (`PIN_AGENT_1`…), documentadas sin valores en `.env.example`, nunca en el código.
- **Sin comprobación de longitud de buffer previa a `timingSafeEqual`:** Node lanza si las longitudes no coinciden, así que `safeCompare` comprueba la longitud primero y devuelve `false` sin comparar — un PIN mal configurado (longitud distinta a 4) produce un `false` rápido en vez de una excepción, pero esto es un caso de error de configuración del propio servidor, no una señal que un atacante externo pueda provocar variando su PIN (el formato de 4 dígitos ya se valida antes).
- **`api/` como proyecto de TypeScript aparte (`tsconfig.api.json`):** no estaba incluido en ningún proyecto de `tsc -b`, así que `pnpm build` no lo tipaba en absoluto. Se añadió como cuarto proyecto referenciado para que el mismo quality gate que cubre `src/` cubra también el backend.
- **El gate de identificación se integró ya en `App.tsx`**, no se dejó aislado: sin agente identificado no se puede llegar al formulario de cotización, cumpliendo la regla de negocio "cada cotización queda asociada al agente" desde este capítulo, en vez de retocar `App.tsx` más adelante.
- **`sessionStorage` guarda solo el nombre del agente, nunca el PIN:** una vez validado, la sesión del navegador recuerda quién está identificado hasta cerrar la pestaña, sin que el PIN exista en ningún momento fuera del cuerpo de la petición HTTP inicial.
- **El Context se dividió en 3 archivos** (`AgentSessionContextValue.ts` con `createContext` y los tipos, `AgentSessionContext.tsx` solo con el `Provider`, `useAgentSession.ts` solo con el hook), siguiendo el mismo patrón que el `CartContext` del proyecto de referencia del Módulo 10. No es solo estilo: `oxlint` avisaba de que mezclar un componente con un hook/tipos en el mismo archivo rompe el Fast Refresh de React (al editar el hook, se recarga también el árbol de componentes innecesariamente) — separar por responsabilidad resuelve el aviso y es más fácil de navegar.

### Una limitación conocida y documentada, no un olvido

`pnpm dev` (Vite) no sirve `/api/*.ts` — eso solo funciona con `vercel dev` o con la app ya desplegada en Vercel. Por eso la prueba en navegador de este capítulo intercepta la llamada de red (`page.route` de Playwright) en vez de golpear un servidor real; la lógica real del endpoint la cubren los tests que llaman al handler directamente. La prueba end-to-end contra el endpoint desplegado de verdad queda para el capítulo 8 (despliegue).

### Verificación

`pnpm lint`, `pnpm test:run` (164 tests: 34 nuevos de este capítulo) y `pnpm build` verificados en verde (incluyendo el nuevo proyecto `tsconfig.api.json`). Cobertura: 100% funciones, ≥98% líneas/branches/statements. Probado en navegador (Chromium headless) con la llamada de red interceptada: PIN incorrecto muestra el mensaje genérico enmascarado, PIN correcto identifica al agente y desbloquea la calculadora, "Cerrar sesión" vuelve a la pantalla de identificación.

---

## 6. Capítulo 6 — Actualizador de tarifas

### El requisito que casi se pasa por alto

`docs/reglas-de-negocio.md` §7 señala algo que no es un detalle menor: `calculateQuote`, `calculateExtras` y `calculateMonthlyPremiumPrice` (capítulos 2-3) importaban el catálogo (`MODALITIES`, `DISCOUNTS`, `EXTRAS`) como constantes fijas del módulo. Si este capítulo se hubiera limitado a construir una pantalla que guarda precios editados en `localStorage`, esos precios **nunca habrían llegado a afectar ningún cálculo real** — los tres motores habrían seguido leyendo el catálogo original, ajenos a lo guardado. Detectar esto *antes* de escribir el primer componente (no después, viendo que "algo no cuadra") es lo que separa un editor de tarifas que funciona de uno que solo aparenta funcionar.

*Cómo contarlo en el vídeo:* es un caso de libro del Principio de Inversión de Dependencias (Módulo 1) aplicado sin necesidad de clases ni interfaces — los motores de cálculo no debían depender de una fuente de datos concreta (el catálogo fijo importado), sino de una fuente de datos abstracta (precio efectivo, venga de donde venga) que se les inyecta desde fuera.

### Qué se construyó

1. **`TariffOverrides`** (tipo compartido) + cuatro funciones resolutoras puras (`resolveModalityPrice`, `resolveDiscountPercentage`, `resolveExtraPrice`, `resolveMonthlyPremiumRate`): cada una devuelve el valor editado si existe, o el del catálogo fijo si no.
2. **Los tres motores del capítulo 2-3, refactorizados** para aceptar un `overrides` opcional y usar las resolutoras en vez de leer `modality.price`/`discount.percentage`/`extra.price` directamente. Sin overrides (el caso de todos los tests de capítulos anteriores), el comportamiento es idéntico al original — verificado manteniendo en verde el caso dorado y el resto de tests ya existentes durante todo el refactor.
3. **`tariffOverridesRepository`**: el único punto de acceso a `localStorage` para esta funcionalidad (patrón repositorio/adaptador), que además valida la forma de lo leído antes de confiar en ello.
4. **`TariffAdminScreen`**: una pantalla con 4 secciones (modalidades, descuentos, extras, Premium Mensual) donde cada campo muestra el valor efectivo actual y se puede editar o restablecer al catálogo.
5. **Navegación mínima en la cabecera** (`Calculadora` / `Tarifas`) sin librería de rutas — con dos pantallas, un `useState` es suficiente y no añade una dependencia para algo que no la necesita.
6. Los tres componentes de la calculadora que muestran precios (`ModalitySelector`, `DiscountsSection`, `ExtrasSection`) también se actualizaron para leer el valor efectivo, no el del catálogo — si no, el desplegable de modalidad mostraría un precio distinto al que realmente se cobra, contradiciendo la propia propuesta de valor del proyecto ("guiada y explicada").

### `localStorage` como límite de confianza, no como almacén ciego

El análisis curricular (`docs/analisis-curricular.md`) señaló dos prácticas del Módulo 2 y el Módulo 9 que aplican directamente aquí: un patrón repositorio en vez de llamadas directas a `localStorage.getItem/setItem` desperdigadas por el código, y tratar lo leído de `localStorage` como una entrada externa que hay que validar, no como un dato de confianza. `localStorage` se puede editar a mano desde las herramientas de desarrollador del navegador — un valor corrupto, un tipo incorrecto o un id que ya no existe en el catálogo no deben poder colar un precio inválido en un cálculo de dinero. `sanitizeTariffOverrides` descarta silenciosamente (con log) cualquier entrada que no sea un número finito positivo o cuya clave no esté en el catálogo actual, y si el JSON completo está corrupto, la función registra el error y devuelve el catálogo por defecto en vez de romper la aplicación.

*Cómo contarlo en el vídeo:* validar datos de `localStorage` antes de usarlos es, en esencia, el mismo principio que validar un payload HTTP (capítulo 5) — cualquier dato que cruza un límite de confianza (red, almacenamiento del navegador, entrada del usuario) se trata como potencialmente hostil o corrupto, nunca como correcto por defecto.

### Decisiones a poder defender

- **`overrides` como parámetro opcional, no obligatorio:** todas las llamadas existentes a los tres motores (capítulos 2-4) siguen funcionando sin cambios — un valor por defecto (`EMPTY_TARIFF_OVERRIDES`) hace que "sin overrides" sea indistinguible de "usar el catálogo fijo". Esto evitó tener que tocar ninguna llamada existente a `calculateQuote`/`calculateExtras`/`calculateMonthlyPremiumPrice` fuera de las tres funciones en sí.
- **Cuatro funciones concretas en `TariffAdminScreen` en vez de una genérica:** el primer intento usaba una única función genérica `updateOverride<K>(sección, id, valor)` para las 4 secciones, pero TypeScript no puede probar que "omitir una clave genérica de un record" preserve el tipo original — el intento de generalizar producía errores de tipos reales, no solo ruido. Cuatro funciones concretas y algo repetitivas son más código, pero cada una es trivialmente correcta y typada sin trucos.
- **Editar un campo y dejarlo vacío equivale a restablecerlo:** no hace falta un botón "Restablecer" para volver al catálogo — borrar el valor del campo ya lo hace, porque `withNumericOverride` trata cualquier valor no numérico o no positivo como "sin override". El botón "Restablecer" solo se muestra como atajo visible cuando ya hay un valor editado, no como el único camino.
- **Los overrides se leen una vez al montar `useQuoteForm`, no en tiempo real:** si el personal edita una tarifa mientras la calculadora ya está abierta en otra pestaña del propio `view`, el cambio no se refleja hasta volver a entrar en la calculadora (cambiar de vista la desmonta y remonta). Es suficiente para una app de una sola pestaña con un único usuario a la vez, y evita añadir un sistema de sincronización en tiempo real que nada en el proyecto necesita.
- **`FormField`/`formInputClasses` promovido a `shared/components/`:** hasta este capítulo solo lo usaba `quote-calculator`; en cuanto `tariff-admin` necesitó los mismos estilos de input, se movió a `shared/` siguiendo la Scope Rule al pie de la letra — no se sube a `shared/` por anticipación, solo cuando una segunda feature lo necesita de verdad.

### Verificación

`pnpm lint`, `pnpm test:run` (201 tests: 37 nuevos de este capítulo) y `pnpm build` verificados en verde. Cobertura: 100% funciones, ≥98% líneas/branches/statements. Probado en navegador real (Chromium headless): editar el precio de una modalidad en "Tarifas", guardar, volver a "Calculadora" y confirmar que el desplegable y el resumen ya muestran y usan el precio nuevo — sin errores de consola.

---

## 7. Capítulo 7 — Exportación a Excel

### Qué se construyó

El último bloque de lógica de negocio del núcleo v1: la posibilidad de añadir cada cotización ya calculada a una lista acumulada, y descargarla como un `.xlsx` real. Cinco piezas, cada una con su propio ciclo TDD:

1. **`ExportedQuote`** (tipo compartido) — el snapshot congelado de una cotización en el momento en que se añade a la exportación.
2. **`buildExportedQuote`** — función pura que convierte el estado actual del formulario en ese snapshot, devolviendo `null` si la cotización no está en un estado válido para exportar.
3. **`exportedQuotesRepository`** — mismo patrón repositorio/validación que `tariffOverridesRepository` (capítulo 6), acumulando cotizaciones en `localStorage` hasta que se exportan o se borran.
4. **`generateQuotesWorkbook`** — genera el libro `.xlsx` de verdad con `exceljs`, una fila por cotización.
5. **UI**: botón "Añadir a exportación" en el resumen de la calculadora + pantalla `ExcelExportScreen` con la lista acumulada, "Quitar" por fila, "Vaciar lista" y "Descargar Excel".

*Cómo contarlo en el vídeo:* con este capítulo se cierra el ciclo completo de la herramienta — calcular, identificar al agente, ajustar tarifas si hace falta, y dejar constancia de cada cotización en un formato que el club ya usa (Excel), sin depender de que nadie copie números a mano.

### Un dato de seguridad que no estaba en el radar al principio: Formula Injection

El análisis curricular (`docs/analisis-curricular.md`, Módulo 9) señaló un riesgo específico de este capítulo: si el nombre de un abonado empieza por `=`, `+`, `-` o `@`, Excel puede interpretarlo como el inicio de una fórmula al abrir el archivo — un campo de texto libre convertido en código ejecutable sin que el usuario lo pida. `sanitizeExcelCellValue` neutraliza esto anteponiendo una comilla simple a cualquier valor de texto libre (nombre, email del abonado) que empiece por uno de esos caracteres, forzando que Excel lo trate como texto. Se verificó no solo con un test unitario que inspecciona el `Buffer` generado, sino con un archivo `.xlsx` real descargado en un navegador y reabierto con `exceljs` para confirmar que la celda queda como texto (`ValueType.String`), no como fórmula (`ValueType.Formula`).

*Cómo contarlo en el vídeo:* es la aplicación más concreta de "no confiar en el cliente" de todo el proyecto — el dato no viene de un atacante externo, viene de un campo de formulario normal, pero el destino (un archivo que se abre en Excel) lo convierte en una superficie de ataque real si no se trata como texto no confiable.

### El bundle que se disparó a 1 MB, y cómo se resolvió

Al instalar `exceljs` y ejecutar `pnpm build`, el bundle de JavaScript pasó de ~220 KB a más de 1,1 MB — `exceljs` es una librería pesada (maneja XML, compresión ZIP y estilos internamente). La solución no fue buscar una librería más pequeña, sino reconocer que el 100% de los usuarios de la app cargan ese peso en cada visita aunque el 90% del tiempo estén usando la calculadora, no la exportación. Cambiar el `import` estático de `exceljs` por uno dinámico (`await import('exceljs')`) dentro de `generateQuotesWorkbook` hace que Vite separe `exceljs` en su propio chunk, cargado solo la primera vez que alguien pulsa "Descargar Excel". El bundle principal volvió a ~230 KB; el chunk de `exceljs` (930 KB) sigue siendo grande, pero diferido, no en el camino crítico de carga inicial.

*Cómo contarlo en el vídeo:* es una decisión de rendimiento basada en medir primero (`pnpm build` avisa del tamaño) y entender el *por qué* antes de actuar — no todo el código de una aplicación necesita cargarse en el primer segundo, y separar por uso real es más efectivo que perseguir una librería "más ligera" que quizá no exista.

### Se detectó y se corrigió una dependencia transitiva vulnerable, no reportada por instalar `exceljs`

`pnpm audit` marcó una vulnerabilidad moderada en `uuid` (una dependencia interna de `exceljs`, no elegida directamente). En vez de ignorarla o esperar a que `exceljs` publicara una versión que la arreglara, se forzó la versión parcheada de `uuid` con `pnpm-workspace.yaml` (`overrides`), sin tocar el código de la aplicación. `pnpm audit` quedó en cero vulnerabilidades tras el cambio.

*Cómo contarlo en el vídeo:* instalar una dependencia no es solo "añadirla al `package.json`" — incluye revisar lo que esa dependencia trae consigo, y `pnpm audit` es la herramienta que lo hace visible antes de que se convierta en un problema real.

### Decisiones a poder defender

- **Snapshot congelado, no un enlace vivo a la cotización:** `buildExportedQuote` copia los valores en el momento de añadir, no una referencia al estado del formulario. Si el agente sigue editando la cotización después de añadirla (o si se editan las tarifas más tarde), la fila ya exportada no cambia — es un registro histórico de lo que se cotizó en ese momento, coherente con lo que se le mostró al cliente.
- **Un `null` en vez de una excepción cuando la cotización no es exportable:** igual que en los motores de cálculo (capítulos 2-3), `buildExportedQuote` modela "no hay nada válido que exportar todavía" como un resultado explícito (`null`), no como un error. La UI usa ese `null` directamente para decidir si mostrar el botón, sin `try/catch`.
- **La cascada de descuentos y el desglose de `monthly_premium` se resumen en una columna de texto, no en columnas dinámicas:** el número de descuentos o meses varía por cotización (0 a 3 descuentos, 1 a 3 meses); en vez de columnas que aparecen y desaparecen según la fila, cada cotización resume su desglose en una cadena legible (`"Lunes a Viernes (15%): −660,00 €; ..."`) en una única columna — más fácil de leer en una hoja con muchas filas que un `.xlsx` con columnas dispersas.
- **`localStorage` como cola de exportación, no memoria volátil:** si el agente recarga la página a medias de una sesión de cotizaciones, las ya añadidas no se pierden — mismo patrón de persistencia que las tarifas editadas (capítulo 6), por consistencia con el resto de la aplicación.
- **El botón "Añadir a exportación" no acepta `null`:** en vez de una comprobación `if (!exportableQuote) return` dentro del manejador de clic, `QuoteForm` solo le pasa un `onExport` a `QuoteSummary` cuando ya existe una cotización exportable (`exportableQuote ? () => handleExport(exportableQuote) : undefined`). El propio tipo de TypeScript garantiza que `handleExport` nunca se llama con `null` — no hace falta un guardia en tiempo de ejecución para algo que la UI ya impide que ocurra.

### Verificación

`pnpm lint`, `pnpm test:run` (248 tests: 47 nuevos de este capítulo) y `pnpm build` verificados en verde. Cobertura: 100% funciones, ≥97% líneas/branches/statements. `pnpm audit`: 0 vulnerabilidades. Probado en navegador real (Chromium headless) de principio a fin: caso dorado con un nombre de abonado `=2+2`, añadido a la exportación, descargado como `.xlsx` real y reabierto con `exceljs` para confirmar el contenido — fila con los tres descuentos y el total correctos, y el nombre neutralizado como texto (`'=2+2`), no como fórmula.
