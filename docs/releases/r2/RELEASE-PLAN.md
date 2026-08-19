# Release Plan

## 0. Evaluación de Tamaño del Release

- **Cantidad de Features en este release:** 1
- **Factores de riesgo considerados:** Lógica monetaria sensible al redondeo binario; La nueva función depende del cálculo por umbrales ya existente; Debe preservarse el contrato de applyVolumeDiscount
- **Conclusión:** Riesgo razonable

## 1. Secuencia del Release

| Orden | Feature | Motivo del orden |
|---|---|---|
| 1 | Descuento por volumen con tope configurable | Es la única Feature del release r2 y extiende directamente el cálculo por volumen existente. |

## 2. Por Feature — Enfoque Técnico y Test Plan

### 2.1 — Descuento por volumen con tope configurable

**Enfoque técnico:**

- Componentes afectados: src/discount.ts; src/discount.test.ts; dist/discount.js; dist/discount.test.js
- Impacto: Extensión localizada del paquete TypeScript con una nueva función pura; no modifica infraestructura, persistencia, integraciones externas ni el contrato de applyVolumeDiscount.
- Alternativas consideradas: Duplicar los umbrales en la nueva función, descartado porque divergiría de la lógica centralizada.; Usar el total ya redondeado de applyVolumeDiscount, descartado porque el tope exige recalcular el total y redondearlo una sola vez después de limitar el descuento.

**Test Plan:**

- Nivel de testing: L2
- Escenarios:
  - Límites adyacentes de los umbrales con tope no restrictivo: Ejecutar applyDiscountWithCap con (100,9,100), (100,10,100), (100,49,100) y (100,50,100). → Devuelve respectivamente {discountAmount:0,total:100}, {discountAmount:5,total:95}, {discountAmount:5,total:95} y {discountAmount:10,total:90}.
  - Descuento nominal mayor que el tope: Ejecutar applyDiscountWithCap(1000,50,60). → Devuelve {discountAmount:60,total:940}; aplica exactamente el tope.
  - Descuento nominal igual al tope: Ejecutar applyDiscountWithCap(1000,50,100). → Devuelve {discountAmount:100,total:900} sin tratamiento adicional.
  - Redondeo monetario único después de aplicar el límite: Ejecutar applyDiscountWithCap(10.05,10,1). → Devuelve {discountAmount:0.5025,total:9.55}; conserva el descuento sin redondear y redondea half up solamente el total final.
  - Rechazo de monto o cantidad inválidos: Ejecutar llamadas separadas con amount=-1, amount='100', unitQuantity=-1 y unitQuantity='10', usando valores válidos para los otros argumentos. → Cada llamada lanza Error y no devuelve cálculo parcial.
- Evidencia requerida: Resultado exitoso de node --test dist/discount.test.js; Salidas funcionales observables para umbrales, aplicación del tope y redondeo; Errores observables para monto y cantidad inválidos
- Ambiente de validación: Entorno local de desarrollo después del build TypeScript; también reproducible en el pipeline de integración continua.

## 3. Hallazgos y Anomalías

La prueba mínima válida es L2 y acotada a cinco casos. No hay integraciones ni escrituras externas. Se retienen como regresión los límites 9/10/49/50, las relaciones menor/igual/mayor respecto del tope, el caso de redondeo monetario y la validación de entradas, conforme a la configuración vigente.
