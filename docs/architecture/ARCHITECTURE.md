# Architecture

## 0. Roadmap de Releases

| Release | Alcance (resumen) | Estado |
|---|---|---|
| MVP — descuento simple por umbral | Función applyVolumeDiscount con umbrales fijos, validaciones, resultado de descuento y total, redondeo half up a dos decimales y pruebas. | Activo |
| Evolución — tope máximo configurable | Función applyDiscountWithCap que reutiliza el cálculo por umbral y limita el descuento absoluto a un tope monetario configurable, sin segundo redondeo. | Pendiente |

## 1. Análisis Técnico

- **Descripción macro de la arquitectura:** Paquete interno TypeScript de cálculo determinístico. Una función base valida entradas, selecciona el umbral, calcula el descuento y produce descuento y total; la evolución reutiliza esa lógica y aplica un límite absoluto antes de devolver el resultado.
- **Backend:** Funciones puras TypeScript consumidas por módulos internos de facturación; sin servicio de red propio.
- **Frontend:** No Aplica: el alcance no incluye interfaz de usuario.
- **Bases de datos:** No Aplica: el alcance excluye persistencia y almacenamiento.
- **Integraciones y APIs:** Integración mediante importación y llamada al paquete interno; no se contemplan APIs ni sistemas externos.
- **¿Requiere infraestructura nueva?** No — El paquete no requiere servicios, bases de datos ni recursos de despliegue adicionales según el alcance declarado.
- **¿Consume servicios externos?** No — Toda la lógica es local y determinística.
- **¿Tecnología nueva para este producto?** Sí — Se incorpora un nuevo paquete interno de funciones puras en TypeScript; no se introducen tecnologías adicionales informadas.

## 2. Componentes Técnicos

| Componente | Tipo | Descripción |
|---|---|---|
| Cálculo de descuento por volumen | Función de dominio | Valida monto y cantidadUnidades, selecciona el porcentaje por umbral y devuelve el descuento y el total con redondeo half up del monto final a dos decimales. |
| Aplicación de tope de descuento | Función de dominio | Evolución que reutiliza el cálculo por volumen y limita el descuento absoluto al tope indicado, aplicándolo exactamente cuando sea menor que el descuento calculado y sin segundo redondeo. |

## 3. Análisis de Riesgo

| Situación Analizada | Riesgo | Impacto | Severidad | Acción Recomendada |
|---|---|---|---|---|
| Migración de integraciones con umbrales hardcodeados al paquete común. | Medio | Medio | Alta | Verificar mediante pruebas de contrato que todas las integraciones adopten los mismos límites 1, 10, 49 y 50 y consuman la salida acordada. |
| Cálculos monetarios y redondeo del total. | Medio | Alto | Alta | Cubrir límites, decimales y casos de redondeo half up con pruebas determinísticas que comprueben descuento y total. |
| Aplicación posterior del tope monetario. | Medio | Alto | Alta | Probar descuentos menores, iguales y mayores al tope, verificando que el tope se aplique exactamente y que no exista un segundo redondeo. |
| Entradas inválidas o negativas. | Bajo | Medio | Baja | Definir pruebas de error para valores no numéricos y negativos de monto y cantidadUnidades, y para el contrato positivo de tope en el segundo release. |

## 4. Hallazgos y Anomalías

La arquitectura se limita al paquete interno solicitado. No se agregan UI, persistencia, APIs externas, soporte multimoneda ni composición de descuentos.
