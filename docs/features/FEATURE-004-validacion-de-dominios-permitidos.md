# FEATURE-004 — Validación de dominios permitidos

## 1. Feature Identity

- **Feature:** FEATURE-004
- **Name:** Validación de dominios permitidos
- **Release:** r2
- **Priority:** P0
- **Template:** runbook-feature@v1.0

# 2. Problem Statement

El sistema centraliza la validación de formato, pero todavía permite registros con dominios no corporativos porque las integraciones no cuentan con una comprobación uniforme contra la lista de dominios autorizados.

# 3. Functional Goal

Proveer isAllowedDomain(email, dominiosPermitidos) para devolver true únicamente cuando el email sea válido y su dominio completo esté incluido en la lista permitida, ignorando diferencias de mayúsculas y minúsculas.

# 4. Scope

## Included

- Validar el formato del email antes de comprobar su dominio
- Devolver false para emails con formato inválido sin lanzar error
- Extraer el dominio de un email válido
- Comparar el dominio completo contra la lista permitida sin distinguir mayúsculas y minúsculas
- Devolver un resultado booleano mediante una función pura en TypeScript

## Excluded

- Validación DNS o MX
- Comprobación de existencia real del dominio
- Persistencia de dominios permitidos
- Interfaz de usuario
- Coincidencias parciales, por sufijo o por dominio padre
- Cambios a la validación de formato entregada en el release anterior

## Future Ideas

- None.

# 5. Functional Rules

1. La función debe recibir un email y una lista de dominios permitidos.
2. La función debe aplicar al email las reglas de formato vigentes del release anterior antes de evaluar el dominio.
3. Si el email no tiene formato válido, debe devolver false y no lanzar un error.
4. Si el email es válido, debe comparar su dominio completo con cada dominio de la lista.
5. La comparación debe ser exacta y no distinguir mayúsculas de minúsculas.
6. Una coincidencia parcial, por sufijo, por dominio padre o por subdominio no debe aceptarse salvo que el dominio completo figure explícitamente en la lista.
7. Si la lista está vacía o no contiene una coincidencia exacta, debe devolver false.
8. La función no debe consultar servicios externos ni verificar la existencia real del dominio.

# 6. Estrategia Algorítmica

## Objective

Resolver de forma determinista si el dominio completo de un email válido pertenece a la lista autorizada.

## Inputs

- Email a evaluar
- Lista de dominios permitidos

## Outputs

- true cuando existe una coincidencia exacta insensible a mayúsculas y minúsculas
- false cuando el formato es inválido o no existe una coincidencia exacta

## Constraints

- Reutilizar conceptualmente las reglas de formato vigentes
- No propagar errores de formato desde esta operación
- No realizar consultas DNS/MX
- No aceptar coincidencias parciales

## Tie Breakers

- Ante ausencia de coincidencia exacta, devolver false
- La presencia de dominios similares no prevalece sobre la exigencia de igualdad completa

## Deterministic Regressions

## Scenario 1 — Email inválido

**Input / Action**

email=usuario@, dominiosPermitidos=[empresa.com]

**Expected output**

false sin lanzar error

## Scenario 2 — Subdominio no declarado

**Input / Action**

email=usuario@sub.empresa.com, dominiosPermitidos=[empresa.com]

**Expected output**

false


# 7. Technical Considerations

## Planning Contribution

Reutilizar la validación de formato vigente; si falla o la entrada no cumple su contrato, devolver false sin propagar excepciones. Para emails válidos, extraer el dominio completo y compararlo con cada elemento permitido mediante igualdad exacta tras normalizar únicamente mayúsculas y minúsculas.

### Affected Components

- src/email.ts
- src/email.test.ts
- dist/email.test.js

### Dependencies

- Validador de formato de email entregado en el release anterior
- Configuración de build TypeScript existente

## Developer Implementation 1

Implementación localizada de la validación de dominios permitidos y su regresión L2.

### Files Changed

- src/email.ts
- src/email.test.ts
- package.json

### Decisions

- Reutilizar isValidEmailFormat y convertir únicamente su TypeError por entrada no string en false.
- Extraer el dominio solamente después de validar el formato.
- Comparar el dominio completo mediante igualdad exacta tras convertir ambos valores a minúsculas.
- Copiar durante el build los módulos ESM necesarios a dist para respetar el COMANDO_TEST.

### Technical Evidence

- src/email.ts importa el validador vigente en vez de duplicar sus reglas.
- src/email.test.ts contiene cinco pruebas reales que cubren todos los escenarios definidos por Planning.
- El script build produce dist/email.js, dist/email.test.js y dist/email-validator.mjs.
- No se ejecutó el build, conforme a la regla de esta fase que reserva esa operación al Orquestador.

