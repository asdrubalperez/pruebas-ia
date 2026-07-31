# FEATURE-002 — Prorrateo de propina entre comensales (calculateSplitTip)

## 1. Feature Identity

- **Feature:** FEATURE-002
- **Name:** Prorrateo de propina entre comensales (calculateSplitTip)
- **Release:** r2
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Cada integración que necesita dividir la cuenta entre comensales replica manualmente la lógica de reparto, generando inconsistencias de redondeo donde la suma de las partes no coincide con el total a pagar.

# 3. Functional Goal

Proveer una función pura y determinística que, dado un monto, un porcentaje de propina y una cantidad de comensales, devuelva el detalle de cuánto debe pagar cada comensal, garantizando que la suma exacta de las partes sea igual al total a pagar (monto + propina) redondeado a 2 decimales.

# 4. Scope

## Included

- Cálculo del total a pagar (monto + propina) reutilizando la lógica ya validada de calculateTip
- División del total entre N comensales con reparto de centavos sobrantes sin pérdida
- Redondeo de cada parte individual a 2 decimales
- Validación de comensales como entero positivo (>=1)
- Validación de monto y porcentaje no negativos, reutilizando las mismas reglas de validación de calculateTip

## Excluded

- Soporte de monedas múltiples
- Persistencia de resultados
- Interfaz de usuario o API HTTP
- Reparto no equitativo entre comensales (por ejemplo, por ítems consumidos)

## Future Ideas

- None.

# 5. Functional Rules

1. El total a pagar se calcula reutilizando calculateTip(monto, porcentaje) para evitar duplicar la lógica de cálculo de propina entre releases
2. comensales debe ser un entero mayor o igual a 1; valores no enteros, cero o negativos deben rechazarse (excepción o error explícito)
3. monto debe ser mayor a 0 y porcentaje mayor o igual a 0, aplicando las mismas validaciones que calculateTip
4. Cada parte individual se redondea a 2 decimales
5. La suma de todas las partes redondeadas debe ser exactamente igual al total a pagar redondeado a 2 decimales, sin excedentes ni faltantes de centavos
6. Cuando el total no se divide exactamente entre los comensales, los centavos sobrantes (diferencia entre el total y la suma de partes iguales redondeadas hacia abajo) se distribuyen de a un centavo por comensal, comenzando por el primer comensal (índice 0) en el orden de salida, hasta agotar el sobrante
7. Si comensales es 1, la parte única debe ser igual al total a pagar completo

# 6. Estrategia Algorítmica

## Objective

Repartir el total a pagar entre N comensales en partes redondeadas a 2 decimales cuya suma sea exactamente igual al total, sin pérdida ni ganancia de centavos.

## Inputs

- monto: number (subtotal de la cuenta, > 0)
- porcentaje: number (porcentaje de propina, >= 0)
- comensales: number (entero, >= 1)

## Outputs

- total: number (monto + propina, redondeado a 2 decimales, igual al resultado de calculateTip)
- propina: number (monto de la propina, igual al resultado de calculateTip)
- partes: number[] (arreglo de longitud comensales, cada elemento redondeado a 2 decimales, cuya suma es exactamente igual a total)

## Constraints

- Todas las operaciones deben trabajar en centavos (enteros) internamente antes de convertir a decimales, para evitar errores de punto flotante
- La suma de partes debe validarse en tests que sea exactamente igual a total en centavos

## Tie Breakers

- Los centavos sobrantes se asignan de a uno por comensal, comenzando por el comensal en la posición 0 del arreglo de salida y avanzando en orden hasta agotar el sobrante

## Deterministic Regressions

## Scenario 1 — Monto no divisible exactamente entre comensales

**Input / Action**

monto=10, porcentaje=10, comensales=3

**Expected output**

total=11.00; partes=[3.67,3.67,3.66] cuya suma es exactamente 11.00, con el primer comensal recibiendo el centavo sobrante

## Scenario 2 — Un solo comensal

**Input / Action**

monto=100, porcentaje=15, comensales=1

**Expected output**

partes=[115.00], total=115.00


# 7. Technical Considerations

## Planning Contribution

Implementar calculateSplitTip como wrapper puro sobre calculateTip: se calcula total y propina reutilizando calculateTip(monto, porcentaje) sin duplicar su lógica; se valida comensales como entero >=1 en calculateSplitTip; el total se convierte a centavos enteros y se reparte con el método de mayor resto (division entera + reparto de 1 centavo por comensal empezando en el indice 0 hasta agotar el sobrante), evitando aritmetica de punto flotante hasta el paso final de conversion a decimales con 2 digitos.

