# FEATURE-003 — Reparto de propina entre comensales (calculateSplitTip)

## 1. Feature Identity

- **Feature:** FEATURE-003
- **Name:** Reparto de propina entre comensales (calculateSplitTip)
- **Release:** r2
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Los usuarios necesitan repartir el total entre varios comensales sin perder centavos por redondeo, de forma que la suma de las partes individuales sea exactamente igual al total.

# 3. Functional Goal

Proveer una función pura calculateSplitTip(monto, porcentaje, comensales) que reutilice calculateTip y reparta el total entre comensales mediante el método de mayor resto.

# 4. Scope

## Included

- Reparto del total en partes enteras de centavos entre N comensales
- Distribución del resto de centavos por mayor resto
- Validación de comensales como entero >= 1
- Reutilización de calculateTip sin duplicar lógica de redondeo

## Excluded

- Reparto desigual o proporcional entre comensales
- Persistencia, UI, multi-moneda
- Reimplementación o modificación de calculateTip (ya entregado en release r1)

## Future Ideas

- None.

# 5. Functional Rules

1. comensales debe ser un entero finito mayor o igual a 1; en caso contrario lanza RangeError o TypeError
2. monto y porcentaje se validan reutilizando calculateTip, sin duplicar lógica de redondeo
3. El total en centavos se divide entre comensales usando división entera (piso) como base para cada parte
4. El resto de centavos (totalCents % comensales) se distribuye de a uno entre las primeras N partes, donde N es el resto
5. La suma de las partes convertidas a 2 decimales debe ser exactamente igual al total devuelto por calculateTip
6. La asignación de centavos extra debe ser determinística y estable para el mismo input

# 6. Estrategia Algorítmica

## Objective

Repartir un total en centavos enteros entre N comensales sin pérdida de centavos, usando el método de mayor resto (largest remainder).

## Inputs

- totalCents (entero, derivado de calculateTip)
- comensales (entero >= 1)

## Outputs

- partes: array de N números con 2 decimales cuya suma en centavos es exactamente totalCents

## Constraints

- comensales debe ser entero finito >= 1
- La suma de partes en centavos debe igualar totalCents exactamente

## Tie Breakers

- El resto de centavos se asigna a las primeras N partes por índice ascendente, de forma determinística

## Deterministic Regressions

## Scenario 1 — reparto exacto sin resto

**Input / Action**

monto=30, porcentaje=10, comensales=3

**Expected output**

partes=[11.00,11.00,11.00]

## Scenario 2 — reparto con resto de centavos

**Input / Action**

monto=10, porcentaje=10, comensales=3

**Expected output**

partes=[3.67,3.67,3.66], suma=11.00


# 7. Technical Considerations

## Planning Contribution

Implementar calculateSplitTip reutilizando calculateTip (src/tip.mjs) para validar monto/porcentaje y obtener propina/total; validar comensales como entero finito >= 1; convertir total a centavos enteros y repartir con división entera (piso) más distribución del resto por mayor resto, asignando de a uno a las primeras N partes por índice ascendente de forma determinística; devolver partes con 2 decimales cuya suma en centavos sea exactamente igual al total en centavos.

### Affected Components

- src/split-tip.mjs
- src/split-tip.test.mjs

### Dependencies

- src/tip.mjs (calculateTip, release r1 cerrado, no modificar)

## Developer Implementation 1

calculateSplitTip(monto, porcentaje, comensales) en src/split-tip.mjs delega en calculateTip (src/tip.mjs, no modificado) para validar monto/porcentaje y obtener propina/total, valida comensales como entero finito >= 1 (TypeError si no es número finito, RangeError si no es entero o es < 1), y reparte el total en centavos enteros usando división entera con distribución del resto por mayor resto asignado a las primeras N partes por índice ascendente, devolviendo partes con 2 decimales cuya suma en centavos iguala exactamente el total en centavos. Se verificó que ya estaba implementado correctamente según el plan y se ejecutó el comando de test para confirmar evidencia, sin necesidad de cambios.

### Files Changed

- None.

### Decisions

- No se realizaron cambios en el código porque la implementación existente ya satisface exactamente el plan, los 5 casos de prueba y el contrato de calculateTip sin modificarlo
- Se verificó el comportamiento ejecutando el COMANDO_TEST exacto declarado por Planning antes de reportar como completado

### Technical Evidence

- node --test src/split-tip.test.mjs => TAP version 13; ok 1..5; # tests 5 # pass 5 # fail 0 # cancelled 0 # skipped 0 # todo 0; exitCode 0

## Developer Readiness — Attempt 1

Status: ready

Feature f2 (calculateSplitTip) implementada y validada: 5/5 tests pasando via node --test src/split-tip.test.mjs, sin defectos reportados por QA, reutiliza calculateTip de tip.mjs sin modificarlo y cumple el algoritmo de reparto por mayor resto determinístico definido en el plan.

