# FEATURE-002 — Cálculo básico de propina (calculateTip)

## 1. Feature Identity

- **Feature:** FEATURE-002
- **Name:** Cálculo básico de propina (calculateTip)
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Las integraciones de facturación necesitan una única fuente de verdad para calcular el monto de propina y el total a pagar a partir de un monto base y un porcentaje, evitando lógica duplicada e inconsistencias de redondeo entre integraciones.

# 3. Functional Goal

Proveer una función pura calculateTip(monto, porcentaje) que calcule de forma consistente y validada el monto de propina y el total a pagar.

# 4. Scope

## Included

- Validación de monto (número finito > 0)
- Validación de porcentaje (número finito >= 0)
- Cálculo de tipAmount = monto * porcentaje/100
- Cálculo de total = monto + tipAmount
- Redondeo a 2 decimales (half up) aplicado una sola vez sobre el resultado final
- Manejo de caso porcentaje = 0

## Excluded

- Prorrateo entre comensales (calculateSplitTip)
- Soporte de múltiples monedas
- Persistencia o UI
- Límite superior de porcentaje

## Future Ideas

- Prorrateo entre comensales en Release 2

# 5. Functional Rules

1. monto debe ser un número finito mayor que 0; en caso contrario se lanza un error descriptivo
2. porcentaje debe ser un número finito mayor o igual a 0; en caso contrario se lanza un error descriptivo
3. tipAmount se calcula como monto * (porcentaje/100) y se redondea a 2 decimales usando half up
4. total se calcula como monto + tipAmount (ya redondeado) y se redondea nuevamente a 2 decimales
5. si porcentaje es 0, tipAmount debe ser 0 y total debe ser igual a monto redondeado a 2 decimales
6. el redondeo se aplica solo sobre el resultado final, nunca sobre el monto de entrada antes del cálculo

# 6. Estrategia Algorítmica

Not applicable.

# 7. Technical Considerations

## Planning Contribution

Renombrar el campo de salida propina a tipAmount para cumplir el contrato {tipAmount, total}; agregar validación de entradas (monto finito > 0, porcentaje finito >= 0) lanzando Error descriptivo antes de calcular; conservar el redondeo half-up determinista existente aplicado una sola vez por campo. Reescribir la suite con node:test cubriendo cálculo típico, porcentaje 0, redondeo ambiguo y errores de validación. Build tsc emite dist/tip.test.js.

### Affected Components

- src/tip.ts
- src/tip.test.ts

### Dependencies

- typescript ^5.4.0
- @types/node ^20.11.0
- node:test
- node:assert/strict

## Developer Implementation 1

Implementación de feature f1 - calculateTip con validación de entradas (monto finito > 0, porcentaje finito >= 0) y renombre de campo propina a tipAmount. Suite de tests reescrita con 5 casos cubriendo cálculo normal, límites, redondeo half-up ambiguo, y lanzamiento de errores de validación.

### Files Changed

- src/tip.ts
- src/tip.test.ts

### Decisions

- Mantener interfaz ResultadoPropina pero cambiar campos internos a tipAmount y total según especificación
- Agregar validación de entradas al inicio de calculateTip antes de cualquier cálculo
- Usar assert.throws() para validar casos de error con Number.isFinite()
- Conservar redondeo half-up determinista con Number.EPSILON sin modificación
- Reescribir tests completos para reflejar nuevo contrato funcional {tipAmount, total}

### Technical Evidence

- src/tip.ts línea 23-26: validación de monto con Error descriptivo
- src/tip.ts línea 29-31: validación de porcentaje con Error descriptivo
- src/tip.ts línea 33-35: cálculo y redondeo half-up conservado
- src/tip.test.ts: 5 tests ejecutables con node:test dist/tip.test.js

## Developer Readiness — Attempt 1

Status: ready

Feature f1 implementada y validada completamente. Todos los 5 tests pasaron sin defects ni quality risks. Contrato de función {tipAmount, total} correcto, validaciones de entrada funcionando, redondeo determinista verificado.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- TAP output muestra 5 pass / 0 fail / exitCode 0
- No hay defects reportados por QA
- Interfaz ResultadoPropina correctamente refactorizada
- Validaciones (monto > 0, porcentaje >= 0) implementadas
- Redondeo half-up (Number.EPSILON) funcionando para casos ambiguos


