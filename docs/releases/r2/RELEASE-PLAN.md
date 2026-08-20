# Release Plan

## 0. Evaluación de Tamaño del Release

- **Cantidad de Features en este release:** 1
- **Factores de riesgo considerados:** Dependencia acotada del validador de formato existente; Contrato público nuevo con lógica pura y sin integraciones ni escrituras externas; Riesgo localizado de aceptar coincidencias parciales por una normalización incorrecta
- **Conclusión:** Riesgo razonable

## 1. Secuencia del Release

| Orden | Feature | Motivo del orden |
|---|---|---|
| 1 | Validación de dominios permitidos | Es la única Feature del release y depende únicamente del contrato de validación de formato ya entregado. |

## 2. Por Feature — Enfoque Técnico y Test Plan

### 2.1 — Validación de dominios permitidos

**Enfoque técnico:**

- Componentes afectados: src/email.ts; src/email.test.ts; dist/email.test.js
- Impacto: Añade una función pública pura y una regresión automatizada localizada, sin persistencia, red ni cambios arquitectónicos.
- Alternativas consideradas: Duplicar la expresión o reglas de validación, descartado por riesgo de divergencia; Aceptar dominios por sufijo o dominio padre, descartado por contradecir la coincidencia exacta requerida

**Test Plan:**

- Nivel de testing: L2
- Escenarios:
  - Coincidencia exacta autorizada: Invocar isAllowedDomain con usuario@empresa.com y [empresa.com]. → Devuelve true.
  - Coincidencia exacta insensible a mayúsculas: Invocar isAllowedDomain con usuario@EMPRESA.COM y [empresa.com]. → Devuelve true.
  - Entradas inválidas: Invocar por separado con usuario@ y con 42, usando [empresa.com]. → Ambas invocaciones devuelven false y ninguna lanza excepción.
  - Dominio ausente o lista vacía: Invocar con usuario@externo.com y [empresa.com], y con usuario@empresa.com y []. → Ambas invocaciones devuelven false.
  - Subdominio no declarado: Invocar con usuario@sub.empresa.com y [empresa.com]. → Devuelve false porque no existe igualdad del dominio completo.
- Evidencia requerida: Salida completa del runner nativo de Node con todos los escenarios aprobados; Valores booleanos observables para cada contrato funcional; Confirmación observable de que las entradas inválidas no producen excepciones; Uso exclusivo de direcciones sintéticas en la evidencia
- Ambiente de validación: Entorno automatizado de pruebas del paquete interno, ejecutado localmente sobre la salida de build dist/email.test.js

## 3. Hallazgos y Anomalías

El nivel L2 cubre la lógica localizada y el área sensible de validación de emails con cinco escenarios representativos. La prueba se retiene como regresión por proteger el nuevo contrato público; no se requieren ambientes reales, integraciones externas ni evidencia de persistencia.
