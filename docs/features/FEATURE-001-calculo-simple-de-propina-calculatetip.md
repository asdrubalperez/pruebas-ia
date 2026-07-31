# FEATURE-001 — Cálculo simple de propina (calculateTip)

## 1. Feature Identity

- **Feature:** FEATURE-001
- **Name:** Cálculo simple de propina (calculateTip)
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Se necesita una función de cálculo de propina confiable que evite los errores de redondeo típicos de la aritmética de punto flotante al operar con montos monetarios y porcentajes decimales.

# 3. Functional Goal

Proveer calculateTip(monto, porcentaje) como función pura, exportada desde el punto de entrada único del módulo, que retorne propina y total exactos con 2 decimales, validando entradas inválidas mediante excepción.

# 4. Scope

## Included

- Cálculo de propina y total a partir de monto y porcentaje
- Validación de monto y porcentaje como números finitos no negativos
- Conversión interna a centavos enteros para el cálculo
- Redondeo del resultado final a 2 decimales
- Cobertura de tests unitarios para casos límite de redondeo

## Excluded

- Reparto de propina entre comensales (calculateSplitTip)
- Soporte de monedas múltiples
- Persistencia de datos
- Interfaz de usuario
- Lógica de facturación más allá del cálculo puro de propina

## Future Ideas

- calculateSplitTip(monto, porcentaje, comensales) con reparto por método de mayor resto, planificado para Release 2

# 5. Functional Rules

1. monto y porcentaje deben ser números finitos y no negativos; cualquier valor que no cumpla esto (NaN, Infinity, negativos, no numéricos) provoca que la función lance una excepción
2. el cálculo se realiza convirtiendo monto a centavos enteros, aplicando el porcentaje sobre esos centavos y redondeando al centavo más cercano para obtener la propina en centavos
3. el total en centavos es la suma de monto en centavos más propina en centavos
4. el resultado expuesto convierte los centavos internos a un número decimal con exactamente 2 decimales, tanto para propina como para total
5. porcentaje 0 produce propina 0.00 y total igual al monto
6. monto 0 produce propina 0.00 y total 0.00
7. la función no produce efectos secundarios ni depende de estado externo

# 6. Estrategia Algorítmica

## Objective

Calcular propina y total exactos evitando errores de redondeo de punto flotante, operando toda la aritmética monetaria en centavos enteros

## Inputs

- monto: number (unidades monetarias, puede tener decimales)
- porcentaje: number (valor entero o decimal que representa el porcentaje, ej. 15 significa 15%)

## Outputs

- propina: number con 2 decimales exactos
- total: number con 2 decimales exactos

## Constraints

- toda la aritmética intermedia debe realizarse sobre enteros (centavos), nunca sobre floats decimales directos
- el redondeo a centavo debe aplicarse una sola vez, al calcular la propina en centavos, no en pasos intermedios adicionales
- monto y porcentaje deben validarse como finitos y no negativos antes de cualquier cálculo

## Tie Breakers

- en caso de que el valor a redondear caiga exactamente en .5 de centavo, se redondea hacia arriba (round half up), consistente con el comportamiento estándar de redondeo monetario

## Deterministic Regressions

## Scenario 1 — cálculo estándar con porcentaje entero

**Input / Action**

monto=10.00, porcentaje=15

**Expected output**

propina=1.50, total=11.50

## Scenario 2 — monto con decimales que produce error de redondeo en punto flotante directo

**Input / Action**

monto=19.99, porcentaje=18

**Expected output**

propina=3.60, total=23.59

## Scenario 3 — porcentaje cero

**Input / Action**

monto=50.00, porcentaje=0

**Expected output**

propina=0.00, total=50.00

## Scenario 4 — monto cero

**Input / Action**

monto=0, porcentaje=20

**Expected output**

propina=0.00, total=0.00


# 7. Technical Considerations

## Planning Contribution

Implementar calculateTip como función pura en TypeScript usando aritmética de centavos enteros (Math.round para conversión y redondeo round-half-up), validando monto y porcentaje como finitos y no negativos antes de cualquier cálculo, lanzando excepción en caso contrario. Compilar con tsc hacia dist/ para que node --test corra sobre JavaScript nativo.

### Affected Components

- src/tip/index.ts
- src/tip/index.test.ts
- package.json
- tsconfig.json

### Dependencies

- typescript (devDependency)

## Developer Implementation 1

