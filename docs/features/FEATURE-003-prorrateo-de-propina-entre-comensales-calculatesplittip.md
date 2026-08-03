# FEATURE-003 — Prorrateo de propina entre comensales (calculateSplitTip)

## 1. Feature Identity

- **Feature:** FEATURE-003
- **Name:** Prorrateo de propina entre comensales (calculateSplitTip)
- **Release:** r2
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Las integraciones que necesitan dividir la cuenta entre varios comensales no tienen una forma centralizada y consistente de repartir el total, lo que puede generar que la suma de las partes individuales no coincida exactamente con el total a pagar por errores de redondeo.

# 3. Functional Goal

Proveer una función calculateSplitTip(monto, porcentaje, comensales) que calcule el total a pagar (igual que calculateTip) y lo reparta entre los comensales indicados, garantizando que la suma de las partes redondeadas sea exactamente igual al total redondeado.

# 4. Scope

## Included

- Cálculo de propina y total a pagar reutilizando la lógica de Release 1
- Reparto del total entre N comensales con redondeo a 2 decimales por parte
- Algoritmo determinístico de distribución de centavos remanentes
- Validación de comensales como entero >= 1

## Excluded

- Soporte de múltiples monedas
- Persistencia o UI
- Reparto desigual o ponderado entre comensales (partes distintas por comensal)

## Future Ideas

- Permitir reparto ponderado (no equitativo) entre comensales en un release futuro

# 5. Functional Rules

1. propina = monto * porcentaje / 100
2. totalAPagar = monto + propina
3. Cada comensal recibe totalAPagar / comensales, redondeado a 2 decimales
4. La suma de todas las partes debe ser exactamente igual a totalAPagar redondeado a 2 decimales
5. Los centavos remanentes se asignan de a uno, en orden de índice de comensal, hasta agotar el remanente
6. comensales debe ser entero >= 1, de lo contrario se lanza un error
7. monto y porcentaje deben ser no negativos, de lo contrario se lanza un error (mismo criterio que calculateTip)

# 6. Estrategia Algorítmica

## Objective

Repartir un monto total entre N comensales en partes de 2 decimales cuya suma sea exactamente igual al total, sin pérdida ni sobrante de centavos.

## Inputs

- monto (number, consumo antes de propina)
- porcentaje (number, porcentaje de propina)
- comensales (integer, cantidad de personas, >=1)

## Outputs

- arreglo de comensales números, cada uno con 2 decimales, cuya suma es igual a totalAPagar redondeado a 2 decimales

## Constraints

- comensales debe ser entero mayor o igual a 1
- monto y porcentaje deben ser no negativos
- la aritmética debe evitar errores de coma flotante, por ejemplo trabajando en centavos como enteros antes de convertir a 2 decimales

## Tie Breakers

- Cuando el total no se divide exacto entre comensales, se calcula la parte base en centavos truncando hacia abajo, y el remanente de centavos se asigna uno por uno a los comensales en orden de índice ascendente (0,1,2,...) hasta agotarlo

## Deterministic Regressions

## Scenario 1 — Reparto exacto entre 2 comensales

**Input / Action**

monto=100, porcentaje=10, comensales=2

**Expected output**

[55.00, 55.00] (totalAPagar=110.00)

## Scenario 2 — Reparto con remanente de centavos entre 3 comensales

**Input / Action**

monto=100, porcentaje=10, comensales=3

**Expected output**

[36.67, 36.67, 36.66] (totalAPagar=110.00, suma exacta=110.00)

## Scenario 3 — Un solo comensal

**Input / Action**

monto=50, porcentaje=15, comensales=1

**Expected output**

[57.50]


# 7. Technical Considerations

## Planning Contribution

Función pura calculateSplitTip que reutiliza la lógica de calculateTip para propina y totalAPagar, luego reparte el total en centavos enteros (Math.floor de la parte base y asignación determinística del remanente por índice ascendente) convirtiendo a 2 decimales, garantizando que la suma de las partes iguale exactamente al total. Valida comensales entero >=1 y monto/porcentaje no negativos lanzando Error. Compila con tsc de src a dist (CommonJS).

