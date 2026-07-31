# FEATURE-004 — Cálculo simple de propina (calculateTip)

## 1. Feature Identity

- **Feature:** FEATURE-004
- **Name:** Cálculo simple de propina (calculateTip)
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Se necesita una función interna reutilizable que calcule de forma exacta la propina y el total de una cuenta, evitando los errores de redondeo típicos de la aritmética de punto flotante al operar con montos monetarios.

# 3. Functional Goal

Proveer calculateTip(monto, porcentaje) como función pura, con validación de entradas y cálculo determinístico en centavos enteros, que sirva además como base reutilizable para el reparto entre comensales del release 2 sin requerir modificaciones futuras.

# 4. Scope

## Included

- Implementación de calculateTip(monto, porcentaje) en el módulo src/tip/
- Validación tipada de monto (finito, >0)
- Validación tipada de porcentaje (finito, >=0)
- Conversión a centavos enteros antes de operar y reconversión a 2 decimales al final
- Redondeo half-up documentado en código
- Invariante propina + monto = total exacto

## Excluded

- calculateSplitTip y reparto entre comensales (release 2)
- Persistencia de datos
- Interfaz de usuario
- Soporte de múltiples monedas
- Reparto desigual o proporcional entre comensales
- Integración con sistemas externos

## Future Ideas

- calculateSplitTip(monto, porcentaje, comensales) que reutilice calculateTip y reparta el total en centavos mediante método de mayor resto (release 2)

# 5. Functional Rules

1. calculateTip es una función pura sin efectos secundarios, logging ni I/O
2. monto debe ser finito y >0, de lo contrario lanza un error tipado (InvalidAmountError)
3. porcentaje debe ser finito y >=0, de lo contrario lanza un error tipado (InvalidPercentageError)
4. Toda operación aritmética se realiza en centavos enteros; la conversión a 2 decimales ocurre solo al final
5. El redondeo de la propina usa criterio half-up y debe quedar documentado en el código
6. propina + monto debe ser exactamente igual a total, sin residuos de punto flotante, para toda entrada válida
7. Con porcentaje = 0, propina debe ser exactamente 0 y total debe ser exactamente igual a monto
8. La función no debe depender de calculateSplitTip ni de ninguna lógica del release 2

# 6. Estrategia Algorítmica

## Objective

Convertir monto a centavos enteros, calcular la propina proporcional al porcentaje aplicando redondeo half-up sobre el resultado en centavos, y reconvertir propina y total a formato monetario con 2 decimales sin pérdida ni arrastre de error de punto flotante.

## Inputs

- monto (number, unidad monetaria, finito, >0)
- porcentaje (number, finito, >=0)

## Outputs

- propina (number, 2 decimales)
- total (number, 2 decimales)

## Constraints

- Toda operación aritmética debe realizarse en centavos enteros
- El redondeo debe ser half-up y estar documentado en el código
- propina + monto debe ser exactamente igual a total, sin residuos de punto flotante
- La función no debe producir efectos secundarios, logging ni I/O

## Tie Breakers

- En caso de fracción exacta de 0.5 centavos en el cálculo de la propina, redondear hacia arriba (half-up)

## Deterministic Regressions

## Scenario 1 — porcentaje 0 no debe alterar el monto

**Input / Action**

monto=50.00, porcentaje=0

**Expected output**

propina=0.00, total=50.00


# 7. Technical Considerations

## Planning Contribution

Función pura que convierte monto a centavos enteros, calcula la propina proporcional al porcentaje con redondeo half-up documentado en código, y calcula el total sumando enteros de centavos antes de reconvertir a 2 decimales, evitando así cualquier residuo de punto flotante en el invariante propina+monto=total.

### Affected Components

- src/tip/calculateTip.mjs
- src/tip/errors.mjs
- src/tip/calculateTip.test.mjs

### Dependencies

- Ninguna dependencia externa; no debe importar ni referenciar calculateSplitTip ni lógica del release 2

## Developer Implementation 1

Implementada la función pura calculateTip(monto, porcentaje) que valida monto y porcentaje lanzando errores tipados (InvalidAmountError, InvalidPercentageError), convierte el monto a centavos enteros con Math.round, calcula la propina con redondeo half-up (Math.floor(exacta + 0.5)) documentado en comentarios como decisión de diseño explícita, y obtiene el total sumando centavos enteros antes de reconvertir a 2 decimales, garantizando por construcción el invariante propina+monto=total sin residuos de punto flotante. Se agregó el archivo de test en la ruta exacta indicada por Planning, ejecutable con el comando declarado, cubriendo los 5 escenarios (más sub-casos de NaN/Infinity) y validado con salida en verde.

### Files Changed

- src/tip/errors.mjs
- src/tip/calculateTip.mjs
- src/tip/calculateTip.test.mjs

### Decisions

- Redondeo half-up implementado como Math.floor(propinaCentavosExacta + 0.5), documentado explícitamente en el código como decisión de diseño no especificada por negocio
- Conversión a centavos enteros con Math.round antes de cualquier cálculo, para evitar arrastre binario de punto flotante
- Total calculado sumando centavos enteros (montoCentavos + propinaCentavos) y reconvirtiendo una sola vez, en lugar de sumar montos en punto flotante ya reconvertidos, para garantizar el invariante propina+monto=total por construcción
- No se importó ni referenció calculateSplitTip ni ninguna lógica de releases futuros, respetando el alcance exacto del plan

### Technical Evidence