Se creó el andamiaje del proyecto (package.json con script build de tsc, tsconfig.json con rootDir=src/outDir=dist/strict=true) y se implementó calculateTip en TypeScript usando aritmética de centavos enteros con un único paso de redondeo round-half-up para evitar errores de punto flotante, validando monto y porcentaje como números finitos no negativos y lanzando Error en caso contrario. Se creó el archivo de test src/tip/index.test.ts con los 5 casos exactos declarados por Planning usando node:test y node:assert/strict.

### Files Changed

- package.json
- tsconfig.json
- src/tip/index.ts
- src/tip/index.test.ts

### Decisions

- Usar Math.round(monto*100) para convertir a centavos y Math.round((montoCentavos*porcentaje)/100) como único paso de redondeo de la propina, evitando aritmética decimal directa
- Convertir centavos de vuelta a decimal con Number((cents/100).toFixed(2)) para garantizar exactamente 2 decimales sin artefactos de punto flotante en el resultado final
- Validar monto y porcentaje con Number.isFinite(x) && x>=0 antes de cualquier cálculo, lanzando new Error con mensaje descriptivo si la validación falla
- Configurar tsconfig.json con module commonjs para compatibilidad directa con node --test sobre el artefacto compilado en dist/
- Agregar flags de tipado estricto adicionales (noImplicitAny, noImplicitReturns, noUncheckedIndexedAccess) para reforzar RF2 sin alterar el comportamiento funcional

### Technical Evidence

- src/tip/index.ts implementa calculateTip(monto, porcentaje): TipResult exportada, con validación y cálculo íntegramente sobre enteros
- src/tip/index.test.ts contiene 5 tests con node:test que cubren exactamente los 5 escenarios declarados en el plan (10.00/15%, 19.99/18%, 50.00/0%, 0/20%, -5/10% con assert.throws)
- tsconfig.json declara outDir=dist y rootDir=src, coincidiendo con la ruta dist/tip/index.test.js que exige COMANDO_TEST

## Developer Implementation 2

Se resolvió el fallo de build agregando la devDependency @types/node (necesaria para que TypeScript reconozca los módulos ambientales node:test y node:assert/strict usados en el archivo de test) y sincronizando package-lock.json. Se verificó localmente que npm run build compila sin errores y que node --test dist/tip/index.test.js pasa los 5 casos exigidos por Planning para la feature f1 (calculateTip).

### Files Changed

- package.json
- package-lock.json

### Decisions

- Se diagnosticó el buildFailureReason ejecutando tsc manualmente, obteniendo errores TS2307 (Cannot find module 'node:test'/'node:assert/strict') por falta de tipos ambientales de Node.
- Se agregó @types/node como devDependency en vez de modificar tsconfig.json con un campo 'types' explícito, dejando que TypeScript incluya automáticamente los tipos disponibles en node_modules/@types, que es el comportamiento por defecto y menos invasivo.
- Se instaló la dependencia localmente con un directorio de cache npm temporal (luego eliminado del workspace) únicamente para poder verificar el build antes de entregar, sin dejar artefactos de cache en el repositorio.
- No se modificó la lógica de negocio de calculateTip ni el archivo de test, ya que el rechazo fue estrictamente de build/tipos, no de comportamiento ni de casos de prueba.

### Technical Evidence

- npm run build -> exitCode 0, sin salida de errores tsc
- node --test dist/tip/index.test.js -> TAP: 5 tests, # pass 5, # fail 0, # cancelled 0, # skipped 0

## Developer Readiness — Attempt 2

Status: ready

Los 5 casos de prueba definidos por Planning para calculateTip (cálculo estándar, precisión con punto flotante, porcentaje cero, monto cero, y monto negativo inválido) pasaron en verde según QA, con exitCode 0 y sin fallos, cancelaciones ni omisiones. El build compiló correctamente y el COMANDO_TEST se ejecutó tal como fue declarado por Planning.

Requires code changes: false

### Known Risks

- El plan solo cubre 5 escenarios explícitos; no hay evidencia de cobertura para porcentajes no enteros distintos de los casos dados, montos muy grandes, ni validación de porcentaje negativo o no finito (NaN/Infinity) más allá del caso de monto negativo, según observó QA

### Final Notes

- Feature f1 (calculateTip) lista para considerarse completa según los criterios de aceptación definidos por Planning


# 8. Validation Criteria

## Scenario 1 — cálculo estándar

**Input / Action**

monto=10.00, porcentaje=15

**Expected output**

la función retorna propina=1.50 y total=11.50

## Scenario 2 — monto con decimales propensos a error de punto flotante

**Input / Action**

monto=19.99, porcentaje=18

**Expected output**