# 8. Validation Criteria

## Scenario 1 — Cálculo típico con porcentaje entero

**Input / Action**

monto=100, porcentaje=15

**Expected output**

{ tipAmount: 15.00, total: 115.00 }

## Scenario 2 — Porcentaje cero

**Input / Action**

monto=50, porcentaje=0

**Expected output**

{ tipAmount: 0.00, total: 50.00 }

## Scenario 3 — Monto con decimales que generan ambigüedad de redondeo

**Input / Action**

monto=10.005, porcentaje=10

**Expected output**

Resultado redondeado a 2 decimales aplicando half up de forma consistente (ej. tipAmount: 1.00, total: 11.01, según cálculo exacto antes del redondeo)

## Scenario 4 — Monto inválido

**Input / Action**

monto=-5, porcentaje=10

**Expected output**

La función lanza un error descriptivo indicando que el monto debe ser mayor que 0

## Scenario 5 — Porcentaje inválido

**Input / Action**

monto=100, porcentaje=NaN

**Expected output**

La función lanza un error descriptivo indicando que el porcentaje debe ser un número finito no negativo


## Validation Evidence

Suite de pruebas unitarias sobre calculateTip cubriendo cálculo típico, porcentaje 0, casos de redondeo ambiguo y validación de errores para monto y porcentaje inválidos, ejecutada como parte del pipeline de CI del paquete.

## Planning Validation Plan

Test command: `node --test dist/tip.test.js`

## Scenario 1 — Cálculo típico con porcentaje entero

**Input / Action**

calculateTip(100, 15)

**Expected output**

{ tipAmount: 15, total: 115 }

## Scenario 2 — Porcentaje cero (límite)

**Input / Action**

calculateTip(50, 0)

**Expected output**

{ tipAmount: 0, total: 50 }

## Scenario 3 — Redondeo ambiguo half-up

**Input / Action**

calculateTip(10.005, 10)

**Expected output**

{ tipAmount: 1.00, total: 11.01 }

## Scenario 4 — Monto inválido

**Input / Action**

calculateTip(-5, 10)

**Expected output**

Lanza Error descriptivo indicando que el monto debe ser un número finito mayor que 0

## Scenario 5 — Porcentaje inválido

**Input / Action**

calculateTip(100, NaN)

**Expected output**

Lanza Error descriptivo indicando que el porcentaje debe ser un número finito no negativo

### Evidence Required

- Salida de consola de node --test dist/tip.test.js mostrando los 5 tests en pass, 0 fail

## QA Result 1 — Attempt 1

Test status: passed

Evidence: node --test dist/tip.test.js: TAP 1..5, 5 pass 0 fail, exitCode 0, stderr empty, timedOut false

### Tests Executed

- Cálculo típico: calculateTip(100, 15)
- Porcentaje cero (límite): calculateTip(50, 0)
- Redondeo ambiguo half-up: calculateTip(10.005, 10)
- Monto inválido: calculateTip(-5, 10) lanza Error
- Porcentaje inválido: calculateTip(100, NaN) lanza Error

### Defects

- None.

### Observations

- Interfaz ResultadoPropina refactorizada correctamente a {tipAmount, total}
- Validación de monto (finito > 0) implementada y verificada
- Validación de porcentaje (finito >= 0) implementada y verificada
- Redondeo half-up determinista (Number.EPSILON) funcionando para casos ambiguos
- Lógica de cálculo tipAmount y total correcta

# 9. Risks

## Functional Risks

- Errores de precisión de punto flotante en JavaScript/TypeScript si no se implementa el redondeo con una técnica robusta (ej. evitar solo Math.round ingenuo en valores como x.005)
- Inconsistencia si distintas integraciones interpretan el error lanzado de forma diferente; se debe documentar claramente el tipo/mensaje de error esperado

## Technical Risks

- Precisión de punto flotante en valores x.005: el redondeo debe usar la técnica determinista existente (Number.EPSILON) y no Math.round ingenuo
- Regresión de contrato: consumidores que esperen el campo propina; el campo de salida debe quedar exactamente como {tipAmount, total} sin campos adicionales
- El caso monto=0 preexistente en el test debe dejar de tratarse como válido y pasar a esperar Error

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
