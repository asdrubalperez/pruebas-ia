# FEATURE-001 — Descuento simple por volumen

## 1. Feature Identity

- **Feature:** FEATURE-001
- **Name:** Descuento simple por volumen
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Las integraciones calculan descuentos por volumen con reglas duplicadas e inconsistentes, produciendo resultados divergentes.

# 3. Functional Goal

Ofrecer applyVolumeDiscount(monto, cantidadUnidades) como cálculo puro, determinístico y reutilizable que valide entradas, aplique el umbral acordado y devuelva el descuento y el total redondeado.

# 4. Scope

## Included

- Validación de monto y cantidadUnidades como números no negativos
- Descuento de 0% para cantidades de 0 a 9
- Descuento de 5% para cantidades de 10 a 49
- Descuento de 10% para cantidades de 50 o más
- Devolución del monto descontado y del total a pagar
- Redondeo half up del total a pagar a dos decimales
- Pruebas de umbrales, errores y casos decimales

## Excluded

- Tope máximo configurable del descuento
- Persistencia
- Interfaz de usuario
- Múltiples monedas
- Combinación de descuentos
- APIs o servicios externos

## Future Ideas

- Incorporar applyDiscountWithCap en el release r2 para limitar el descuento absoluto mediante un tope positivo

# 5. Functional Rules

1. monto y cantidadUnidades deben ser valores numéricos no negativos; de lo contrario la función debe lanzar un error.
2. Una cantidad de 0 a 9 aplica una tasa de descuento del 0%.
3. Una cantidad de 10 a 49 aplica una tasa de descuento del 5%.
4. Una cantidad de 50 o más aplica una tasa de descuento del 10%.
5. El monto descontado se calcula multiplicando monto por la tasa seleccionada.
6. El total a pagar se calcula restando el monto descontado al monto original.
7. El total a pagar se redondea una sola vez a dos decimales mediante half up después del cálculo.
8. La función debe ser pura y producir el mismo resultado para las mismas entradas.

# 6. Estrategia Algorítmica

## Objective

Seleccionar el porcentaje por cantidad, calcular el descuento y obtener un total monetario uniforme.

## Inputs

- monto numérico no negativo
- cantidadUnidades numérica no negativa

## Outputs

- monto descontado
- total a pagar redondeado a dos decimales

## Constraints

- Usar exclusivamente las tasas fijas 0%, 5% y 10%
- Aplicar los límites inclusivos 10 y 50 según el umbral correspondiente
- Redondear únicamente el total final mediante half up a dos decimales
- No persistir datos ni producir efectos secundarios

## Tie Breakers

- En un límite exacto prevalece el umbral que comienza en ese límite: 10 usa 5% y 50 usa 10%

## Deterministic Regressions

## Scenario 1 — Límite inferior del descuento medio

**Input / Action**

monto=100, cantidadUnidades=10

**Expected output**

monto descontado=5; total a pagar=95.00

## Scenario 2 — Límite inferior del descuento alto

**Input / Action**

monto=100, cantidadUnidades=50

**Expected output**

monto descontado=10; total a pagar=90.00


# 7. Technical Considerations

## Planning Contribution

Implementar applyVolumeDiscount como función pura TypeScript: validar entradas, seleccionar una de tres tasas por límites inclusivos, calcular el descuento sin redondeo intermedio y aplicar redondeo half up únicamente al total final. Compilar implementación y pruebas a dist para ejecución con el runner nativo de Node.

### Affected Components

- src/discount.ts
- src/discount.test.ts
- dist/discount.js
- dist/discount.test.js
- configuración de build TypeScript

### Dependencies

- TypeScript
- node:test
- node:assert/strict

## Developer Implementation 1

Implementación TypeScript del descuento simple por volumen y sus cuatro escenarios automatizados L2.

### Files Changed

- package.json
- tsconfig.json
- src/discount.ts
- src/discount.test.ts

### Decisions

- Validar tipos numéricos finitos y valores no negativos antes del cálculo.
- Mantener discountAmount sin redondeo y aplicar half up únicamente al total mediante tolerancia proporcional de punto flotante.
- Usar NodeNext e imports ESM para producir las rutas exactas requeridas en dist.

### Technical Evidence

- src/discount.test.ts cubre cantidades 0, 9, 10, 49, 50 y 51.
- La prueba decimal verifica discountAmount 0.505 y total 9.6 para applyVolumeDiscount(10.1, 10).
- Las pruebas verifican errores para negativos y strings, además de determinismo e instancias de resultado independientes.
- tsconfig.json define rootDir src y outDir dist, por lo que emite dist/discount.js y dist/discount.test.js.

## Developer Readiness — Attempt 1

Status: ready

La implementación está lista: QA ejecutó el COMANDO_TEST declarado y aprobó los 4 escenarios con exitCode 0.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- node --test dist/discount.test.js reportó 4 pruebas aprobadas y 0 fallidas.
- No se realizaron modificaciones durante el turno post-QA.


