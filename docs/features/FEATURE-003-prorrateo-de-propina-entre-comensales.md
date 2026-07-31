# FEATURE-003 — Prorrateo de propina entre comensales

## 1. Feature Identity

- **Feature:** FEATURE-003
- **Name:** Prorrateo de propina entre comensales
- **Release:** r2
- **Priority:** P1
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Al dividir la cuenta entre varios comensales, un reparto ingenuo por division simple puede perder o sobrar centavos respecto al total real, generando descuadres.

# 3. Functional Goal

Proveer calculateSplitTip(monto, porcentaje, comensales) que reparta el total en montos individuales cuya suma sea exactamente igual al total, usando el metodo de mayor resto (largest remainder method).

# 4. Scope

## Included

- Funcion calculateSplitTip con firma (monto: number, porcentaje: number, comensales: number) => { montos: number[]; total: number }
- Calculo de total reutilizando la misma logica de redondeo en centavos que calculateTip
- Distribucion de centavos residuales por metodo de mayor resto para que suma(montos) === total exactamente
- Validacion de comensales como entero positivo (minimo 1), ademas de las validaciones de monto y porcentaje ya definidas para calculateTip

## Excluded

- Modificacion de la firma o comportamiento de calculateTip
- Reparto desigual por criterios distintos al mayor resto (p. ej. por consumo individual)
- Persistencia, UI o integracion con modulos consumidores existentes
- Soporte de multiples monedas

## Future Ideas

- None.

# 5. Functional Rules

1. total se calcula igual que en calculateTip (monto + propina), en centavos enteros
2. montos.length debe ser igual a comensales
3. La suma exacta de montos (en centavos) debe ser igual al total (en centavos), sin perdida ni sobrante
4. El reparto usa el metodo de mayor resto: parte entera en centavos por comensal, luego se asignan los centavos residuales uno por uno a los comensales con mayor resto de la division
5. Si monto o porcentaje no son numeros finitos no negativos, lanza Error (misma regla que calculateTip)
6. Si comensales no es un entero positivo (menor a 1, decimal, NaN o Infinity), lanza Error
7. calculateSplitTip no reemplaza ni altera calculateTip; ambas coexisten en el mismo modulo

# 6. Estrategia Algorítmica

## Objective

Repartir un total monetario entero (en centavos) entre N comensales de forma que cada comensal reciba un monto redondeado a centavos y la suma total no pierda ni sobre centavos respecto al total original.

## Inputs

- totalCentavos: entero no negativo
- comensales: entero positivo (>=1)

## Outputs

- montosCentavos: arreglo de enteros de longitud comensales cuya suma sea exactamente totalCentavos

## Constraints

- La suma de montosCentavos debe ser exactamente igual a totalCentavos
- Cada monto individual debe ser un entero no negativo en centavos antes de convertir a decimales
- El orden de asignacion de centavos residuales debe ser determinista para las mismas entradas

## Tie Breakers

- Cuando dos o mas comensales tienen el mismo resto de division, se asigna el centavo residual en orden de indice ascendente (primero el comensal de menor indice)

## Deterministic Regressions

## Scenario 1 — Division exacta sin residuo

**Input / Action**

calculateSplitTip(90, 10, 3) -> total=99, 99/3=33 exacto

**Expected output**

{ montos: [33, 33, 33], total: 99 }

## Scenario 2 — Division con residuo repartido por mayor resto

**Input / Action**

calculateSplitTip(100, 10, 3) -> total=110

**Expected output**

{ montos: [36.67, 36.67, 36.66], total: 110 } (suma exacta 110.00, orden de asignacion por indice ascendente en empate)

## Scenario 3 — Un solo comensal

**Input / Action**

calculateSplitTip(100, 10, 1)

**Expected output**

{ montos: [110], total: 110 }


# 7. Technical Considerations

## Planning Contribution

Implementar calculateSplitTip como funcion pura en un nuevo archivo, reutilizando la misma logica de redondeo en centavos que calculateTip para obtener totalCentavos (monto+propina), luego repartir totalCentavos entre comensales con el metodo de mayor resto: parte entera por Math.floor(totalCentavos/comensales) y asignacion de centavos residuales uno por uno ordenando por mayor resto y, en empate, por indice ascendente. Convertir el arreglo final de centavos a decimales antes de retornar. Exportar la nueva funcion desde index.mjs sin modificar calculateTip.mjs.

### Affected Components

- src/tip/calculateSplitTip.mjs
- src/tip/index.mjs
- src/tip/calculateSplitTip.test.mjs

### Dependencies

- src/tip/calculateTip.mjs (misma regla de redondeo y validacion de monto/porcentaje, sin alterar su codigo)

## Developer Implementation 1

Se creó calculateSplitTip.mjs con validaciones de monto/porcentaje (iguales a calculateTip) y comensales (entero >=1), cálculo de totalCentavos reutilizando la lógica de redondeo de calculateTip, reparto por método de mayor resto (base=floor(totalCentavos/comensales), residuo asignado por orden de resto descendente y desempate por índice ascendente), verificación de invariante de suma exacta, y conversión final a decimales. Se exportó desde index.mjs sin alterar calculateTip.mjs, y se creó el archivo de test con los 5 casos declarados por Planning.

### Files Changed

- src/tip/calculateSplitTip.mjs
- src/tip/index.mjs
- src/tip/calculateSplitTip.test.mjs

### Decisions

