# FEATURE-002 — Descuento por volumen con tope configurable

## 1. Feature Identity

- **Feature:** FEATURE-002
- **Name:** Descuento por volumen con tope configurable
- **Release:** r2
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

El descuento por volumen ya centralizado puede producir valores absolutos mayores que el límite admitido, por lo que el nuevo release debe garantizar un máximo explícito y configurable.

# 3. Functional Goal

Calcular el descuento por volumen con los umbrales vigentes y aplicar como descuento efectivo el menor valor entre el descuento nominal y un tope monetario, devolviendo también el total final redondeado.

# 4. Scope

## Included

- Función applyDiscountWithCap(monto, cantidadUnidades, tope)
- Umbrales vigentes de 0%, 5% y 10%
- Tope fijo expresado en la misma moneda que el monto
- Devolución del descuento efectivo y del total a pagar
- Redondeo half up a dos decimales sobre el total final
- Errores para monto o cantidadUnidades no numéricos o negativos

## Excluded

- Persistencia
- Interfaz de usuario
- Soporte multimoneda
- Descuentos combinables
- Configuración de los umbrales
- Cambios en applyVolumeDiscount

## Future Ideas

- None.

# 5. Functional Rules

1. Para cantidades entre 1 y 9 unidades, el porcentaje de descuento nominal es 0%.
2. Para cantidades entre 10 y 49 unidades, el porcentaje de descuento nominal es 5%.
3. Para cantidades de 50 unidades o más, el porcentaje de descuento nominal es 10%.
4. El descuento efectivo es el menor entre el descuento nominal calculado y el tope.
5. Cuando el descuento nominal supera el tope, se aplica exactamente el valor del tope.
6. Después de aplicar el tope no se recalcula el porcentaje ni se realiza un segundo redondeo.
7. El total a pagar es monto menos descuento efectivo.
8. El redondeo half up a dos decimales se aplica una única vez sobre el total final.
9. La respuesta contiene el monto descontado y el total a pagar.
10. Monto y tope pertenecen a la misma moneda.
11. Si monto o cantidadUnidades no son números, o son negativos, la función lanza un error.

# 6. Estrategia Algorítmica

## Objective

Obtener un descuento por volumen que respete un límite monetario absoluto y calcular el total final con un único redondeo.

## Inputs

- monto
- cantidadUnidades
- tope

## Outputs

- monto descontado
- total a pagar

## Constraints

- Usar los umbrales vigentes del release anterior
- No permitir que el descuento efectivo supere el tope
- Aplicar half up a dos decimales solamente al monto final
- No recalcular ni redondear nuevamente después de limitar el descuento

## Tie Breakers

- Si descuento nominal y tope son iguales, aplicar ese valor sin tratamiento adicional

## Deterministic Regressions

## Scenario 1 — El tope no altera un descuento inferior

**Input / Action**

monto=100, cantidadUnidades=10, tope=10

**Expected output**

descuento=5; total=95.00

## Scenario 2 — El descuento nominal iguala el tope

**Input / Action**

monto=1000, cantidadUnidades=50, tope=100

**Expected output**

descuento=100; total=900.00


# 7. Technical Considerations

## Planning Contribution

Agregar applyDiscountWithCap al módulo de dominio existente, reutilizar applyVolumeDiscount para validación y cálculo nominal, limitar discountAmount con Math.min y recalcular el total mediante el helper half up existente sin redondear el descuento ni introducir un segundo redondeo.

### Affected Components

- src/discount.ts
- src/discount.test.ts
- dist/discount.js
- dist/discount.test.js

### Dependencies

- applyVolumeDiscount
- roundHalfUpToTwoDecimals
- compilación TypeScript de src a dist

## Developer Implementation 1

Se agregó el descuento por volumen con tope configurable y sus cinco escenarios de prueba requeridos.

### Files Changed

- src/discount.ts
- src/discount.test.ts

### Decisions

- Reutilizar applyVolumeDiscount para conservar sus validaciones y cálculo nominal.
- Limitar únicamente discountAmount mediante Math.min.
- Recalcular el total desde amount menos el descuento efectivo y aplicar roundHalfUpToTwoDecimals una sola vez.
- Conservar sin cambios las pruebas y el comportamiento de applyVolumeDiscount.

### Technical Evidence

- Los límites 9, 10, 49 y 50 están cubiertos en una única prueba representativa.
- Las relaciones descuento nominal mayor e igual al tope están cubiertas.
- El caso 10.05 conserva discountAmount 0.5025 y espera total 9.55.
- Las cuatro variantes inválidas de amount y unitQuantity esperan Error.
- No se ejecutó el build, conforme a la regla de fase que lo reserva al Orquestador.

## Developer Implementation 2

Corrección puntual del rechazo de QA mediante normalización del ruido IEEE-754 en el descuento efectivo, sin redondeo monetario adicional ni cambios en applyVolumeDiscount.

### Files Changed

- src/discount.ts

### Decisions

- Aplicar Math.min antes de normalizar el descuento efectivo.
- Usar 15 dígitos significativos para remover el artefacto 0.5025000000000001 y producir 0.5025.
- Mantener el helper half up exclusivamente para calcular el total final.

### Technical Evidence

- applyDiscountWithCap sigue reutilizando applyVolumeDiscount para validación y cálculo nominal.
- El descuento efectivo se obtiene con Math.min(nominalDiscountAmount, cap).
- La prueba exacta en src/discount.test.ts exige discountAmount 0.5025 y total 9.55 para (10.05,10,1).
- No se ejecutó el build porque el contrato de fase establece que lo realiza el Orquestador.

