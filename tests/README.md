# Tests

Esta biblioteca utiliza [Vitest](https://vitest.dev/) para testing unitario.

## Instalación

```bash
npm install --save-dev vitest@latest @vitest/coverage-v8@latest
```

## Ejecutar Tests

```bash
# Ejecutar tests una vez
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

## Resultados Actuales

**44 tests pasando** ✅

### Coverage

- **errors.ts**: 93.18% cobertura
- **http.ts**: 70.33% cobertura
- **index.test.ts**: 100% cobertura

| File              | % Stmts | % Branch | % Funcs | % Lines |
| ----------------- | ------- | -------- | ------- | ------- |
| src/api/errors.ts | 93.18   | 75       | 100     | 93.18   |
| src/api/http.ts   | 20.96   | 78.94    | 30      | 20.96   |

_Nota: http.ts tiene coverage bajo porque solo testeamos las funciones helpers básicas. Las funciones de API request requieren mocking de fetch._

## Estructura de Tests

### `src/api/errors.test.ts`

Tests para manejo de errores de la API de WordPress:

- Creación de `WPApiError` con diferentes status codes
- Detección de tipos de error (client, server, auth, not found, rate limit)
- Mensajes user-friendly según el status code
- Parsing de respuestas de error de WordPress
- Función `handleApiError()`

### `src/api/http.test.ts`

Tests para utilidades HTTP:

- `buildSearchParams()`: construcción de parámetros URL
  - Manejo de arrays (categories, tags)
  - Parámetro especial `_embed`
  - Parámetro especial `_fields`
  - Valores undefined
- `buildUrl()`: construcción de URLs completas
- `buildResourcePath()`: construcción de paths con IDs

### `src/index.test.ts`

Tests de integración:

- Verificación de exports de endpoints
- Verificación de exports de helpers
- Creación de endpoints con configuración básica

## Agregar Nuevos Tests

Los tests siguen la estructura estándar de Vitest:

```typescript
import { describe, it, expect } from "vitest";

describe("Feature Name", () => {
  it("should do something", () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

## Configuración

Ver `vitest.config.ts` para la configuración de Vitest. Los tests están configurados con:

- Globals habilitados (no necesitas importar describe/it/expect)
- Entorno Node.js
- Coverage con v8
- Exclusión de node_modules, dist, types, examples, docs