### Affected Components

- src/split-tip/index.ts
- src/split-tip/index.test.ts

### Dependencies

- calculateTip exportado desde src/tip/index.ts (no modificar)

## Developer Implementation 1

Se implementó calculateSplitTip en src/split-tip/index.ts como wrapper sobre calculateTip: valida comensales como entero >=1 (lanzando Error explícito si no), obtiene total y propina reutilizando calculateTip sin duplicar su lógica, convierte el total a centavos enteros, aplica división entera + reparto de 1 centavo a las primeras posiciones (índice 0 en adelante) hasta agotar el sobrante, y convierte cada parte a decimal con 2 dígitos usando el mismo patrón centsToDecimal que src/tip/index.ts. Se creó el archivo de test correspondiente con los 5 casos obligatorios del plan.

### Files Changed

- src/split-tip/index.ts
- src/split-tip/index.test.ts

### Decisions

- Se replicó localmente la función centsToDecimal (en vez de importarla) porque no está exportada desde src/tip/index.ts, manteniendo el mismo patrón de conversión (cents/100).toFixed(2) para evitar artefactos de punto flotante.
- El reparto del sobrante de centavos se hace comparando el índice de iteración (i) contra sobranteCentavos, asignando 1 centavo extra a las primeras sobranteCentavos posiciones, replicando exactamente el orden determinístico pedido por el plan.
- Las validaciones de monto y porcentaje se delegan completamente a calculateTip, propagando su error tal cual, sin revalidar esos parámetros en calculateSplitTip.

### Technical Evidence

- Archivo src/split-tip/index.ts creado con la firma exacta function calculateSplitTip(monto: number, porcentaje: number, comensales: number): { total: number; propina: number; partes: number[] } e import { calculateTip } from "../tip/index";
- Archivo src/split-tip/index.test.ts creado con node:test y node:assert/strict, incluyendo los 5 escenarios exactos del plan (reparto exacto [55,55], reparto con sobrante [3.67,3.67,3.66] + verificación de suma en centavos, un comensal [115], comensales inválido 0 y 2.5, y consistencia estricta con calculateTip(200,15)).

## Developer Implementation 2

Se corrigió el error de build TS2532 (Object is possibly undefined) en src/split-tip/index.test.ts, causado por indexado directo de un array (result.partes[0], [1], [2]) bajo la opción noUncheckedIndexedAccess:true de tsconfig.json. Se reemplazó la suma indexada por result.partes.reduce((acc, parte) => acc + parte, 0) en el Caso 2 (reparto con sobrante), manteniendo exactamente la misma verificación (suma exacta de partes en centavos igual al total en centavos) sin alterar valores esperados ni otros casos. La implementación de calculateSplitTip en src/split-tip/index.ts no requirió cambios: ya delegaba correctamente en calculateTip, validaba comensales como entero >=1, y repartía el total en centavos enteros con el método de mayor resto.

### Files Changed

- src/split-tip/index.test.ts

### Decisions

- Usar Array.prototype.reduce en vez de indexado directo para sumar las partes del arreglo, evitando el tipo number|undefined que impone noUncheckedIndexedAccess sin necesidad de non-null assertions ni de desactivar la opción del tsconfig
- No modificar src/split-tip/index.ts porque no tenía errores de compilación ni se apartaba del plan; el fallo de build estaba exclusivamente en el archivo de test
- No modificar el COMANDO_TEST ni la ruta del archivo de test, conforme a la Regla 4

### Technical Evidence

- npx tsc --noEmit -> exitCode 0 (sin errores)
- npx tsc -> exitCode 0 (compilación completa a dist/)
- node --test dist/split-tip/index.test.js -> TAP: # tests 5, # pass 5, # fail 0, # cancelled 0, # skipped 0

## Developer Readiness — Attempt 2

Status: ready

calculateSplitTip implementado en src/split-tip/index.ts reutilizando calculateTip sin duplicar lógica de propina, con validación estricta de comensales y reparto de centavos por método de mayor resto. Los 5 casos de prueba definidos por Planning en src/split-tip/index.test.ts pasan en verde vía node --test dist/split-tip/index.test.js, y QA confirmó testStatus passed sin defectos.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- Evidencia: node --test dist/split-tip/index.test.js -> 5 tests, 5 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo, exitCode 0
- QA no reportó defectos ni riesgos de calidad pendientes