### Affected Components

- src/splitTip.ts
- src/splitTip.test.ts
- src/tip.ts (reutilización de calculateTip para total y validaciones)

### Dependencies

- Release 1: src/tip.ts (calculateTip y criterio de validación de monto/porcentaje)
- node:test y node:assert/strict
- typescript (build tsc)

## Developer Implementation 1

Implementada calculateSplitTip(monto, porcentaje, comensales): number[] que reparte el total entre N comensales sin perder centavos. Reutiliza calculateTip para validar entradas y obtener total. Trabaja en centavos enteros (totalCentavos), calcula baseCentavos=floor(totalCentavos/comensales) y distribuye remanente de a 1 centavo por índice ascendente. Valida comensales entero >=1; monto/porcentaje validados por calculateTip. Suite de tests cubre 5 escenarios del plan con 6 tests (4a y 4b separados), todos pasando.

### Files Changed

- src/splitTip.ts
- src/splitTip.test.ts
- dist/splitTip.js
- dist/splitTip.test.js
- dist/splitTip.d.ts
- dist/splitTip.test.d.ts

### Decisions

- Reutilizar calculateTip para validación y redondeo de total, evitando duplicación
- Trabajar internamente en centavos enteros (Math.round(total*100)) para evitar errores de punto flotante
- Usar Math.floor para baseCentavos y distribuir remanente de a 1 centavo en orden ascendente de índice (determinístico)
- Patrón de testing idéntico a tip.test.ts: node:test + node:assert/strict, importación desde './splitTip'
- Compilación con tsc CommonJS a dist/ (tsconfig.json existente)

### Technical Evidence

- Salida node --test: TAP version 13, 6 tests ok, 0 fail, exitCode 0, duration 104.55ms
- Escenario 2 (remanente): suma reduce([36.67, 36.67, 36.66]) === 110.00 (aserción explícita)
- Build: npm run build exitCode 0, archivos dist/splitTip.* generados correctamente
- Archivos compilados: dist/splitTip.js (CommonJS, 1916 bytes), dist/splitTip.d.ts (TypeScript types), dist/splitTip.test.js (tests compilados)

## Developer Readiness — Attempt 1

Status: ready

Feature f2 (calculateSplitTip) completada exitosamente. QA ejecutó node --test dist/splitTip.test.js sobre el output compilado y obtuvo 6/6 tests passed con exitCode 0. Todos los criterios del plan validados: reparto determinístico en centavos, preservación de precisión monetaria (suma de partes = total), validaciones de entrada (comensales entero >= 1, monto/porcentaje no negativos), y reutilización de lógica de Release 1. Duración 109.45ms. No hay defects ni quality risks reportados.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- El plan definía 5 escenarios; la implementación los cubrió con 6 tests (Escenario 4 dividido en 4a y 4b para mayor granularidad), incrementando cobertura sin perder completitud.
- stderr vacío, sin advertencias ni errores en tiempo de ejecución.
- La implementación preservó exactitud monetaria en escenarios con remanente de centavos mediante trabajo interno en centavos enteros antes de conversión a 2 decimales.
- Feature lista para integración en Release r2.


# 8. Validation Criteria

## Scenario 1 — Reparto exacto sin remanente

**Input / Action**

monto=100, porcentaje=10, comensales=2

**Expected output**

Devuelve [55.00, 55.00]

## Scenario 2 — Reparto con centavos remanentes

**Input / Action**

monto=100, porcentaje=10, comensales=3

**Expected output**

Devuelve [36.67, 36.67, 36.66], cuya suma es exactamente 110.00

## Scenario 3 — Comensales inválido (cero)

**Input / Action**

monto=100, porcentaje=10, comensales=0

**Expected output**

Lanza un error de validación

## Scenario 4 — Comensales no entero

**Input / Action**

monto=100, porcentaje=10, comensales=2.5