- Como totalCentavos/comensales es el mismo valor para todos los índices, el resto fraccionario es idéntico para todos los comensales; el ordenamiento por resto descendente resulta en un empate total, resuelto por índice ascendente, lo que asigna el centavo extra a los primeros 'residuo' comensales por índice, consistente con el caso de prueba 2.
- Se agregó una verificación interna (throw Error) de que la suma de montosCentavos sea exactamente igual a totalCentavos como salvaguarda del invariante mencionado en el plan, sin que esto afecte los casos de prueba declarados.
- No se modificó calculateTip.mjs ni su archivo de test, cumpliendo la restricción de dependencias del plan.

### Technical Evidence

- Implementación revisada manualmente contra los 5 escenarios: (90,10,3)->{montos:[33,33,33],total:99}; (100,10,3)->{montos:[36.67,36.67,36.66],total:110}; (100,10,1)->{montos:[110],total:110}; (100,10,0) lanza Error; (-5,10,2) lanza Error. El Orquestador ejecutará 'node --test src/tip/calculateSplitTip.test.mjs' para validación de build/test.

## Developer Readiness — Attempt 1

Status: ready

Los 5 casos de prueba definidos por Planning para calculateSplitTip pasaron exitosamente (5 pass, 0 fail, exitCode 0) según el resultado de QA. calculateTip.mjs no fue alterado y la exportación en index.mjs sigue el patrón esperado sin tocar el export previo.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- node --test src/tip/calculateSplitTip.test.mjs -> exitCode 0, 5 pass, 0 fail
- QA no reportó defectos ni riesgos de calidad


# 8. Validation Criteria

## Scenario 1 — Reparto exacto sin residuo

**Input / Action**

calculateSplitTip(90, 10, 3)

**Expected output**

{ montos: [33, 33, 33], total: 99 }

## Scenario 2 — Reparto con residuo de centavos

**Input / Action**

calculateSplitTip(100, 10, 3)

**Expected output**

{ montos: [36.67, 36.67, 36.66], total: 110 } con suma exacta de montos igual a 110

## Scenario 3 — Un solo comensal

**Input / Action**

calculateSplitTip(100, 10, 1)

**Expected output**

{ montos: [110], total: 110 }

## Scenario 4 — Comensales igual a cero

**Input / Action**

calculateSplitTip(100, 10, 0)

**Expected output**

lanza Error

## Scenario 5 — Comensales no entero

**Input / Action**

calculateSplitTip(100, 10, 2.5)

**Expected output**

lanza Error

## Scenario 6 — Monto negativo invalido

**Input / Action**

calculateSplitTip(-5, 10, 2)

**Expected output**

lanza Error


## Validation Evidence

Suite de tests unitarios sobre calculateSplitTip verificando que la suma de montos coincide exactamente con el total en casos con y sin residuo, que el numero de elementos de montos coincide con comensales, y que las entradas invalidas (monto, porcentaje o comensales) lanzan Error.

## Planning Validation Plan

Test command: `node --test src/tip/calculateSplitTip.test.mjs`

## Scenario 1 — Reparto exacto sin residuo

**Input / Action**

calculateSplitTip(90, 10, 3)

**Expected output**

deepStrictEqual({ montos: [33, 33, 33], total: 99 })

## Scenario 2 — Reparto con residuo y desempate por indice ascendente

**Input / Action**

calculateSplitTip(100, 10, 3)

**Expected output**

deepStrictEqual({ montos: [36.67, 36.67, 36.66], total: 110 })

## Scenario 3 — Un solo comensal

**Input / Action**

calculateSplitTip(100, 10, 1)

**Expected output**

deepStrictEqual({ montos: [110], total: 110 })

## Scenario 4 — Comensales invalido (cero)

**Input / Action**

calculateSplitTip(100, 10, 0)

**Expected output**

lanza Error

## Scenario 5 — Monto invalido (negativo)

**Input / Action**

calculateSplitTip(-5, 10, 2)

**Expected output**

lanza Error

### Evidence Required

- Salida completa de node --test src/tip/calculateSplitTip.test.mjs mostrando los 5 tests en pass y 0 en fail

## QA Result 1 — Attempt 1

Test status: passed

Evidence: node --test src/tip/calculateSplitTip.test.mjs -> exitCode 0, 5 pass, 0 fail

### Tests Executed

- calculateSplitTip(90, 10, 3) devuelve { montos: [33, 33, 33], total: 99 }
- calculateSplitTip(100, 10, 3) reparte el residuo por indice ascendente
- calculateSplitTip(100, 10, 1) devuelve { montos: [110], total: 110 }
- calculateSplitTip(100, 10, 0) lanza Error por comensales invalido
- calculateSplitTip(-5, 10, 2) lanza Error por monto negativo

### Defects

- None.

### Observations

- calculateTip.mjs permanece intacto segun lo requerido por el plan
- index.mjs exporta calculateSplitTip sin alterar el export de calculateTip

# 9. Risks

## Functional Risks

- Errores de acumulacion si el calculo de residuales no se hace estrictamente en centavos enteros
- Ambiguedad de desempate cuando varios comensales comparten el mismo resto, si no se fija un criterio determinista de orden
- Riesgo de que comensales muy grande combinado con montos muy pequenos produzca partes en cero antes del reparto de residuales, sin que eso sea necesariamente un error funcional

## Technical Risks

- Errores de acumulacion de centavos si el calculo de residuales no se hace estrictamente con enteros
- Ambiguedad de desempate si no se ordena explicitamente por indice cuando los restos son iguales
- Comensales alto combinado con monto muy pequeno puede producir partes base en cero para algunos comensales, sin que eso sea un error funcional

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
