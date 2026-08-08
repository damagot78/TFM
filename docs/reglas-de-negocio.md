# Especificación de Reglas de Negocio — Calculadora de Cuotas AGM 2026

Fuente: tarifas y normativa oficiales de Arabella Golf Mallorca (catálogo 2026), validadas mediante pruebas reales previas a este proyecto. Este documento es la especificación funcional para el desarrollo TDD del motor de cálculo.

**Documentos oficiales de referencia:**
- [Tarifas Membresías 2026](https://arabellagolfmallorca.com/wp-content/uploads/2026/01/Members_2026_rev_QR.pdf)
- [Derechos y Obligaciones del Abonado 2026](https://arabellagolfmallorca.com/wp-content/uploads/2026/04/Derechos_y_obligaciones_del_abonado_2026-ES_04.pdf)

## 1. Catálogo de modalidades de abono

| ID | Nombre | Categoría | Tarifa 2026 |
| :--- | :--- | :--- | :---: |
| `pp` | Palma Pitch & Putt (P&P) | Standard | 725 € |
| `dr_sq` | Driving Range Son Quint (DR-SQ) | Standard | 750 € |
| `pp_dr_sq` | P&P + DR-SQ | Standard | 995 € |
| `dr_sm` | Driving Range SM (DR-SM) | Standard | 1.150 € |
| `sv` | Golf Son Vida (SV) | Standard | 3.150 € |
| `sq` | Golf Son Quint (SQ) | Standard | 3.250 € |
| `sv_dr_sq` | SV + DR-SQ | Standard | 3.270 € |
| `sv_pp` | SV + P&P | Standard | 3.370 € |
| `sv_dr_sm` | SV + DR-SM | Standard | 3.470 € |
| `sq_pp` | SQ + P&P | Standard | 3.570 € |
| `sv_sq` | SV + SQ | Standard | 3.700 € |
| `sm` | Golf Son Muntaner (SM) | Standard | 4.400 € |
| `sm_buggy` | SM + Buggy | Standard | 5.450 € |
| `premium` | Premium (SM+SV+SQ+P&P) | Premium | 5.450 € |
| `premium_spa` | Premium + SPA | Premium | 6.050 € |
| `premium_buggy` | Premium + Buggy | Premium | 6.450 € |
| `premium_spa_buggy` | Premium + SPA + Buggy | Premium | 7.050 € |
| `monthly_premium` | Premium Mensual | Monthly | 725 €/mes (alta) · 860 €/mes (resto) — ver regla abajo |

SM y SQ incluyen uso ilimitado de su Driving Range. Todos los precios incluyen IVA (21%).

### Modalidad `monthly_premium` (Premium Mensual) — incluida en v1

Producto mes a mes (no cuota anual), categoría `Monthly`. **No admite ningún descuento de la cascada.**

- **Tarifa alta (725 €/mes):** Enero, Julio, Agosto, Diciembre.
- **Tarifa estándar (860 €/mes):** resto de meses del año.
- Se puede contratar por **1, 2 o 3 meses** (máximo 3) a partir de una fecha de inicio.
- Para cada uno de esos meses:
  - Si el periodo cae limpio dentro de un único mes natural → **precio automático** por consulta directa de la tarifa de ese mes.
  - Si el periodo cruza el límite entre dos meses naturales:
    - Si ambos meses tienen la **misma tarifa** → sigue siendo automático (no hay ambigüedad real).
    - Si tienen **tarifas distintas** → la aplicación presenta ambas opciones (alta/estándar) y **el agente comercial elige manualmente** cuál aplicar. No hay regla automática de días para este caso — es una decisión humana en el momento de la venta.
- La tarifa aplicada a cada mes (y si fue una elección manual por cruce de temporada) se registra y se incluye en la exportación a Excel (capítulo 7).
- Relacionado pero fuera de esto: el ajuste manual de cuota especial por dirección (`specialPrice`) es un mecanismo aparte, para un capítulo posterior — no se mezcla con esta lógica.

**Ejemplo (caso simple, sin cruce):** se contratan Agosto + Septiembre (2 meses completos, cada uno cae limpio en su propio mes natural). Agosto es tarifa alta (725 €), Septiembre es tarifa estándar (860 €) → se cobran **por separado y se suman: 725 + 860 = 1.585 €**. No se promedia ni se aplica una única tarifa a los dos meses — cada mes contratado es una unidad de precio independiente.

## 2. Cascada de descuentos

Máximo **3 descuentos simultáneos** por abonado. Se aplican en cascada (no se suman linealmente): cada descuento se calcula sobre el importe restante tras el descuento anterior.

**Orden de aplicación (verificado contra el código validado — NO es el orden mostrado en el folleto de tarifas al cliente, que es distinto):** Lunes a Viernes → Abono Tarde → Up-Grade → Asociación Vecinos Son Vida → Familiar → Joven → Niño → Junior → Sub-25 → Referral.

| Orden | ID | Nombre | % | Restricción edad | Restricción categoría | Incompatible con |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- |
| 1 | `week` | Lunes a Viernes | 15% | — | No aplicable a Premium | — |
| 2 | `afternoon` | Abono Tarde (desde 14h) | 25% | — | No aplicable a Premium | — |
| 3 | `upgrade` | Up-Grade (renovación +1 campo) | 7% | — | — | — |
| 4 | `avsv` | Asociación Vecinos Son Vida | 10% | — | — | — |
| 5 | `family` | Descuento Familiar | 10% | — | — | junior, child, sub25 |
| 6 | `young` | Joven | 20% | 26-35 años | — | child, junior, sub25 |
| 7 | `child` | Niño | 80% | 6-12 años | Solo Premium | junior, sub25, young, family |
| 8 | `junior` | Junior | 70% | 13-18 años | Solo Premium | family, sub25, child, young |
| 9 | `sub25` | Sub-25 | 50% | hasta 25 años | — | junior, child, young, family |
| 10 | `referral` | Premio Referral | 10% del importe contratado por el referido | — | — | — |

### Caso de prueba de referencia (validado con datos reales)

Abono `sm` (Golf Son Muntaner, 4.400 €) con los descuentos Lunes a Viernes + Abono Tarde + Descuento Familiar:

| Paso | Descuento | Cálculo | Importe | Restante |
| :--- | :--- | :--- | :---: | :---: |
| 1 | Lunes a Viernes (15%) | 4.400 × 0,15 | −660,00 € | 3.740,00 € |
| 2 | Abono Tarde (25%) | 3.740 × 0,25 | −935,00 € | 2.805,00 € |
| 3 | Descuento Familiar (10%) | 2.805 × 0,10 | −280,50 € | 2.524,50 € |

**Ahorro total: 1.875,50 € — Subtotal tras descuentos: 2.524,50 €.** Usar como test de referencia (golden test) para el motor de cascada en el capítulo 2: si la implementación no reproduce exactamente estos números, hay un error en el orden o en la lógica de cascada.

### Aclaración y caso de prueba — descuento `referral`

El `referral` es distinto a los otros 9 descuentos: su base de cálculo **no es el subtotal de la cuota que se está calculando**, sino el importe contratado por la persona referida (un dato externo a esta cotización). El 10% resultante sí se resta de la cuota propia del abonado que recomienda, como un paso más de la cascada.

**Ejemplo:** el Abonado A recomienda al Abonado B. El Abonado B contrata una cuota de 5.000 €. El Abonado A recibe un descuento de `5.000 × 0,10 = 500 €` sobre su propia cuota — no sobre los 5.000 € del referido.

Implementación recomendada (capítulo 2): el motor de cascada acepta un parámetro opcional `referralAmount` (el importe contratado por el referido); si `referral` está entre los descuentos seleccionados, su importe se calcula como `referralAmount × 0,10` en vez de `subtotalActual × 0,10`, pero se resta del subtotal en curso exactamente igual que cualquier otro paso de la cascada.

Categoría `Monthly`: no admite ningún descuento.

## 3. Extras

| ID | Nombre | Grupo exclusividad | Precio |
| :--- | :--- | :---: | :---: |
| `locker` | Alquiler de Taquilla | — | 150 €/año |
| `club_storage` | Custodia de Palos | `storage` | 175 €/año |
| `storage_trolley` | Custodia + Trolley | `storage` | 290 €/año |
| `storage_trolley_battery` | Custodia + Trolley + Batería | `storage` | 400 €/año |
| `buggy_monthly` | Buggy ilimitado mensual | `buggy` | 195 €/mes |
| `buggy_annual` | Buggy ilimitado anual | `buggy` | 1.400 €/año |
| `charger` | Cargador eléctrico | — | 150 €/año (incluido en Premium si adulto) |
| `license_insurance` | Seguro Licencia RFEG | — | 144 €/año |

Los extras del mismo grupo (`storage`, `buggy`) son mutuamente excluyentes. Buggy anual incluido gratis en `sm_buggy`, `premium_buggy`, `premium_spa_buggy`. Modalidades sin instalaciones para buggy/carrito (`pp`, `dr_sq`, `pp_dr_sq`, `dr_sm`) no permiten estos extras.

## 4. Validación de edad

- Edad = fecha actual − fecha de nacimiento.
- Menores de 16 años: no pueden contratar ni usar Buggy (extra desactivado automáticamente).
- **Regla de "Adulto" para el cargador eléctrico gratuito en Premium** (redacción anterior de este documento era ambigua/incorrecta — corregido aquí):
  - Si se conoce la fecha de nacimiento → adulto si y solo si `edad ≥ 18`. El descuento Niño/Junior seleccionado no interviene en este caso (si hay fecha de nacimiento, la edad manda).
  - Si **no** se conoce la fecha de nacimiento → adulto si y solo si **no** hay un descuento Niño o Junior seleccionado (se asume adulto por defecto salvo indicio explícito de que es menor).
  - En pseudocódigo: `isAdult = (edad !== null && edad >= 18) || (edad === null && !tieneDescuentoNiñoOJunior)`.
  - Ejemplo que distingue esto de una interpretación "OR" simple: un abonado con fecha de nacimiento indicando 15 años, sin ningún descuento Niño/Junior seleccionado, **no** es adulto (la edad conocida manda) — no debe recibir el cargador gratuito aunque no tenga esos descuentos activos.

## 5. Pago (alcance v1: solo modo anual)

- Pago único, sin recargo.
- IVA (21%) desglosado informativamente sobre el total.

## 6. Identificación de personal (nuevo en v1)

- Lista fija de 3-4 agentes con nombre + PIN.
- Validación del PIN en función serverless (`api/validate-pin.ts`), nunca en cliente.
- Cada cotización queda asociada al agente identificado.

### Especificación de seguridad de `api/validate-pin.ts` (Módulos 6 y 9 del temario, aplicado)

**Contrato del endpoint:**
```
POST /api/validate-pin
Request:  { "agentId": string, "pin": string }
Response 200: { "valid": true, "agentName": string }
Response 400: payload inválido (formato incorrecto)
Response 401: PIN incorrecto o agente inexistente (mismo mensaje para ambos casos)
```

**Reglas obligatorias:**
1. **Solo `POST`.** Cualquier otro método se rechaza — un PIN nunca debe poder viajar en una query string (acabaría en logs/Referer).
2. **Validar el payload antes de comparar** (tipo, longitud esperada del PIN) — manual o con Zod, cualquiera de los dos vale; lo importante es no comparar contra un valor no validado.
3. **Comparación del PIN con `timingSafeEqual`** (`node:crypto`), nunca con `===` — evita filtrar por tiempo de respuesta si el PIN es parcialmente correcto.
4. **Mensaje de error siempre genérico**: la misma respuesta (401, "PIN inválido") tanto si el `agentId` no existe como si el PIN es incorrecto — nunca distinguir los dos casos, evita que alguien pueda enumerar agentes válidos por prueba y error.
5. **Nunca loguear el valor del PIN**, ni en éxito ni en fallo, ni devolverlo en ninguna respuesta.
6. **Fail securely**: cualquier fallo no controlado (variable de entorno ausente, payload malformado, excepción inesperada) deniega el acceso (400/401/500) — nunca deja pasar por defecto.
7. **CORS restrictivo**: mismo origen que el frontend (mismo dominio de Vercel), nunca `origin: '*'`.
8. **PIN en variables de entorno de servidor** (nunca `VITE_*`), con `.env.example` documentando las claves esperadas sin valores reales.

**Rate limiting — decisión de alcance consciente:** las funciones serverless de Vercel no mantienen estado persistente entre invocaciones, así que un contador de intentos fallidos fiable requeriría infraestructura adicional (Vercel KV/Upstash Redis) — fuera de alcance para el v1 dado el plazo y que son solo 3-4 agentes de confianza, no un endpoint público. Se acepta el riesgo residual, mitigado por: mensajes de error genéricos (regla 4), y registro en logs de cada intento fallido (timestamp + resultado, nunca el PIN) para revisión manual si hiciera falta. Queda documentado como decisión de alcance, no como omisión — si el proyecto creciera más allá del v1, Upstash sería la vía natural.

**Hash del PIN en vez de texto plano en la variable de entorno:** mejora de defensa en profundidad, no obligatoria para el alcance de este v1 (el PIN en texto plano ya vive solo en el servidor, nunca en el cliente, que es la barrera que de verdad importaba). Se puede añadir más adelante sin cambiar el contrato del endpoint.

**Sesión del agente en el cliente:** el PIN se valida una vez por sesión de navegador, no en cada cotización — tras validar, se guarda únicamente el **nombre del agente ya identificado** en `sessionStorage` (nunca el PIN), usado para asociar las cotizaciones siguientes hasta cerrar la pestaña.

## 7. Actualizador de tarifas (nuevo en v1)

- El catálogo de conceptos (modalidades, descuentos, extras) es fijo — no se crean ni eliminan.
- Solo el **precio** de cada concepto es editable por el personal autorizado.
- Los precios editados se persisten (localStorage en v1).

## 8. Exportación a Excel (nuevo en v1)

Cada cotización generada se puede añadir a una exportación `.xlsx` con, al menos: agente, fecha, modalidad, edad, descuentos aplicados, extras, total.
