# FEATURE-002 — Reparto de propina entre comensales (calculateSplitTip)

## 1. Feature Identity

- **Feature:** FEATURE-002
- **Name:** Reparto de propina entre comensales (calculateSplitTip)
- **Release:** r1
- **Priority:** P1
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

Nuevo módulo src/split-tip.mjs que importa y reutiliza calculateTip de src/tip.mjs para obtener propina/total, deriva totalCents redondeando total*100, y reparte ese entero de centavos entre N comensales con división entera (piso) más distribución del resto por mayor resto, asignado de forma determinística a las primeras N partes por índice ascendente. Sin efectos secundarios, sin I/O.

### Affected Components

- src/split-tip.mjs
- src/split-tip.test.mjs

### Dependencies

- src/tip.mjs (calculateTip)

## Developer Implementation 1

Se implementó calculateSplitTip en src/split-tip.mjs reutilizando calculateTip de src/tip.mjs para propina/total, validando comensales como entero finito >=1, y repartiendo el total en centavos enteros mediante división entera más distribución del resto (mayor resto, primeras N partes). Se creó src/split-tip.test.mjs con los 5 escenarios exactos del plan, incluyendo verificación de que la suma de partes en centavos coincide con total*100.

### Files Changed

- src/split-tip.mjs
- src/split-tip.test.mjs

### Decisions

- Se cachea el resultado de calculateTip en una sola desestructuración { propina, total } para evitar invocarlo dos veces
- Validación de comensales separada e independiente de la validación de monto/porcentaje que ya realiza calculateTip
- Redondeo de total a centavos vía Math.round(total*100), seguro porque total ya viene con 2 decimales exactos desde calculateTip

### Technical Evidence

- src/split-tip.mjs implementa exactamente el algoritmo de reparto descrito en el plan
- src/split-tip.test.mjs cubre los 5 escenarios exactos declarados por Planning con las mismas rutas y comando de test (node --test src/split-tip.test.mjs)

## Developer Readiness — Attempt 1

Status: ready

Todos los escenarios de f2 (calculateSplitTip) pasaron: reparto exacto sin resto, reparto con resto de centavos, comensales inválido, comensales no entero y caso trivial de 1 comensal, con exitCode 0 y 5/5 tests en verde.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- QA confirmó que la suma de partes en centavos coincide exactamente con total*100 en los casos verificados
- La validación de comensales es independiente de la heredada de calculateTip, tal como especificó Planning


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

partes=[11.00,11.00,11.00], propina=3.00, total=33.00, suma de partes = total

## Scenario 2 — Reparto con resto de centavos

**Input / Action**

calculateSplitTip(10, 10, 3)

**Expected output**

partes=[3.67,3.67,3.66], propina=1.00, total=11.00, suma de partes = 11.00

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

- Salida completa de node --test src/split-tip.test.mjs mostrando los 5 escenarios en verde
- Verificación explícita en al menos un test de que la suma de partes en centavos coincide exactamente con total*100

## QA Result 1 — Attempt 1

Test status: passed

Evidence: node --test src/split-tip.test.mjs exitCode 0, tests 5, pass 5, fail 0, cancelled 0

### Tests Executed

- Reparto exacto sin resto: calculateSplitTip(30, 10, 3)
- Reparto con resto de centavos: calculateSplitTip(10, 10, 3)
- Comensales inválido (cero): calculateSplitTip(10, 10, 0) lanza RangeError
- Comensales no entero: calculateSplitTip(10, 10, 2.5) lanza RangeError o TypeError
- Comensales=1 (caso trivial): calculateSplitTip(20, 10, 1)

### Defects

- None.

### Observations

- La suma de partes en centavos coincide exactamente con total*100 en los casos verificados
- La función calculateSplitTip reutiliza calculateTip heredando su validación de monto/porcentaje

# 9. Risks

## Functional Risks

- La asignación de centavos extra a las primeras N partes por índice es una decisión implícita de negocio (asume que no importa qué comensal recibe el centavo extra); si el negocio esperara otro criterio (ej. aleatorio o al último), debería aclararse, aunque no bloquea el análisis dado que Architect ya definió el método de mayor resto.

## Technical Risks

- La asignación del centavo extra a las primeras N partes por índice es una decisión de negocio ya fijada por Architect/Functional; no requiere resolución adicional en Planning pero debe respetarse tal cual en la implementación.

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