la función retorna propina=3.60 y total=23.59, sin desviación por redondeo de punto flotante

## Scenario 3 — porcentaje en cero

**Input / Action**

monto=50.00, porcentaje=0

**Expected output**

la función retorna propina=0.00 y total=50.00

## Scenario 4 — monto en cero

**Input / Action**

monto=0, porcentaje=20

**Expected output**

la función retorna propina=0.00 y total=0.00

## Scenario 5 — monto negativo

**Input / Action**

monto=-5, porcentaje=10

**Expected output**

la función lanza una excepción y no retorna resultado

## Scenario 6 — porcentaje negativo

**Input / Action**

monto=10, porcentaje=-5

**Expected output**

la función lanza una excepción y no retorna resultado

## Scenario 7 — monto no finito

**Input / Action**

monto=Infinity, porcentaje=10

**Expected output**

la función lanza una excepción y no retorna resultado

## Scenario 8 — porcentaje NaN

**Input / Action**

monto=10, porcentaje=NaN

**Expected output**

la función lanza una excepción y no retorna resultado


## Validation Evidence

Se valida mediante suite de tests unitarios (framework a definir por Development/Planning, ej. Jest o Vitest) que ejecute cada uno de los escenarios de validationCriteria, verificando en particular que los casos de monto/porcentaje con decimales no produzcan desviaciones por errores de redondeo de punto flotante, y que las entradas inválidas produzcan siempre una excepción capturable.

## Planning Validation Plan

Test command: `node --test dist/tip/index.test.js`

## Scenario 1 — cálculo estándar con porcentaje entero

**Input / Action**

calculateTip(10.00, 15)

**Expected output**

{ propina: 1.50, total: 11.50 }

## Scenario 2 — precisión exacta evitando error de punto flotante

**Input / Action**

calculateTip(19.99, 18)

**Expected output**

{ propina: 3.60, total: 23.59 }

## Scenario 3 — porcentaje cero

**Input / Action**

calculateTip(50.00, 0)

**Expected output**

{ propina: 0.00, total: 50.00 }

## Scenario 4 — monto cero

**Input / Action**

calculateTip(0, 20)

**Expected output**

{ propina: 0.00, total: 0.00 }

## Scenario 5 — monto negativo inválido

**Input / Action**

calculateTip(-5, 10)

**Expected output**

la función lanza una excepción

### Evidence Required

- salida de node --test dist/tip/index.test.js mostrando los 5 casos en verde (pass), sin errores ni tests omitidos

## QA Result 1 — Attempt 2

Test status: passed

Evidence: node --test dist/tip/index.test.js -> exitCode 0, TAP: # tests 5, # pass 5, # fail 0, # cancelled 0, # skipped 0, # todo 0, # duration_ms 99.345836

### Tests Executed

- Caso 1 - Cálculo estándar con porcentaje entero
- Caso 2 - Precisión exacta en caso propenso a error de punto flotante
- Caso 3 - Porcentaje cero
- Caso 4 - Monto cero
- Caso 5 - Entrada inválida (monto negativo)

### Defects

- None.

### Observations

- Todos los casos definidos por Planning quedaron en verde sin omisiones ni cancelaciones
- No se registró salida en stderr

# 9. Risks

## Functional Risks

- Si la implementación no aplica la conversión a centavos de forma consistente en todos los pasos intermedios, podrían reaparecer errores de redondeo de punto flotante que este release busca eliminar.
- La regla de desempate de redondeo (round half up) no fue explicitada por Architect; se asume el comportamiento estándar monetario, pero debería confirmarse en Development si surge un caso de negocio que requiera otra convención (ej. banker's rounding).

## Technical Risks

- Si el redondeo round-half-up no se implementa correctamente en el paso único de conversión a centavos, podrían reaparecer desviaciones de punto flotante en montos como 19.99 con porcentajes no enteros
- Si el build (tsc) no está correctamente configurado con outDir=dist coincidente con la ruta declarada en COMANDO_TEST, QA no podrá localizar el archivo compilado

## Quality and Readiness Risks

- El plan solo cubre 5 escenarios explícitos; no hay evidencia de cobertura para porcentajes no enteros distintos de los casos dados, montos muy grandes, ni validación de porcentaje negativo o no finito (NaN/Infinity) más allá del caso de monto negativo
- El plan solo cubre 5 escenarios explícitos; no hay evidencia de cobertura para porcentajes no enteros distintos de los casos dados, montos muy grandes, ni validación de porcentaje negativo o no finito (NaN/Infinity) más allá del caso de monto negativo, según observó QA

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
