# FEATURE-001 — Cálculo de propina y total (calculateTip)

## 1. Feature Identity

- **Feature:** FEATURE-001
- **Name:** Cálculo de propina y total (calculateTip)
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Las integraciones internas necesitan calcular la propina y el total a pagar de forma consistente, sin duplicar la lógica de cálculo ni el redondeo monetario en cada punto de uso.

# 3. Functional Goal

Proveer una función pura en el paquete interno TypeScript que, dado un monto base y un porcentaje de propina, devuelva el monto de propina y el total a pagar redondeados a 2 decimales de manera determinista y centralizada.

# 4. Scope

## Included

- Función calculateTip(monto, porcentaje) con salida compuesta {propina, total}
- Cálculo del monto de propina a partir del porcentaje aplicado sobre el monto base
- Redondeo a 2 decimales de propina y total
- Centralización de la lógica de cálculo y redondeo para reutilización
- Tests automatizados de cálculo, porcentajes y redondeo

## Excluded

- Prorrateo entre comensales (release r2)
- Persistencia de datos
- Interfaz de usuario
- Soporte de monedas múltiples

## Future Ideas

- Reutilización de la lógica base en calculateSplitTip (r2)

# 5. Functional Rules

1. El monto de propina es igual al monto base multiplicado por el porcentaje dividido 100.
2. La propina y el total se redondean a 2 decimales de forma determinista.
3. El total a pagar es igual al monto base más el monto de propina redondeado.
4. Con porcentaje 0, la propina es 0 y el total es igual al monto base.
5. Con monto 0, la propina y el total son 0.
6. La función es pura: mismas entradas producen siempre las mismas salidas, sin efectos secundarios.

# 6. Estrategia Algorítmica

## Objective

Calcular propina y total a pagar con redondeo monetario consistente a 2 decimales.

## Inputs

- monto base (número)
- porcentaje de propina (número)

## Outputs

- monto de propina redondeado a 2 decimales
- total a pagar redondeado a 2 decimales

## Constraints

- Redondeo a 2 decimales
- Función pura y determinista
- Sin persistencia ni UI

## Tie Breakers

- Aplicar una regla de redondeo consistente y documentada a 2 decimales para casos con tercer decimal en el límite

## Deterministic Regressions

## Scenario 1 — Cálculo estándar

**Input / Action**

monto=100, porcentaje=10

**Expected output**

propina=10.00, total=110.00

## Scenario 2 — Redondeo a 2 decimales

**Input / Action**

monto=100, porcentaje=15.5

**Expected output**

propina=15.50, total=115.50


# 7. Technical Considerations

## Planning Contribution

Función pura calculateTip(monto, porcentaje) en TypeScript que calcula propina = monto*(porcentaje/100) redondeada a 2 decimales de forma determinista (half-up), total = monto + propina redondeado a 2 decimales, retornando {propina, total}. Build tsc a dist/ que compila también el archivo de test a dist/tip.test.js.

### Affected Components

- src/tip.ts
- src/tip.test.ts
- package.json
- tsconfig.json

### Dependencies

- Node.js con soporte de node:test
- TypeScript (tsc) para el paso de build

## Developer Implementation 1

Función pura calculateTip(monto, porcentaje) en TypeScript que retorna {propina, total} redondeados a 2 decimales de forma determinista (half-up con Number.EPSILON), con total calculado sobre la propina ya redondeada para mantener coherencia; incluye casos límite de porcentaje 0 y monto 0. Configuré tsc para compilar src/ a dist/ generando dist/tip.js y dist/tip.test.js.

### Files Changed

- package.json
- tsconfig.json
- src/tip.ts
- src/tip.test.ts

### Decisions

- Regla de redondeo determinista half-up: Math.round((valor + Number.EPSILON) * 100) / 100, documentada en el módulo para resolver el riesgo del tercer decimal
- total se calcula sobre la propina ya redondeada para asegurar coherencia propina/total
- Naming de dominio en español (monto, porcentaje, propina, total) e infraestructura técnica en inglés (calculateTip), siguiendo la convención de idioma de Coding Standards
- Se ajustó el script build de mkdir a tsc y se declararon typescript y @types/node como devDependencies para el build determinístico

### Technical Evidence

- src/tip.ts exporta calculateTip con firma (monto: number, porcentaje: number): ResultadoPropina
- src/tip.test.ts usa node:test y node:assert/strict con los 5 escenarios del plan
- tsconfig.json: rootDir src, outDir dist, module CommonJS; COMANDO_TEST node --test dist/tip.test.js resuelve dist/tip.test.js y dist/tip.js

