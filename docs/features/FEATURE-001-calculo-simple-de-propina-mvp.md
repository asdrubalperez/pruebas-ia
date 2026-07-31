# FEATURE-001 — Calculo simple de propina (MVP)

## 1. Feature Identity

- **Feature:** FEATURE-001
- **Name:** Calculo simple de propina (MVP)
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Se necesita calcular de forma exacta y sin errores de punto flotante la propina y el total a pagar dado un monto y un porcentaje.

# 3. Functional Goal

Proveer una funcion pura calculateTip(monto, porcentaje) que retorne { propina, total } correctos y redondeados a 2 decimales de forma consistente.

# 4. Scope

## Included

- Funcion calculateTip con firma (monto: number, porcentaje: number) => { propina: number; total: number }
- Redondeo monetario interno en centavos usando Math.round para evitar errores de floating point
- Validacion de monto y porcentaje como numeros finitos no negativos, lanzando Error en caso contrario

## Excluded

- Reparto entre comensales (queda en Release 2 / feature f2)
- Persistencia, UI, exposicion HTTP o integracion con modulos consumidores existentes
- Soporte de multiples monedas

## Future Ideas

- None.

# 5. Functional Rules

1. propina = monto * porcentaje / 100, calculado en centavos enteros y convertido a decimales solo en la salida
2. total = monto + propina, con el mismo tratamiento de redondeo en centavos
3. Si monto o porcentaje no son numeros finitos (incluye NaN, Infinity, -Infinity) o son negativos, la funcion lanza un Error estandar
4. La funcion es pura: mismas entradas producen siempre la misma salida, sin efectos secundarios

# 6. Estrategia Algorítmica

Not applicable.

# 7. Technical Considerations

## Planning Contribution

Implementar calculateTip como funcion pura que convierte monto a centavos enteros con Math.round, calcula propina y total tambien en centavos enteros, valida monto y porcentaje con Number.isFinite y no-negatividad lanzando Error si fallan, y solo al final convierte de centavos a decimales dividiendo por 100 para evitar errores de punto flotante.

### Affected Components

- src/tip/calculateTip.mjs
- src/tip/index.mjs

### Dependencies

- None.

## Developer Implementation 1

Se implementó calculateTip como función pura en src/tip/calculateTip.mjs: valida monto y porcentaje (Number.isFinite y >= 0, lanzando Error si no cumplen), convierte el monto a centavos enteros con Math.round, calcula propinaCentavos y totalCentavos en enteros, y convierte a decimal dividiendo por 100 solo al final. Se creó src/tip/index.mjs como barrel que reexporta calculateTip y deja un comentario indicando el lugar futuro de calculateSplitTip para r2 (no implementada). Se creó src/tip/calculateTip.test.mjs con node:test y node:assert/strict cubriendo los 5 escenarios declarados por Planning, incluyendo verificación estricta de igualdad numérica para el caso de redondeo (19.99, 18).

### Files Changed

- src/tip/calculateTip.mjs
- src/tip/index.mjs
- src/tip/calculateTip.test.mjs

### Decisions

- Se usó Math.round exclusivamente como criterio único de redondeo en centavos enteros para evitar ambigüedad en mitades exactas, tal como señala el riesgo técnico del plan.
- Se validó monto y porcentaje con la misma lógica (Number.isFinite && x >= 0) para mantener consistencia y simplicidad en los mensajes de error.
- index.mjs se dejó como barrel mínimo, solo reexportando calculateTip, con un comentario explícito de que calculateSplitTip se agregará en r2, sin agregar ningún código funcional adicional fuera de alcance de f1.

### Technical Evidence

- El archivo de test cubre exactamente los 5 casos de prueba declarados por Planning con las rutas y comando exactos: node --test src/tip/calculateTip.test.mjs
- El cálculo intermedio se realiza estrictamente en centavos enteros (montoCentavos, propinaCentavos, totalCentavos) antes de dividir por 100, evitando el riesgo de errores de redondeo de punto flotante señalado en el plan.

## Developer Implementation 2

Se diagnosticó que el fallo de instalación de dependencias se debía a un BOM (U+FEFF) al inicio de package.json que invalidaba el parseo JSON. Se reescribió package.json sin BOM manteniendo el mismo contenido (name, version, private, scripts.build). La implementación funcional de la feature (calculateTip.mjs, index.mjs, calculateTip.test.mjs), creada en el intento previo, no requería cambios y se verificó que sigue correcta: se ejecutó node --test src/tip/calculateTip.test.mjs con 5/5 tests en verde y npm run build ejecutó exitosamente.

### Files Changed

- package.json

### Decisions

- No se modificó la lógica de calculateTip.mjs, index.mjs ni calculateTip.test.mjs porque ya cumplían exactamente el plan y pasaban los 5 casos de test; el único problema era el archivo package.json inválido a nivel de codificación (BOM), ajeno a la lógica de la feature.
- Se reescribió package.json con fs_write completo en lugar de un edit parcial para garantizar la eliminación limpia del BOM inicial.

### Technical Evidence