# 8. Validation Criteria

## Scenario 1 — Cantidad sin descuento

**Input / Action**

monto=100, cantidadUnidades=9

**Expected output**

monto descontado=0; total a pagar=100.00

## Scenario 2 — Primer valor del umbral medio

**Input / Action**

monto=100, cantidadUnidades=10

**Expected output**

monto descontado=5; total a pagar=95.00

## Scenario 3 — Último valor del umbral medio

**Input / Action**

monto=100, cantidadUnidades=49

**Expected output**

monto descontado=5; total a pagar=95.00

## Scenario 4 — Primer valor del umbral alto

**Input / Action**

monto=100, cantidadUnidades=50

**Expected output**

monto descontado=10; total a pagar=90.00

## Scenario 5 — Redondeo half up del total

**Input / Action**

monto=10.10, cantidadUnidades=10

**Expected output**

monto descontado=0.505; total matemático=9.595; total a pagar=9.60

## Scenario 6 — Monto cero válido

**Input / Action**

monto=0, cantidadUnidades=50

**Expected output**

monto descontado=0; total a pagar=0.00

## Scenario 7 — Cantidad cero válida

**Input / Action**

monto=100, cantidadUnidades=0

**Expected output**

monto descontado=0; total a pagar=100.00

## Scenario 8 — Monto negativo inválido

**Input / Action**

monto=-1, cantidadUnidades=10

**Expected output**

La función lanza un error y no devuelve un cálculo

## Scenario 9 — Cantidad no numérica inválida

**Input / Action**

monto=100, cantidadUnidades='10'

**Expected output**

La función lanza un error y no devuelve un cálculo


## Validation Evidence

Pruebas automatizadas determinísticas que demuestren los resultados en 0, 9, 10, 49 y 50 unidades, cantidades superiores a 50, monto cero, entradas negativas o no numéricas y al menos un caso decimal cuya tercera cifra decimal sea 5 para comprobar el redondeo half up.

## Planning Validation Plan

Test command: `node --test dist/discount.test.js`

## Scenario 1 — Fronteras de los tres umbrales

**Input / Action**

Ejecutar applyVolumeDiscount con monto 100 y cantidades 0, 9, 10, 49, 50 y 51.

**Expected output**

Los resultados son, en el mismo orden, {discountAmount:0,total:100}, {discountAmount:0,total:100}, {discountAmount:5,total:95}, {discountAmount:5,total:95}, {discountAmount:10,total:90} y {discountAmount:10,total:90}.

## Scenario 2 — Monto cero y redondeo monetario half up

**Input / Action**

Ejecutar applyVolumeDiscount(0,50) y applyVolumeDiscount(10.10,10).

**Expected output**

La primera llamada devuelve {discountAmount:0,total:0}; la segunda devuelve {discountAmount:0.505,total:9.60}, sin redondear previamente el descuento.

## Scenario 3 — Rechazo de entradas inválidas

**Input / Action**

Ejecutar la función con (-1,10), (100,-1), ('100',10) y (100,'10').

**Expected output**

Cada llamada lanza Error y ninguna devuelve un resultado de cálculo.

## Scenario 4 — Determinismo y pureza observable

**Input / Action**

Ejecutar dos veces applyVolumeDiscount(100,50) dentro del mismo proceso.

**Expected output**

Ambas llamadas devuelven resultados profundamente iguales a {discountAmount:10,total:90} y no producen escrituras ni efectos externos.

### Evidence Required

- Salida exitosa del runner node:test para dist/discount.test.js
- Resultados automatizados observables de los valores frontera 0, 9, 10, 49, 50 y 51
- Resultado automatizado que demuestre 9.595 redondeado half up a 9.60
- Errores automatizados observables para entradas negativas y no numéricas

## QA Result 1 — Attempt 1

Test status: passed

Evidence: exitCode=0, timedOut=false; TAP: tests 4, pass 4, fail 0, cancelled 0, skipped 0; stderr vacío.

### Tests Executed

- applies the expected rates at every volume boundary
- preserves the unrounded discount and rounds only the total half up
- rejects negative and non-numeric inputs
- returns deterministic results without observable side effects

### Defects

- None.

### Observations

- Los cuatro escenarios L2 definidos por Planning fueron aprobados.

# 9. Risks

## Functional Risks

- Las integraciones consumidoras podrían conservar umbrales anteriores y producir resultados distintos.
- Un redondeo aplicado antes del total final podría alterar resultados monetarios.
- La interpretación incorrecta de los límites 10 y 50 podría asignar una tasa equivocada.

## Technical Risks

- La representación binaria de decimales puede convertir incorrectamente 9.595 si se usa un redondeo ingenuo.
- Redondear discountAmount antes de calcular total altera el resultado monetario requerido.
- Comparadores incorrectos en 10 o 50 asignan una tasa equivocada.
- El archivo de prueba debe ser emitido exactamente como dist/discount.test.js para que QA pueda ejecutar el comando declarado.

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
