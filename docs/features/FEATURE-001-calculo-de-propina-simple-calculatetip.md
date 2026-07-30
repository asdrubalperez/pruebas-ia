# FEATURE-001 — Cálculo de propina simple (calculateTip)

## 1. Feature Identity

- **Feature:** FEATURE-001
- **Name:** Cálculo de propina simple (calculateTip)
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Los usuarios necesitan calcular la propina y el total a pagar dado un monto y un porcentaje, sin errores de redondeo por punto flotante y sin resultados silenciosos ante entradas inválidas.

# 3. Functional Goal

Proveer una función pura calculateTip(monto, porcentaje) que devuelva { propina, total } calculados con aritmética entera en centavos, validando estrictamente las entradas.

# 4. Scope

## Included

- Cálculo de propina y total para un monto y porcentaje dados
- Validación estricta de entradas (monto>0 finito, porcentaje>=0 finito)
- Manejo de redondeo vía conversión a centavos enteros

## Excluded

- Reparto entre comensales (cubierto en f2)
- Persistencia
- UI
- Multi-moneda
- Logging/I/O

## Future Ideas

- None.

# 5. Functional Rules

1. monto debe ser un número finito estrictamente mayor a 0; en caso contrario se lanza RangeError o TypeError, sin devolver NaN
2. porcentaje debe ser un número finito mayor o igual a 0; en caso contrario se lanza excepción tipada
3. El cálculo convierte el monto a centavos enteros, aplica el porcentaje y redondea en centavos antes de reconvertir a unidad monetaria con 2 decimales
4. total = monto + propina, calculado en centavos para evitar arrastre de error de redondeo
5. La función es pura: sin efectos secundarios, sin logging ni I/O

# 6. Estrategia Algorítmica

Not applicable.

# 7. Technical Considerations

## Planning Contribution

Implementar calculateTip como función pura que valida entradas con TypeError/RangeError explícitos, convierte monto a centavos enteros, aplica el porcentaje, redondea half-up en centavos vía un helper roundToCents, y reconvierte propina y total a unidad monetaria con 2 decimales, garantizando total=monto+propina sin arrastre de error de punto flotante.

### Affected Components

- src/tip.mjs
- src/tip.test.mjs

### Dependencies

- node:test
- node:assert/strict

## Developer Implementation 1

Implementada calculateTip(monto, porcentaje) como función pura en src/tip.mjs con validaciones TypeError/RangeError explícitas, conversión a centavos enteros, helper roundToCents con redondeo half-up documentado, y reconversión garantizando total=monto+propina sin error de punto flotante. Test suite en src/tip.test.mjs con node:test cubre los 5 escenarios exactos del plan más verificación de consistencia en centavos.

### Files Changed

- src/tip.mjs
- src/tip.test.mjs

### Decisions

- roundToCents usa Math.floor(x+0.5) para half-up, válido porque el dominio (monto>0, porcentaje>=0) nunca produce valores negativos
- Se documentó con comentario en el código el criterio half-up para evitar ambigüedad futura sobre banker's rounding, tal como pedía technicalRisks del plan
- Las validaciones se ordenan monto (TypeError, luego RangeError) y después porcentaje (TypeError, luego RangeError), respetando el orden del plan

### Technical Evidence

- src/tip.mjs implementa exactamente la fórmula del plan: montoCents=Math.round(monto*100); propinaCents=roundToCents(montoCents*porcentaje/100); totalCents=montoCents+propinaCents
- src/tip.test.mjs incluye assert.deepEqual para los 3 casos de cálculo válido y assert.throws con la clase de error correcta para los 2 casos de validación, más verificación explícita en centavos de propina+monto=total

## Developer Implementation 2

Se corrigió package.json eliminando un BOM (U+FEFF) inicial que lo hacía JSON inválido, causa raíz del fallo de instalación de dependencias. Se verificó que ahora parsea correctamente con JSON.parse. La implementación previa de calculateTip en src/tip.mjs y su suite de tests en src/tip.test.mjs (5 escenarios exactos del validationPlan) se revisaron y quedaron sin cambios por ser correctas.

### Files Changed

- package.json

### Decisions

- Reescribir package.json completo con el mismo contenido JSON pero sin el BOM inicial, en lugar de editar in-place, para garantizar codificación limpia UTF-8 sin marca de orden de bytes
- No modificar src/tip.mjs ni src/tip.test.mjs porque el fallo reportado era exclusivamente de instalación de dependencias (package.json inválido), no de build ni de tests

