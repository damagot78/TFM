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
| `monthly_premium` | Premium Mensual | Monthly | 725 €/mes (alta) · 860 €/mes (resto) |

SM y SQ incluyen uso ilimitado de su Driving Range. Todos los precios incluyen IVA (21%).

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
- Adulto (≥18 años, o sin descuento infantil/junior activo) → elegible para cargador eléctrico gratuito en Premium.

## 5. Pago (alcance v1: solo modo anual)

- Pago único, sin recargo.
- IVA (21%) desglosado informativamente sobre el total.

## 6. Identificación de personal (nuevo en v1)

- Lista fija de 3-4 agentes con nombre + PIN.
- Validación del PIN en función serverless (`api/validate-pin.ts`), nunca en cliente.
- Cada cotización queda asociada al agente identificado.

## 7. Actualizador de tarifas (nuevo en v1)

- El catálogo de conceptos (modalidades, descuentos, extras) es fijo — no se crean ni eliminan.
- Solo el **precio** de cada concepto es editable por el personal autorizado.
- Los precios editados se persisten (localStorage en v1).

## 8. Exportación a Excel (nuevo en v1)

Cada cotización generada se puede añadir a una exportación `.xlsx` con, al menos: agente, fecha, modalidad, edad, descuentos aplicados, extras, total.
