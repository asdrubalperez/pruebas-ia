# Release Plan

## 0. Evaluación de Tamaño del Release

- **Cantidad de Features en este release:** 1
- **Factores de riesgo considerados:** Una única Feature de lógica localizada, sin persistencia ni integraciones externas
- **Conclusión:** Riesgo razonable

## 1. Secuencia del Release

| Orden | Feature | Motivo del orden |
|---|---|---|
| 1 | Validación de formato de email | Única Feature del release; implementa y valida íntegramente el contrato público de formato de email |

## 2. Por Feature — Enfoque Técnico y Test Plan

### 2.1 — Validación de formato de email

**Enfoque técnico:**

- Componentes afectados: src/email-validator.mjs; src/email-validator.test.mjs
- Impacto: Añade un contrato público puro y localizado para validar strings con estructura mínima de email, sin modificar datos ni depender del entorno.
- Alternativas consideradas: Una validación RFC completa se descarta por exceder el alcance funcional de r1; La validación de dominios permitidos y las comprobaciones DNS/MX se difieren porque pertenecen a r2 o están fuera de alcance

**Test Plan:**

- Nivel de testing: L2
- Escenarios:
  - Formato mínimo válido: Invocar isValidEmailFormat con usuario@empresa.com y observar valor y tipo del resultado. → Devuelve true de tipo boolean y no lanza errores.
  - Componentes obligatorios ausentes: Invocar separadamente con usuario.empresa.com, @empresa.com, usuario@ y usuario@empresa. → Cada invocación devuelve false de tipo boolean y ninguna lanza errores.
  - Separadores o dominio inválidos: Invocar separadamente con usuario@@empresa.com y usuario@.com. → Cada invocación devuelve false de tipo boolean.
  - Argumentos no string: Invocar separadamente con null, undefined, 123, true, {}, y []. → Cada invocación lanza TypeError y no devuelve un booleano.
- Evidencia requerida: Salida aprobada del runner nativo de Node para los cuatro casos; Resultados funcionales observables para true, false y TypeError; Datos ficticios que no expongan direcciones personales reales
- Ambiente de validación: Entorno local de desarrollo o entorno automatizado de pruebas del paquete interno

## 3. Hallazgos y Anomalías

QA aprobó f1. La secuencia completa no contiene Features pendientes; corresponde solicitar aprobación humana para cerrar el release activo r1.
