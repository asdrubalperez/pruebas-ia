# Project Brief

## 0. Chequeo Declarativo

| Campo | Valor |
|---|---|
| Identidad del sistema | Nueva solución: módulo interno de descuentos por volumen para el sistema de facturación. |
| Ubicación y forma de acceso al código fuente | No Aplica: iniciativa greenfield sin repositorio preexistente informado. |
| Restricciones de negocio | Solo funciones puras en TypeScript, sin persistencia ni UI; sin múltiples monedas ni descuentos combinables; monto y tope positivos; monto y cantidadUnidades inválidos o negativos deben producir un error. |
| Intención/objetivo de negocio | Eliminar inconsistencias de umbrales entre integraciones y garantizar que ningún descuento supere un tope explícito. |

## 1. Contexto de la Iniciativa

- **Problema que se busca resolver:** Las integraciones calculan descuentos con umbrales hardcodeados e inconsistentes y sin límite máximo, lo que puede generar descuentos superiores al 100%.
- **Situación actual del sistema/negocio:** Cada integración implementa manualmente la lógica de descuento por volumen, duplicando reglas y generando resultados divergentes.
- **Valor esperado:** Un cálculo interno consistente, reutilizable, acotado y cubierto por pruebas, sin duplicación entre integraciones.

## 2. Evaluación Preliminar

| Ítem | Estado | Comentario |
|---|---|---|
| Reutiliza componentes o servicios ya existentes en el proyecto | No | Se plantea un módulo nuevo y no se informaron componentes existentes para reutilizar. |
| Introduce integraciones nuevas con sistemas externos | No | El alcance es un paquete interno de funciones puras, sin integraciones externas. |
| Maneja datos sensibles (PII, financieros, credenciales, etc.) | Parcial | Procesa montos de facturación, pero no persiste datos ni se indicó tratamiento de PII o credenciales. |
| Contiene componentes de IA/ML | No | La solución consiste en reglas determinísticas de cálculo. |
| Requiere infraestructura nueva o cambios de despliegue | No | No se informaron servicios, persistencia ni infraestructura adicional; se entrega como paquete interno. |
| Requiere nueva base de datos o almacenamiento | No | El alcance excluye expresamente la persistencia. |
| Impacta procesos críticos / alta disponibilidad requerida | Parcial | La lógica participa en facturación, pero no se declaró un requisito de alta disponibilidad para el paquete interno. |
| Expone algo nuevo a Internet / superficie de ataque nueva | No | No existe canal de usuario final ni API expuesta a Internet. |

## 3. Esquema Preliminar de Solución (TO BE)

- **Flujo esperado:** Una integración invoca la función con monto y cantidad; el módulo valida entradas, determina el porcentaje por umbral, calcula el descuento y devuelve descuento y total. En la evolución, compara el descuento calculado con el tope y aplica el menor valor permitido.
- **Sistemas/componentes involucrados:** Sistema de facturación, integraciones internas consumidoras y paquete interno TypeScript de descuentos.
- **Integraciones necesarias:** Consumo del paquete por las integraciones internas existentes; no se requieren sistemas externos.
- **¿Expuesto a Internet?:** No; módulo de código interno sin canal de usuario final.

## 4. Conclusión

- **Complejidad técnica estimada:** Baja

## 5. Hallazgos y Anomalías

El alcance utiliza funciones puras, reglas determinísticas y no requiere UI, persistencia, servicios externos ni infraestructura nueva. La separación en dos releases preserva la entrega inicial simple y posterga el tope configurable.