- node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" => 'valid json'
- node --test src/tip/calculateTip.test.mjs => TAP version 13 ... # tests 5 # pass 5 # fail 0
- npm run build => ejecuta 'mkdir -p dist' con exitCode 0

## Developer Readiness — Attempt 2

Status: ready_with_known_risks

Los 5 escenarios de prueba definidos por Planning para calculateTip pasan en verde (5/5, exitCode 0), incluyendo validaciones de monto/porcentaje inválidos, redondeo de decimales no exactos y caso monto cero. El fallo previo de instalación por BOM en package.json ya fue corregido y verificado. La implementación sigue el approach acordado: conversión a centavos enteros con Math.round antes de calcular propina y total, evitando errores de punto flotante.

Requires code changes: false

### Known Risks

- No existe un test explícito para el caso límite de redondeo de mitades exactas (.5 centavos), aunque el criterio Math.round se aplica de forma consistente y única en todo el cálculo, mitigando el riesgo técnico señalado en el plan.

### Final Notes

- calculateSplitTip queda explícitamente fuera de alcance de esta feature (r1) y se implementará en el release r2, conforme al plan.


# 8. Validation Criteria

## Scenario 1 — Monto y porcentaje enteros simples

**Input / Action**

calculateTip(100, 15)

**Expected output**

{ propina: 15, total: 115 }

## Scenario 2 — Redondeo de decimales no exactos

**Input / Action**

calculateTip(19.99, 18)

**Expected output**

{ propina: 3.6, total: 23.59 } (3.5982 redondeado a centavos mas cercanos)

## Scenario 3 — Monto en cero

**Input / Action**

calculateTip(0, 20)

**Expected output**

{ propina: 0, total: 0 }

## Scenario 4 — Monto negativo invalido

**Input / Action**

calculateTip(-10, 15)

**Expected output**

lanza Error

## Scenario 5 — Porcentaje negativo invalido

**Input / Action**

calculateTip(100, -5)

**Expected output**

lanza Error

## Scenario 6 — Entrada no numerica finita

**Input / Action**

calculateTip(100, NaN)

**Expected output**

lanza Error

## Scenario 7 — Entrada infinita

**Input / Action**

calculateTip(Infinity, 10)

**Expected output**

lanza Error


## Validation Evidence

Suite de tests unitarios sobre calculateTip cubriendo casos base, decimales limite, ceros y entradas invalidas, verificando igualdad exacta de propina y total contra valores esperados calculados en centavos.

## Planning Validation Plan

Test command: `node --test src/tip/calculateTip.test.mjs`

## Scenario 1 — Monto y porcentaje enteros simples

**Input / Action**

calculateTip(100, 15)

**Expected output**

{ propina: 15, total: 115 }

## Scenario 2 — Redondeo de decimales no exactos

**Input / Action**

calculateTip(19.99, 18)

**Expected output**

{ propina: 3.6, total: 23.59 }

## Scenario 3 — Monto en cero

**Input / Action**

calculateTip(0, 20)

**Expected output**

{ propina: 0, total: 0 }

## Scenario 4 — Monto negativo invalido

**Input / Action**

calculateTip(-10, 15)

**Expected output**

lanza Error

## Scenario 5 — Porcentaje no finito (NaN)

**Input / Action**

calculateTip(100, NaN)

**Expected output**

lanza Error

### Evidence Required

- Salida completa de node --test src/tip/calculateTip.test.mjs mostrando los 5 tests en verde (0 fallidos)

## QA Result 1 — Attempt 2

Test status: passed

Evidence: node --test src/tip/calculateTip.test.mjs -> tests 5, pass 5, fail 0, exitCode 0

### Tests Executed

- calculateTip(100, 15) devuelve { propina: 15, total: 115 }
- calculateTip(19.99, 18) devuelve { propina: 3.6, total: 23.59 }
- calculateTip(0, 20) devuelve { propina: 0, total: 0 }
- calculateTip(-10, 15) lanza Error por monto negativo
- calculateTip(100, NaN) lanza Error por porcentaje no finito

### Defects

- None.

### Observations

- El fallo previo era por un BOM en package.json que impedía instalar dependencias, no un defecto de calculateTip; ya fue corregido y verificado.

# 9. Risks

## Functional Risks

- Errores de redondeo si no se respeta estrictamente el trabajo en centavos enteros antes de convertir a decimales
- Ambiguedad en el redondeo de mitades exactas (.5 centavos) si no se fija explicitamente el criterio de Math.round en implementacion

## Technical Risks

- Errores de redondeo si el calculo intermedio no se realiza estrictamente en centavos enteros antes de convertir a decimales
- Ambiguedad en el redondeo de mitades exactas (.5 centavos) si no se fija explicitamente Math.round como criterio unico

## Quality and Readiness Risks

- Redondeo de mitades exactas (.5 centavos) depende únicamente de Math.round; no hay test explícito para ese caso límite aunque el plan lo menciona como riesgo técnico.
- No existe un test explícito para el caso límite de redondeo de mitades exactas (.5 centavos), aunque el criterio Math.round se aplica de forma consistente y única en todo el cálculo, mitigando el riesgo técnico señalado en el plan.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