## Developer Readiness — Attempt 2

Status: ready

La implementación está lista: QA aprobó node --test dist/discount.test.js con 9 pruebas exitosas y 0 fallidas.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- No se realizaron modificaciones durante este turno post-QA.
- El contrato funcional, los casos planificados y el comando de prueba quedaron validados.


# 8. Validation Criteria

## Scenario 1 — Cantidad sin descuento

**Input / Action**

monto=200, cantidadUnidades=9, tope=50

**Expected output**

descuento=0; total=200.00

## Scenario 2 — Descuento del 5% inferior al tope

**Input / Action**

monto=100, cantidadUnidades=10, tope=10

**Expected output**

descuento=5; total=95.00

## Scenario 3 — Descuento del 10% limitado por el tope

**Input / Action**

monto=1000, cantidadUnidades=50, tope=60

**Expected output**

descuento=60; total=940.00

## Scenario 4 — Descuento exactamente igual al tope

**Input / Action**

monto=1000, cantidadUnidades=50, tope=100

**Expected output**

descuento=100; total=900.00

## Scenario 5 — Redondeo único del total luego de aplicar el límite

**Input / Action**

monto=10.05, cantidadUnidades=10, tope=1

**Expected output**

descuento=0.5025; total=9.55

## Scenario 6 — Monto negativo inválido

**Input / Action**

monto=-1, cantidadUnidades=10, tope=5

**Expected output**

lanza error

## Scenario 7 — Cantidad no numérica inválida

**Input / Action**

monto=100, cantidadUnidades='10', tope=5

**Expected output**

lanza error


## Validation Evidence

Pruebas observables de umbrales, casos con descuento menor, igual y mayor que el tope, redondeo half up aplicado una sola vez al total y rechazo de entradas inválidas exigidas.

## Planning Validation Plan

Test command: `node --test dist/discount.test.js`

## Scenario 1 — Límites adyacentes de los umbrales con tope no restrictivo

**Input / Action**

Ejecutar applyDiscountWithCap con (100,9,100), (100,10,100), (100,49,100) y (100,50,100).

**Expected output**

Devuelve respectivamente {discountAmount:0,total:100}, {discountAmount:5,total:95}, {discountAmount:5,total:95} y {discountAmount:10,total:90}.

## Scenario 2 — Descuento nominal mayor que el tope

**Input / Action**

Ejecutar applyDiscountWithCap(1000,50,60).

**Expected output**

Devuelve {discountAmount:60,total:940}; aplica exactamente el tope.

## Scenario 3 — Descuento nominal igual al tope

**Input / Action**

Ejecutar applyDiscountWithCap(1000,50,100).

**Expected output**

Devuelve {discountAmount:100,total:900} sin tratamiento adicional.

## Scenario 4 — Redondeo monetario único después de aplicar el límite

**Input / Action**

Ejecutar applyDiscountWithCap(10.05,10,1).

**Expected output**

Devuelve {discountAmount:0.5025,total:9.55}; conserva el descuento sin redondear y redondea half up solamente el total final.

## Scenario 5 — Rechazo de monto o cantidad inválidos

**Input / Action**

Ejecutar llamadas separadas con amount=-1, amount='100', unitQuantity=-1 y unitQuantity='10', usando valores válidos para los otros argumentos.

**Expected output**

Cada llamada lanza Error y no devuelve cálculo parcial.

### Evidence Required

- Salida exitosa del runner nativo para dist/discount.test.js
- Aserciones observables de los cuatro límites 9, 10, 49 y 50
- Aserciones de descuento menor, igual y mayor que el tope
- Aserción del caso monetario 10.05 con descuento 0.5025 y total 9.55
- Aserciones de Error para monto y cantidad negativos o no numéricos

## QA Result 1 — Attempt 1

Test status: failed

Evidence: El runner TAP ejecutó 9 pruebas: 8 aprobaron y 1 falló por deepStrictEqual; discountAmount real fue 0.5025000000000001 frente a 0.5025 esperado, mientras total fue 9.55.

### Tests Executed

- node --test dist/discount.test.js

### Defects

- applyDiscountWithCap(10.05, 10, 1) devuelve discountAmount con error de precisión binaria: 0.5025000000000001 en vez de 0.5025.

### Observations

- Las otras 8 pruebas aprobaron.
- El total del caso fallido sí fue el esperado: 9.55.

## QA Result 2 — Attempt 2

Test status: passed

Evidence: El runner TAP finalizó con exitCode 0: 9 pruebas ejecutadas, 9 aprobadas, 0 fallidas; timedOut=false y stderr vacío.

### Tests Executed

- node --test dist/discount.test.js

### Defects

- None.

### Observations

- Pasaron los casos de umbrales, aplicación del tope, igualdad con el tope, conservación del descuento sin redondear, redondeo único del total y rechazo de entradas inválidas.

# 9. Risks

## Functional Risks

- La representación binaria de decimales puede afectar el resultado half up si no se verifica con casos monetarios de frontera.
- Las integraciones podrían asumir que el descuento devuelto está redondeado, aunque el requisito solo ordena redondear el total final.

## Technical Risks

- La aritmética binaria puede alterar casos de frontera del redondeo half up.
- Reutilizar el total ya redondeado de applyVolumeDiscount en vez de recalcularlo desde el descuento limitado produciría resultados incorrectos.
- Redondear discountAmount cambiaría el contrato funcional que exige conservarlo sin redondeo.

## Quality and Readiness Risks

- La aritmética binaria altera el valor contractual exacto de discountAmount en casos monetarios.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