## Developer Readiness — Attempt 1

Status: ready

Los 5 escenarios definidos por Planning pasaron en verde: cálculo estándar (100/10), redondeo a 2 decimales (33.33/10), porcentaje con decimal exacto (100/15.5), porcentaje cero (50/0) y monto cero (0/20). exitCode 0, stderr vacío, timedOut false. La implementación de calculateTip en src/tip.ts y el test en src/tip.test.ts compilados a dist/ satisfacen íntegramente el contrato del plan.

Requires code changes: false

### Known Risks

- QA observó que la política de redondeo half-up del tercer decimal no se ejercita explícitamente con un caso frontera (ej. .005) en el Test Plan actual — ese escenario no fue solicitado por Planning y está fuera del alcance de esta feature.

### Final Notes

- El riesgo de redondeo en frontera (.005) es una observación de QA, no un defecto: ninguno de los 5 escenarios definidos por Planning lo requería y el comportamiento del módulo es determinista para todos los casos especificados.
- Branch: run/8586dd8e-9a2f-43cc-a9e0-da7b368a73b9, headSha: ca2cd8f78b9a5c65a8b96fcf348ca1569d1c76f4.


# 8. Validation Criteria

## Scenario 1 — Cálculo de propina con porcentaje estándar

**Input / Action**

monto=100, porcentaje=10

**Expected output**

propina=10.00 y total=110.00

## Scenario 2 — Porcentaje que requiere redondeo a 2 decimales

**Input / Action**

monto=33.33, porcentaje=10

**Expected output**

propina redondeada a 2 decimales (3.33) y total=36.66

## Scenario 3 — Porcentaje cero

**Input / Action**

monto=50, porcentaje=0

**Expected output**

propina=0.00 y total=50.00

## Scenario 4 — Monto cero

**Input / Action**

monto=0, porcentaje=20

**Expected output**

propina=0.00 y total=0.00


## Validation Evidence

Suite de tests automatizados que ejercita cálculo con distintos porcentajes, redondeo a 2 decimales y casos límite (porcentaje 0 y monto 0), verificando coherencia entre propina y total.

## Planning Validation Plan

Test command: `node --test dist/tip.test.js`

## Scenario 1 — Cálculo estándar

**Input / Action**

calculateTip(100, 10)

**Expected output**

{ propina: 10.00, total: 110.00 }

## Scenario 2 — Redondeo a 2 decimales

**Input / Action**

calculateTip(33.33, 10)

**Expected output**

{ propina: 3.33, total: 36.66 }

## Scenario 3 — Porcentaje con decimal exacto

**Input / Action**

calculateTip(100, 15.5)

**Expected output**

{ propina: 15.50, total: 115.50 }

## Scenario 4 — Porcentaje cero (límite)

**Input / Action**

calculateTip(50, 0)

**Expected output**

{ propina: 0.00, total: 50.00 }

## Scenario 5 — Monto cero (límite)

**Input / Action**

calculateTip(0, 20)

**Expected output**

{ propina: 0.00, total: 0.00 }

### Evidence Required

- Salida de node --test dist/tip.test.js con los 5 escenarios en pass, demostrando cálculo, redondeo a 2 decimales y coherencia entre propina y total

## QA Result 1 — Attempt 1

Test status: passed

Evidence: node --test dist/tip.test.js -> exitCode 0, timedOut false; TAP: 1..5, # pass 5, # fail 0

### Tests Executed

- cálculo estándar: calculateTip(100, 10)
- redondeo a 2 decimales: calculateTip(33.33, 10)
- porcentaje con decimal exacto: calculateTip(100, 15.5)
- porcentaje cero (límite): calculateTip(50, 0)
- monto cero (límite): calculateTip(0, 20)

### Defects

- None.

### Observations

- Los 5 escenarios del Test Plan pasaron en verde con stderr vacío

# 9. Risks

## Functional Risks

- Ambigüedad en la política exacta de redondeo del segundo decimal si no se estandariza una regla única

## Technical Risks

- Ambigüedad en la política de redondeo del tercer decimal si no se estandariza una única regla determinista (half-up) documentada en el módulo

## Quality and Readiness Risks

- La política de redondeo half-up del tercer decimal no se ejercita explícitamente con un caso frontera (ej. .005) en el Test Plan actual
- QA observó que la política de redondeo half-up del tercer decimal no se ejercita explícitamente con un caso frontera (ej. .005) en el Test Plan actual — ese escenario no fue solicitado por Planning y está fuera del alcance de esta feature.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
