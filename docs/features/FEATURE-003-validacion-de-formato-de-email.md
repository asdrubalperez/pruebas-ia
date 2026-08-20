# FEATURE-003 — Validación de formato de email

## 1. Feature Identity

- **Feature:** FEATURE-003
- **Name:** Validación de formato de email
- **Release:** r1
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

Las integraciones internas aplican validaciones de formato diferentes, lo que produce resultados inconsistentes durante el registro de usuarios.

# 3. Functional Goal

Centralizar la validación mínima del formato de email mediante isValidEmailFormat(email), con un contrato uniforme, determinístico y reutilizable.

# 4. Scope

## Included

- Aceptar una dirección de email como argumento
- Lanzar un error cuando el argumento no sea string
- Devolver true para strings con estructura usuario@dominio.tld
- Devolver false para strings que no cumplan la estructura requerida
- Cubrir el contrato con pruebas automatizadas

## Excluded

- Validar si el dominio pertenece a una lista permitida
- Verificar DNS, registros MX o existencia real del dominio
- Persistir direcciones o resultados
- Incorporar UI, endpoints o servicios de red

## Future Ideas

- None.

# 5. Functional Rules

1. El argumento email debe ser de tipo string; cualquier otro tipo debe provocar un error.
2. Toda entrada string debe producir un resultado booleano y no un error de formato.
3. Un formato válido debe contener una parte de usuario no vacía, un único separador @, un dominio no vacío y un sufijo no vacío separado del dominio mediante un punto.
4. Si falta un componente obligatorio, existe más de un separador @ o no existe la separación dominio.tld, el resultado debe ser false.
5. La función debe ser determinística y no debe persistir datos ni consultar recursos externos.

# 6. Estrategia Algorítmica

Not applicable.

# 7. Technical Considerations

## Planning Contribution

Implementar y exportar una función síncrona, pura y determinística que valide explícitamente el tipo de entrada y luego evalúe únicamente la estructura mínima usuario@dominio.tld definida para r1.

### Affected Components

- src/email-validator.mjs
- src/email-validator.test.mjs

### Dependencies

- Node.js
- node:test
- node:assert/strict

## Developer Implementation 1

Implementación localizada de isValidEmailFormat y su regresión L2 conforme al plan.

### Files Changed

- src/email-validator.mjs
- src/email-validator.test.mjs

### Decisions

- Lanzar TypeError antes de validar el formato cuando la entrada no es string.
- Usar una expresión regular acotada al contrato mínimo, sin validación RFC, DNS ni efectos externos.
- Agrupar las entradas equivalentes dentro de los cuatro casos de prueba exigidos.

### Technical Evidence

- El módulo exporta una función síncrona, pura y determinística.
- El test cubre resultado true y tipo boolean para usuario@empresa.com.
- El test cubre todos los formatos inválidos y tipos no string especificados por Planning.
- Se conservaron exactamente la ruta src/email-validator.test.mjs y el contrato del comando node --test src/email-validator.test.mjs.

## Developer Implementation 2

Se eliminó el BOM UTF-8 inicial de package.json para restaurar su validez JSON sin alterar la configuración del proyecto.

### Files Changed

- package.json

### Decisions

- Corregir únicamente la causa señalada por dependencyInstallationFailureReason.
- No modificar src/email-validator.mjs, src/email-validator.test.mjs ni COMANDO_TEST.
- No ejecutar instalación de dependencias ni build, conforme a las reglas de la fase.

### Technical Evidence

- package.json ahora comienza directamente con { y contiene 117 bytes de JSON legible.
- Se preservaron name, version, private y el script build existentes.

## Developer Readiness — Attempt 2

Status: ready

La implementación está lista: el comando de prueba acordado ejecutó los 4 casos y todos fueron aprobados.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- QA reportó 4 pruebas aprobadas de 4, 0 fallidas y stderr vacío.
- No se realizaron cambios durante el turno post-QA.


# 8. Validation Criteria

## Scenario 1 — Email con formato válido

**Input / Action**

usuario@empresa.com

**Expected output**

true

## Scenario 2 — Entrada sin separador @

**Input / Action**

usuario.empresa.com

**Expected output**

false

## Scenario 3 — Parte de usuario vacía

**Input / Action**

@empresa.com

**Expected output**

false

## Scenario 4 — Dominio vacío

**Input / Action**

usuario@

**Expected output**

false

## Scenario 5 — Dominio sin sufijo separado por punto

**Input / Action**

usuario@empresa

**Expected output**

false

## Scenario 6 — Más de un separador @

**Input / Action**

usuario@@empresa.com

**Expected output**

false

## Scenario 7 — Nombre de dominio vacío antes del sufijo

**Input / Action**

usuario@.com

**Expected output**

false

## Scenario 8 — Argumento no string

**Input / Action**

null

**Expected output**

Se lanza un error


## Validation Evidence

Pruebas automatizadas aprobadas que demuestren al menos un formato válido, los formatos inválidos representativos y entradas no string, usando datos ficticios y sin comprobaciones externas.

## Planning Validation Plan

Test command: `node --test src/email-validator.test.mjs`

## Scenario 1 — Formato mínimo válido

**Input / Action**

Invocar isValidEmailFormat con usuario@empresa.com y observar valor y tipo del resultado.

**Expected output**

Devuelve true de tipo boolean y no lanza errores.

## Scenario 2 — Componentes obligatorios ausentes

**Input / Action**

Invocar separadamente con usuario.empresa.com, @empresa.com, usuario@ y usuario@empresa.

**Expected output**

Cada invocación devuelve false de tipo boolean y ninguna lanza errores.

## Scenario 3 — Separadores o dominio inválidos

**Input / Action**

Invocar separadamente con usuario@@empresa.com y usuario@.com.

**Expected output**

Cada invocación devuelve false de tipo boolean.

## Scenario 4 — Argumentos no string

**Input / Action**

Invocar separadamente con null, undefined, 123, true, {}, y [].

**Expected output**

Cada invocación lanza TypeError y no devuelve un booleano.

### Evidence Required

- Salida del comando node --test src/email-validator.test.mjs con los cuatro casos aprobados
- Resultados observables que cubran entrada válida, formatos inválidos y todos los tipos no string indicados
- Uso exclusivo de direcciones ficticias, sin datos personales reales

## QA Result 1 — Attempt 2

Test status: passed

Evidence: node --test src/email-validator.test.mjs: exitCode 0, timedOut false, 4 pruebas aprobadas de 4 y 0 fallidas; stderr vacío.

### Tests Executed

- Formato mínimo válido
- Componentes obligatorios ausentes
- Separadores o componentes de dominio inválidos
- Argumentos no string lanzan TypeError

### Defects

- None.

### Observations

- Los cuatro casos definidos por Planning fueron aprobados por el runner nativo de Node.

# 9. Risks

## Functional Risks

- La expresión formato estándar puede interpretarse de manera más amplia que el contrato mínimo usuario@dominio.tld; las pruebas deben conservar el alcance definido para r1.
- Las integraciones consumidoras pueden tratar incorrectamente el error por tipo inválido como si fuera un resultado false.
- Las evidencias de prueba podrían exponer información personal si se utilizan emails reales.

## Technical Risks

- Ampliar accidentalmente el contrato hacia una validación RFC completa o hacia reglas de dominios reservadas para r2
- Aceptar más de un separador @ o componentes vacíos por una expresión de validación demasiado permisiva
- Devolver false para tipos no string en vez de lanzar TypeError

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
