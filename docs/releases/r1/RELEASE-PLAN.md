# Release Plan

## 0. Evaluación de Tamaño del Release

- **Cantidad de Features en este release:** 1
- **Factores de riesgo considerados:** Una única Feature de lógica localizada; Áreas sensibles acotadas a cálculo monetario, umbrales, redondeo y validación de entradas
- **Conclusión:** Riesgo razonable

## 1. Secuencia del Release

| Orden | Feature | Motivo del orden |
|---|---|---|
| 1 | Descuento simple por volumen | Única Feature del release; implementa y valida de extremo a extremo el descuento simple por umbral. |

## 2. Por Feature — Enfoque Técnico y Test Plan

### 2.1 — Descuento simple por volumen

**Enfoque técnico:**

- Componentes afectados: src/discount.ts; src/discount.test.ts; configuración de build TypeScript; salidas compiladas en dist
- Impacto: Introduce una función de dominio pura y reutilizable, sin infraestructura, persistencia ni contratos externos; fija el contrato de retorno {discountAmount, total} y centraliza umbrales y redondeo.
- Alternativas consideradas: Usar aritmética decimal mediante una dependencia externa: descartado por el alcance reducido y la ausencia de esa tecnología en la arquitectura vigente.; Redondear el descuento antes de restarlo: descartado porque contradice la regla de redondear una sola vez el total final.

**Test Plan:**

- Nivel de testing: L2
- Escenarios:
  - Fronteras de los tres umbrales: Ejecutar applyVolumeDiscount con monto 100 y cantidades 0, 9, 10, 49, 50 y 51. → Los resultados son, en el mismo orden, {discountAmount:0,total:100}, {discountAmount:0,total:100}, {discountAmount:5,total:95}, {discountAmount:5,total:95}, {discountAmount:10,total:90} y {discountAmount:10,total:90}.
  - Monto cero y redondeo monetario half up: Ejecutar applyVolumeDiscount(0,50) y applyVolumeDiscount(10.10,10). → La primera llamada devuelve {discountAmount:0,total:0}; la segunda devuelve {discountAmount:0.505,total:9.60}, conservando el descuento sin redondeo intermedio.
  - Rechazo de entradas inválidas: Ejecutar la función con (-1,10), (100,-1), ('100',10) y (100,'10'). → Cada llamada lanza Error y ninguna devuelve un resultado de cálculo.
  - Determinismo y pureza observable: Ejecutar dos veces applyVolumeDiscount(100,50) dentro del mismo proceso. → Ambas llamadas devuelven resultados profundamente iguales a {discountAmount:10,total:90} y no producen escrituras ni efectos externos.
- Evidencia requerida: Salida exitosa de node --test dist/discount.test.js; Aserciones automatizadas de fronteras, redondeo y errores; Salida funcional legible que vincule cada prueba con su resultado esperado
- Ambiente de validación: Entorno local de desarrollo o pipeline de integración continua, después del build TypeScript

## 3. Hallazgos y Anomalías

QA aprobó f1 y no quedan Features pendientes. El release puede cerrarse una vez obtenida la aprobación del usuario.