### Technical Evidence

- node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('ok')" devolvió exitCode 0 y stdout 'ok', confirmando JSON válido tras la corrección

## Developer Readiness — Attempt 2

Status: ready

Los 5 escenarios de validationPlan (cálculo estándar, redondeo límite, porcentaje 0, monto inválido negativo, entrada no finita) pasaron en node --test src/tip.test.mjs con exitCode 0 y sin defectos reportados por QA.

Requires code changes: false

### Known Risks

- El criterio de redondeo half-up en roundToCents queda documentado solo en comentario de código; si el negocio requiere banker's rounding en el futuro habrá que revisar esa decisión explícitamente

### Final Notes

- Feature f1 (calculateTip) lista para cerrar; f2 (calculateSplitTip) queda pendiente para una siguiente iteración según releasePlan


# 8. Validation Criteria

## Scenario 1 — Cálculo estándar de propina sobre un monto exacto

**Input / Action**

monto=50, porcentaje=15

**Expected output**

propina=7.50, total=57.50

## Scenario 2 — Redondeo límite (medio centavo)

**Input / Action**

monto=0.03, porcentaje=50

**Expected output**

propina=0.02, total=0.05

## Scenario 3 — Porcentaje 0

**Input / Action**

monto=20, porcentaje=0

**Expected output**

propina=0.00, total=20.00

## Scenario 4 — Monto inválido (negativo)

**Input / Action**

monto=-5, porcentaje=10

**Expected output**

lanza RangeError, sin devolver valor numérico

## Scenario 5 — Porcentaje inválido (negativo)

**Input / Action**

monto=10, porcentaje=-1

**Expected output**

lanza RangeError

## Scenario 6 — Entrada no finita

**Input / Action**

monto=NaN, porcentaje=10

**Expected output**

lanza TypeError


## Validation Evidence

Suite de tests unitarios que ejecute los escenarios anteriores y verifique que propina+monto siempre iguala exactamente al total, sin residuos de punto flotante.

## Planning Validation Plan

Test command: `node --test src/tip.test.mjs`

## Scenario 1 — Cálculo estándar de propina sobre un monto exacto

**Input / Action**

calculateTip(50, 15)

**Expected output**

retorna { propina: 7.5, total: 57.5 }

## Scenario 2 — Redondeo límite (medio centavo)

**Input / Action**

calculateTip(0.03, 50)

**Expected output**

retorna { propina: 0.02, total: 0.05 }

## Scenario 3 — Porcentaje 0

**Input / Action**

calculateTip(20, 0)

**Expected output**

retorna { propina: 0, total: 20 }

## Scenario 4 — Monto inválido (negativo)

**Input / Action**

calculateTip(-5, 10)

**Expected output**

lanza RangeError, no retorna valor numérico ni NaN

## Scenario 5 — Entrada no finita

**Input / Action**

calculateTip(NaN, 10)

**Expected output**

lanza TypeError, no retorna valor numérico ni NaN

### Evidence Required

- Salida de node --test src/tip.test.mjs mostrando los 5 escenarios en verde (pass)
- Verificación explícita en el test de que propina+monto (en centavos) iguala exactamente a total, sin residuos de punto flotante

## QA Result 1 — Attempt 2

Test status: passed

Evidence: node --test src/tip.test.mjs: 1..5, # tests 5, # pass 5, # fail 0, # cancelled 0, # skipped 0, exitCode 0

### Tests Executed

- Cálculo estándar de propina sobre un monto exacto
- Redondeo límite (medio centavo)
- Porcentaje 0
- Monto inválido (negativo)
- Entrada no finita

### Defects

- None.

### Observations

- Los 5 escenarios definidos en validationPlan pasaron correctamente
- El fallo previo de instalación por BOM en package.json fue corregido

# 9. Risks

## Functional Risks

- El uso de round half up para valores .5 (decisión ya tomada por Architect en el helper roundToCents) debe documentarse explícitamente para evitar ambigüedad en los tests; si el negocio esperara banker's rounding, quedaría fuera de alcance salvo indicación futura.

## Technical Risks

- El criterio de redondeo half-up para el caso .5 debe quedar documentado en el código (comentario en roundToCents) para evitar ambigüedad futura si el negocio pidiera banker's rounding

## Quality and Readiness Risks

- El criterio de redondeo half-up en roundToCents queda documentado solo en comentario de código; si el negocio requiere banker's rounding en el futuro habrá que revisar esa decisión explícitamente

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