Requires code changes: false

### Known Risks

- La distribución del resto de centavos a las primeras N partes por índice ascendente es una decisión de negocio implícita ya validada por Architect/Functional; si cambian los requisitos de equidad en el reparto debería revisarse explícitamente en una futura feature.

### Final Notes

- Ningún archivo fue modificado en este turno post-QA, conforme a la Regla 0.
- Evidencia: node --test src/split-tip.test.mjs -> TAP 1..5, pass 5, fail 0, cancelled 0, skipped 0, todo 0.


# 8. Validation Criteria

## Scenario 1 — Reparto exacto sin resto

**Input / Action**

monto=30, porcentaje=10, comensales=3

**Expected output**

partes=[11.00,11.00,11.00], totalPropina=3.00, total=33.00

## Scenario 2 — Reparto con resto de centavos

**Input / Action**

monto=10, porcentaje=10, comensales=3

**Expected output**

partes=[3.67,3.67,3.66], totalPropina=1.00, total=11.00, suma de partes = 11.00

## Scenario 3 — Comensales inválido (cero)

**Input / Action**

monto=10, porcentaje=10, comensales=0

**Expected output**

lanza RangeError

## Scenario 4 — Comensales no entero

**Input / Action**

monto=10, porcentaje=10, comensales=2.5

**Expected output**

lanza RangeError o TypeError

## Scenario 5 — Comensales=1 (caso trivial)

**Input / Action**

monto=20, porcentaje=10, comensales=1

**Expected output**

partes=[22.00], totalPropina=2.00, total=22.00


## Validation Evidence

Suite de tests unitarios que verifique en cada escenario que la suma de partes (redondeadas a 2 decimales) coincide exactamente con total, incluyendo casos con y sin resto de centavos.

## Planning Validation Plan

Test command: `node --test src/split-tip.test.mjs`

## Scenario 1 — Reparto exacto sin resto

**Input / Action**

calculateSplitTip(30, 10, 3)

**Expected output**

partes=[11.00,11.00,11.00], propina=3.00, total=33.00

## Scenario 2 — Reparto con resto de centavos

**Input / Action**

calculateSplitTip(10, 10, 3)

**Expected output**

partes=[3.67,3.67,3.66], propina=1.00, total=11.00, suma partes en centavos=1100

## Scenario 3 — Comensales inválido (cero)

**Input / Action**

calculateSplitTip(10, 10, 0)

**Expected output**

lanza RangeError

## Scenario 4 — Comensales no entero

**Input / Action**

calculateSplitTip(10, 10, 2.5)

**Expected output**

lanza RangeError o TypeError

## Scenario 5 — Comensales=1 (caso trivial)

**Input / Action**

calculateSplitTip(20, 10, 1)

**Expected output**

partes=[22.00], propina=2.00, total=22.00

### Evidence Required

- salida completa de node --test src/split-tip.test.mjs con los 5 tests pasando

## QA Result 1 — Attempt 1

Test status: passed

Evidence: node --test src/split-tip.test.mjs -> TAP 1..5, pass 5, fail 0, cancelled 0, skipped 0, todo 0, duration_ms 110.174885

### Tests Executed

- Reparto exacto sin resto: calculateSplitTip(30, 10, 3)
- Reparto con resto de centavos: calculateSplitTip(10, 10, 3)
- Comensales inválido (cero): calculateSplitTip(10, 10, 0) lanza RangeError
- Comensales no entero: calculateSplitTip(10, 10, 2.5) lanza RangeError o TypeError
- Comensales=1 (caso trivial): calculateSplitTip(20, 10, 1)

### Defects

- None.

### Observations

- Suma de partes en centavos verificada igual a total en centavos en el caso con resto (1100)
- Reutiliza calculateTip de src/tip.mjs sin modificarlo, conforme al plan

# 9. Risks

## Functional Risks

- La asignación de centavos extra a las primeras N partes por índice es una decisión implícita de negocio (asume que no importa qué comensal recibe el centavo extra); si el negocio esperara otro criterio (ej. aleatorio o al último), debería aclararse, aunque no bloquea el análisis dado que Architect ya definió el método de mayor resto.

## Technical Risks

- La asignación de centavos extra a las primeras N partes por índice ascendente es una decisión implícita de negocio (no aleatoria ni al final); ya validada por Architect/Functional como método de mayor resto determinístico

## Quality and Readiness Risks

- La distribución del resto de centavos a las primeras N partes por índice ascendente es una decisión de negocio implícita; si cambian los requisitos de equidad en el reparto, este comportamiento debería revisarse explícitamente
- La distribución del resto de centavos a las primeras N partes por índice ascendente es una decisión de negocio implícita ya validada por Architect/Functional; si cambian los requisitos de equidad en el reparto debería revisarse explícitamente en una futura feature.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