# 8. Validation Criteria

## Scenario 1 — Reparto exacto sin sobrante de centavos

**Input / Action**

monto=100, porcentaje=10, comensales=2

**Expected output**

total=110.00; partes=[55.00,55.00]

## Scenario 2 — Reparto con sobrante de centavos distribuido determinísticamente

**Input / Action**

monto=10, porcentaje=10, comensales=3

**Expected output**

total=11.00; suma de partes = 11.00 exacto; primer comensal recibe el centavo extra (3.67,3.67,3.66)

## Scenario 3 — Comensales inválido (cero)

**Input / Action**

monto=100, porcentaje=10, comensales=0

**Expected output**

La función rechaza la entrada con un error explícito, sin devolver un arreglo vacío ni dividir por cero

## Scenario 4 — Comensales inválido (no entero)

**Input / Action**

monto=100, porcentaje=10, comensales=2.5

**Expected output**

La función rechaza la entrada con un error explícito

## Scenario 5 — Consistencia con calculateTip

**Input / Action**

monto=200, porcentaje=15, comensales=4

**Expected output**

total y propina devueltos por calculateSplitTip coinciden exactamente con los devueltos por calculateTip(200,15)


## Validation Evidence

Se debe verificar mediante tests unitarios que, para un conjunto representativo de combinaciones de monto/porcentaje/comensales (incluyendo casos con y sin sobrante de centavos, comensales=1, y valores límite inválidos), la suma de las partes devueltas sea siempre exactamente igual al total a pagar, y que ninguna parte individual difiera en más de un centavo del resto.

## Planning Validation Plan

Test command: `node --test dist/split-tip/index.test.js`

## Scenario 1 — Reparto exacto sin sobrante de centavos

**Input / Action**

calculateSplitTip(100, 10, 2)

**Expected output**

total=110, partes=[55,55]

## Scenario 2 — Reparto con sobrante de centavos distribuido determinísticamente

**Input / Action**

calculateSplitTip(10, 10, 3)

**Expected output**

total=11, partes=[3.67,3.67,3.66], suma exacta de partes en centavos igual a total en centavos

## Scenario 3 — Un solo comensal

**Input / Action**

calculateSplitTip(100, 15, 1)

**Expected output**

partes=[115], total=115

## Scenario 4 — Comensales inválido (cero y no entero)

**Input / Action**

calculateSplitTip(100, 10, 0) y calculateSplitTip(100, 10, 2.5)

**Expected output**

ambas llamadas lanzan Error explícito

## Scenario 5 — Consistencia con calculateTip

**Input / Action**

calculateSplitTip(200, 15, 4) comparado con calculateTip(200, 15)

**Expected output**

result.total === calculateTip(200,15).total y result.propina === calculateTip(200,15).propina

### Evidence Required

- Salida completa de node --test dist/split-tip/index.test.js con los 5 tests (o más si se agregan asserts adicionales dentro de ellos) en verde, sin fallos ni skips

## QA Result 1 — Attempt 2

Test status: passed

Evidence: node --test dist/split-tip/index.test.js -> # tests 5, # pass 5, # fail 0, # cancelled 0, # skipped 0, # todo 0, exitCode 0

### Tests Executed

- Caso 1 - Reparto exacto sin sobrante de centavos
- Caso 2 - Reparto con sobrante de centavos distribuido determinísticamente
- Caso 3 - Un solo comensal
- Caso 4 - Comensales inválido
- Caso 5 - Consistencia con calculateTip

### Defects

- None.

### Observations

- El desarrollador corrigió un error previo de compilación TS2532 (noUncheckedIndexedAccess) reemplazando indexado directo por reduce, sin alterar la lógica ni los valores esperados del test.

# 9. Risks

## Functional Risks

- Errores de punto flotante en JavaScript/TypeScript al operar con decimales pueden introducir descuadres de centavos si no se opera en enteros (centavos) internamente
- Definir la distribución de centavos sobrantes por orden de índice es una decisión de diseño razonable pero arbitraria; si en el futuro se requiere un criterio de negocio distinto (por ejemplo, aleatorio o proporcional), deberá tratarse como una nueva Feature

## Technical Risks

- Errores de punto flotante si la conversión a centavos o el reparto de sobrante no se hace sobre enteros
- Ruta de import relativa incorrecta hacia src/tip/index.ts que rompa la reutilización de calculateTip
- Olvidar aplicar el redondeo a 2 decimales por parte individual, generando valores como 3.6699999999999999 en vez de 3.67

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