- Salida completa de `node --test src/tip/calculateTip.test.mjs`: TAP version 13, 5 subtests ok (Cálculo simple con porcentaje entero, Porcentaje 0, Redondeo límite de medio centavo half-up, Monto inválido lanza InvalidAmountError, Porcentaje inválido lanza InvalidPercentageError), resumen final '# tests 5 / # pass 5 / # fail 0 / # cancelled 0 / # skipped 0 / # todo 0'

## Developer Readiness — Attempt 1

Status: ready

QA validó los 5 casos de prueba de calculateTip en verde (cálculo simple, porcentaje 0, redondeo half-up de medio centavo, InvalidAmountError para monto negativo/NaN/Infinity, InvalidPercentageError para porcentaje negativo), sin defectos reportados y con el invariante propina+monto=total garantizado por construcción mediante aritmética de centavos enteros.

Requires code changes: false

### Known Risks

- Si el futuro calculateSplitTip del release 2 no reutiliza la lógica de conversión a centavos enteros, podría duplicarse código o introducirse inconsistencias de redondeo entre features

### Final Notes

- Implementación y tests en src/tip/calculateTip.mjs, src/tip/errors.mjs y src/tip/calculateTip.test.mjs quedan estables en el HEAD sha 55e9980a25e78d90f066ca4c021a5bf381b0fd19


# 8. Validation Criteria

## Scenario 1 — Cálculo simple con porcentaje entero

**Input / Action**

monto=100.00, porcentaje=15

**Expected output**

propina=15.00, total=115.00

## Scenario 2 — Porcentaje 0

**Input / Action**

monto=50.00, porcentaje=0

**Expected output**

propina=0.00, total=50.00

## Scenario 3 — Redondeo límite de medio centavo (half-up)

**Input / Action**

monto=1.00, porcentaje=12.5

**Expected output**

propina=0.13, total=1.13

## Scenario 4 — Monto inválido negativo

**Input / Action**

monto=-5, porcentaje=10

**Expected output**

Lanza InvalidAmountError, no retorna valor

## Scenario 5 — Monto no finito

**Input / Action**

monto=NaN o Infinity, porcentaje=10

**Expected output**

Lanza InvalidAmountError, no retorna valor

## Scenario 6 — Porcentaje inválido negativo

**Input / Action**

monto=10, porcentaje=-1

**Expected output**

Lanza InvalidPercentageError, no retorna valor


## Validation Evidence

Suite de tests unitarios que cubra todos los escenarios anteriores, verificando que la aritmética se realiza en centavos enteros, que el invariante propina + monto = total se cumple exactamente mediante comparación estricta de valores (sin tolerancia de punto flotante), y que las entradas inválidas lanzan los errores tipados esperados.

## Planning Validation Plan

Test command: `node --test src/tip/calculateTip.test.mjs`

## Scenario 1 — Cálculo simple con porcentaje entero

**Input / Action**

calculateTip(100.00, 15)

**Expected output**

{ propina: 15.00, total: 115.00 }

## Scenario 2 — Porcentaje 0

**Input / Action**

calculateTip(50.00, 0)

**Expected output**

{ propina: 0.00, total: 50.00 }, y total === monto

## Scenario 3 — Redondeo límite de medio centavo (half-up)

**Input / Action**

calculateTip(1.00, 12.5)

**Expected output**

{ propina: 0.13, total: 1.13 }

## Scenario 4 — Monto inválido (negativo, NaN, Infinity)

**Input / Action**

calculateTip(-5, 10) / calculateTip(NaN, 10) / calculateTip(Infinity, 10)

**Expected output**

Lanza InvalidAmountError en los tres casos

## Scenario 5 — Porcentaje inválido negativo

**Input / Action**

calculateTip(10, -1)

**Expected output**

Lanza InvalidPercentageError

### Evidence Required

- Salida completa y en verde de node --test src/tip/calculateTip.test.mjs cubriendo los 5 escenarios, sin skips

## QA Result 1 — Attempt 1

Test status: passed

Evidence: node --test src/tip/calculateTip.test.mjs -> # tests 5, # pass 5, # fail 0, # skipped 0, exitCode 0

### Tests Executed

- Cálculo simple con porcentaje entero
- Porcentaje 0
- Redondeo límite de medio centavo (half-up)
- Monto inválido lanza InvalidAmountError
- Porcentaje inválido lanza InvalidPercentageError

### Defects

- None.

### Observations

- El invariante propina+monto=total se valida por construcción mediante aritmética de centavos enteros
- El criterio de redondeo half-up quedó documentado en el código como decisión de diseño

# 9. Risks

## Functional Risks

- El criterio de redondeo half-up es una decisión de diseño no especificada por negocio; si el negocio lo cuestiona en el futuro, requerirá revisión explícita.
- Si la lógica de redondeo no se expone de forma reutilizable, el release 2 (calculateSplitTip) podría duplicarla en vez de reutilizarla, violando el contrato de dependencia definido por Architect.

## Technical Risks

- El criterio de redondeo half-up es una decisión de diseño no especificada explícitamente por negocio; debe quedar documentado en el código para evitar ambigüedad futura
- Si la implementación no aísla correctamente la lógica de centavos, el futuro calculateSplitTip del release 2 podría no poder reutilizarla sin duplicación

## Quality and Readiness Risks

- Si en el futuro calculateSplitTip del release 2 no reutiliza esta lógica de centavos, podría duplicarse código o introducirse inconsistencias de redondeo
- Si el futuro calculateSplitTip del release 2 no reutiliza la lógica de conversión a centavos enteros, podría duplicarse código o introducirse inconsistencias de redondeo entre features

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