## Developer Readiness — Attempt 1

Status: ready

La implementación está lista: QA aprobó los 5 escenarios planificados y el comando node --test dist/email.test.js finalizó correctamente.

Requires code changes: false

### Known Risks

- None.

### Final Notes

- Resultado: 5 tests ejecutados, 5 aprobados y 0 fallidos.
- Exit code 0, stderr vacío y sin timeout.
- No se realizaron cambios en el turno post-QA.


# 8. Validation Criteria

## Scenario 1 — Dominio autorizado con coincidencia exacta

**Input / Action**

email=usuario@empresa.com, dominiosPermitidos=[empresa.com]

**Expected output**

true

## Scenario 2 — Comparación insensible a mayúsculas y minúsculas

**Input / Action**

email=usuario@EMPRESA.COM, dominiosPermitidos=[empresa.com]

**Expected output**

true

## Scenario 3 — Dominio no autorizado

**Input / Action**

email=usuario@externo.com, dominiosPermitidos=[empresa.com]

**Expected output**

false

## Scenario 4 — Email con formato inválido

**Input / Action**

email=usuario@, dominiosPermitidos=[empresa.com]

**Expected output**

false sin lanzar error

## Scenario 5 — Lista vacía

**Input / Action**

email=usuario@empresa.com, dominiosPermitidos=[]

**Expected output**

false

## Scenario 6 — Coincidencia parcial rechazada

**Input / Action**

email=usuario@sub.empresa.com, dominiosPermitidos=[empresa.com]

**Expected output**

false


## Validation Evidence

Pruebas automatizadas observables deben cubrir coincidencia exacta, diferencias de mayúsculas y minúsculas, dominio ausente, email inválido sin excepción, lista vacía y rechazo de subdominios o coincidencias parciales.

## Planning Validation Plan

Test command: `node --test dist/email.test.js`

## Scenario 1 — Coincidencia exacta autorizada

**Input / Action**

Invocar isAllowedDomain con usuario@empresa.com y [empresa.com].

**Expected output**

Devuelve true.

## Scenario 2 — Coincidencia exacta insensible a mayúsculas

**Input / Action**

Invocar isAllowedDomain con usuario@EMPRESA.COM y [empresa.com].

**Expected output**

Devuelve true.

## Scenario 3 — Entradas inválidas

**Input / Action**

Invocar por separado con usuario@ y con 42, usando [empresa.com].

**Expected output**

Ambas invocaciones devuelven false y ninguna lanza excepción.

## Scenario 4 — Dominio ausente o lista vacía

**Input / Action**

Invocar con usuario@externo.com y [empresa.com], y con usuario@empresa.com y [].

**Expected output**

Ambas invocaciones devuelven false.

## Scenario 5 — Subdominio no declarado

**Input / Action**

Invocar con usuario@sub.empresa.com y [empresa.com].

**Expected output**

Devuelve false porque no existe igualdad del dominio completo.

### Evidence Required

- Salida completa de node --test dist/email.test.js con los cinco escenarios aprobados
- Resultados booleanos observables y ausencia de excepción en entradas inválidas
- Datos sintéticos sin direcciones de email personales reales

## QA Result 1 — Attempt 1

Test status: passed

Evidence: TAP: 5 tests ejecutados, 5 aprobados, 0 fallidos; exitCode 0, timedOut false y stderr vacío.

### Tests Executed

- allows an exact domain match
- matches the complete domain without case sensitivity
- returns false without throwing for invalid email inputs
- rejects a domain that is absent or has no allowed entries
- does not allow an undeclared subdomain

### Defects

- None.

### Observations

- Todos los escenarios definidos por Planning fueron ejecutados por dist/email.test.js.

# 9. Risks

## Functional Risks

- Una normalización más amplia que el cambio de mayúsculas y minúsculas podría aceptar dominios que no coinciden exactamente.
- Duplicar en lugar de respetar las reglas de formato vigentes podría reintroducir inconsistencias entre ambas funciones.

## Technical Risks

- Duplicar las reglas de formato puede generar divergencia respecto del validador vigente.
- Normalizar más que mayúsculas y minúsculas puede aceptar coincidencias parciales o dominios distintos.
- Extraer el dominio antes de validar puede producir resultados incorrectos o excepciones para entradas inválidas.

## Quality and Readiness Risks

- None.

# 10. Approval Gate

Approval mode: manual
Readiness declared by: Developer
QA result: tests passed
Human merge authorization: pending