**Expected output**

Lanza un error de validación

## Scenario 5 — Monto o porcentaje negativo

**Input / Action**

monto=-10, porcentaje=10, comensales=2

**Expected output**

Lanza un error de validación, igual que en calculateTip


## Validation Evidence

Se validará mediante tests unitarios que verifiquen: (a) que la suma de las partes devueltas coincide exactamente con el total a pagar redondeado a 2 decimales en casos con y sin remanente de centavos, (b) que los errores de entrada inválida se lanzan correctamente, y (c) casos límite como comensales=1.

## Planning Validation Plan

Test command: `node --test dist/splitTip.test.js`

## Scenario 1 — Reparto exacto sin remanente

**Input / Action**

calculateSplitTip(100, 10, 2)

**Expected output**

Devuelve [55.00, 55.00]; suma de partes = 110.00

## Scenario 2 — Reparto con centavos remanentes

**Input / Action**

calculateSplitTip(100, 10, 3)

**Expected output**

Devuelve [36.67, 36.67, 36.66]; la suma exacta de las partes es 110.00

## Scenario 3 — Caso límite un comensal

**Input / Action**

calculateSplitTip(50, 15, 1)

**Expected output**

Devuelve [57.50]

## Scenario 4 — Comensales inválido (cero y no entero)

**Input / Action**

calculateSplitTip(100, 10, 0) y calculateSplitTip(100, 10, 2.5)

**Expected output**

Ambas invocaciones lanzan Error de validación

## Scenario 5 — Monto negativo

**Input / Action**

calculateSplitTip(-10, 10, 2)

**Expected output**

Lanza Error de validación (mismo criterio que calculateTip)

### Evidence Required

- Salida de node --test con los 5 tests en pass
- Aserción explícita de que la suma de las partes del escenario con remanente es exactamente 110.00

## QA Result 1 — Attempt 1

Test status: passed

Evidence: Comando node --test dist/splitTip.test.js ejecutado sobre output compilado en dist/splitTip.test.js. TAP output: exitCode 0, timedOut false, 6 tests, 6 passed, 0 failed, 0 skipped. Todos los escenarios del test plan validados incluyendo reparto determinístico con remanentes de centavos, validaciones de entrada (comensales entero >= 1, monto/porcentaje no negativos), y preservación de precisión monetaria (suma de partes = total).

### Tests Executed

- Escenario 1: Reparto exacto sin remanente
- Escenario 2: Reparto con centavos remanentes
- Escenario 3: Caso límite un comensal
- Escenario 4a: Comensales inválido (cero)
- Escenario 4b: Comensales inválido (no entero)
- Escenario 5: Monto negativo

### Defects

- None.

### Observations

- El Escenario 4 del plan fue dividido en tests 4a y 4b para validar separadamente comensales cero y comensales no entero (2.5)
- La implementación desglosó 5 escenarios en 6 tests, lo que aumenta granularidad sin perder cobertura
- El stderr está vacío, sin advertencias ni errores en tiempo de ejecución
- Duración de ejecución 109.45ms dentro de rango normal
- Aserciones incluyen validación de precisión de centavos y suma exacta de partes en escenarios con remanente

# 9. Risks

## Functional Risks

- Errores de precisión de punto flotante en JavaScript/TypeScript al operar con decimales; se mitiga trabajando internamente en centavos (enteros) antes de convertir a 2 decimales.
- Ambigüedad futura si se requiere reparto no equitativo entre comensales, actualmente fuera de alcance.

## Technical Risks

- Errores de precisión de punto flotante al operar con decimales; se mitiga trabajando internamente en centavos enteros antes de convertir a 2 decimales
- FEATURE-029: la ruta de test declarada (dist/splitTip.test.js) debe existir tras el build; Developer debe crear src/splitTip.test.ts para que tsc lo produzca en dist
- Desalineación con la lógica de Release 1 si no se reutiliza calculateTip para el redondeo del total; se mitiga reutilizando explícitamente esa función

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
