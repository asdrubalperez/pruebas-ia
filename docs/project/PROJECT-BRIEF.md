# Project Brief

## 0. Chequeo Declarativo

| Campo | Valor |
|---|---|
| Identidad del sistema | Nueva solución: módulo interno de validación de emails para el sistema de registro de usuarios. |
| Ubicación y forma de acceso al código fuente | No Aplica: iniciativa greenfield sin repositorio o código preexistente informado. |
| Restricciones de negocio | Sin persistencia ni UI; solo funciones puras en TypeScript; sin verificación DNS/MX ni existencia real del dominio; las capacidades se entregan en dos releases separados. |
| Intención/objetivo de negocio | Eliminar inconsistencias entre integraciones y evitar registros con dominios no corporativos permitidos mediante una validación centralizada, reutilizable y cubierta por tests. |

## 1. Contexto de la Iniciativa

- **Problema que se busca resolver:** Las integraciones aplican expresiones regulares diferentes y ninguna comprueba el dominio contra una lista corporativa permitida.
- **Situación actual del sistema/negocio:** La validación está duplicada en cada integración, con resultados inconsistentes y sin control centralizado de dominios.
- **Valor esperado:** Validación uniforme y reutilizable, menor duplicación de lógica y prevención de registros con dominios no permitidos.

## 2. Evaluación Preliminar

| Ítem | Estado | Comentario |
|---|---|---|
| Reutiliza componentes o servicios ya existentes en el proyecto | No | Se declara como solución nueva y no se informan componentes existentes para reutilizar. |
| Introduce integraciones nuevas con sistemas externos | No | El módulo contiene funciones puras y no consulta servicios externos, DNS ni MX. |
| Maneja datos sensibles (PII, financieros, credenciales, etc.) | Sí | Procesa direcciones de email, consideradas información personal, aunque no las persiste. |
| Contiene componentes de IA/ML | No | La solución utiliza validaciones determinísticas sin IA ni ML. |
| Requiere infraestructura nueva o cambios de despliegue | No | Es un paquete interno sin servicio desplegable ni infraestructura adicional informada. |
| Requiere nueva base de datos o almacenamiento | No | La ausencia de persistencia es una restricción explícita. |
| Impacta procesos críticos / alta disponibilidad requerida | Parcial | Participa en el registro de usuarios, pero al ser una librería local no se especifica un requisito propio de alta disponibilidad. |
| Expone algo nuevo a Internet / superficie de ataque nueva | No | No incorpora endpoints, UI ni servicios accesibles por Internet. |

## 3. Esquema Preliminar de Solución (TO BE)

- **Flujo esperado:** La integración invoca la función del release activo; el módulo valida la entrada y devuelve el resultado definido por contrato. En r2, primero valida el formato y luego compara el dominio normalizado por mayúsculas/minúsculas con la lista recibida.
- **Sistemas/componentes involucrados:** Paquete interno TypeScript y las integraciones internas del sistema de registro de usuarios que lo consuman.
- **Integraciones necesarias:** No requiere integraciones externas; los consumidores internos incorporarán el paquete.
- **¿Expuesto a Internet?:** No; el módulo no expone endpoints ni canal de usuario final.

## 4. Conclusión

- **Complejidad técnica estimada:** Baja

## 5. Hallazgos y Anomalías

El alcance se limita a dos funciones puras, sin almacenamiento, red, UI ni infraestructura. La separación en releases y los contratos de error y retorno están definidos explícitamente.
