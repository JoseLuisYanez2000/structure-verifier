# structure-verifier

Libreria de validacion para TypeScript orientada a esquemas declarativos, tipado inferido y errores detallados por ruta.

Ideal para validar payloads de API, formularios, configuraciones y estructuras anidadas.

## Objetivo de esta documentacion

Este README está diseñado para ayudarte a:

- Comprender rápidamente cómo funciona la librería.
- Integrarla de forma sencilla en un proyecto real.
- Conocer el contrato público de la API antes de utilizarla en producción.
- Explorar ejemplos prácticos de validación y tipado.
- Entender las decisiones de diseño y el enfoque de la librería.

## Tabla de contenido

- [Instalacion](#instalacion)
- [Inicio rapido](#inicio-rapido)
- [Conceptos clave](#conceptos-clave)
- [API publica](#api-publica)
- [Estilos de uso](#estilos-de-uso)
- [Validadores disponibles](#validadores-disponibles)
- [Transformaciones](#transformaciones)
- [Tipado inferido](#tipado-inferido)
- [Manejo de errores](#manejo-de-errores)
- [datetime (dayjs)](#datetime-dayjs)
- [Buenas practicas para v1.0.0](#buenas-practicas-para-v100)
- [Scripts de desarrollo](#scripts-de-desarrollo)
- [Licencia](#licencia)

## Instalacion

```bash
npm install structure-verifier
```

## Inicio rapido

```ts
import { Verifiers as V, VerificationError } from "structure-verifier";

const userVerifier = V.ObjectNotNull(
  {
    id: V.UUID({ version: 4 }).required(),
    name: V.StringNotNull({ minLength: 2 }).trim(),
    age: V.Number({ min: 0 }),
    active: V.BooleanNotNull(),
    tags: V.ArrayNotNull(V.StringNotNull(), { minLength: 1 }),
  },
  {
    strictMode: true,
  },
);

try {
  const user = userVerifier.check({
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "  Ana  ",
    age: "31",
    active: "true",
    tags: ["admin"],
  });

  console.log(user);
  // {
  //   id: "550e8400-e29b-41d4-a716-446655440000",
  //   name: "Ana",
  //   age: 31,
  //   active: true,
  //   tags: ["admin"]
  // }
} catch (error) {
  if (error instanceof VerificationError) {
    console.error(error.message);
    console.error(error.errors);
    console.error(error.errorsObj);
  }
}
```

## Conceptos clave

### 1) Nullable vs NotNull

- `VNumber`, `VString`, `VBoolean`, `VDate`, `VUUID`, `VArray`, `VObject` y `VAny` pueden devolver `null`.
- Las variantes `NotNull` devuelven siempre tipo requerido.
- En validadores nullable puedes promover a requerido con `.required()`.

### 2) Inmutabilidad de reglas

Cada metodo de regla devuelve una nueva instancia del validador.

```ts
const base = V.StringNotNull();
const withMin = base.minLength(3);

// base no cambia
```

### 3) Reglas transversales

Muchos validadores comparten estas opciones:

- `isRequired`: fuerza existencia del valor.
- `emptyAsNull`: transforma `""` a `null` antes de validar.
- `defaultValue`: valor por defecto para `undefined` y ciertos casos de `null`.
- `badTypeMessage`: reemplaza mensaje de tipo invalido.

### 4) Mensajes personalizados

Puedes pasar mensajes como:

- `string` fijo.
- callback usando el valor de la regla.
- objeto `{ val, message }`.

```ts
const age = V.NumberNotNull().min(18, (v) => `Edad minima: ${v.min}`);
```

## API publica

Import principal recomendado:

```ts
import { Verifiers as V } from "structure-verifier";
```

Import completo disponible:

```ts
import {
  Verifiers,
  VerificationError,
  Verifier,
  InferType,
  InferFactoryType,
  VAny,
  VArray,
  VArrayNotNull,
  VBoolean,
  VBooleanNotNull,
  VDate,
  VDateNotNull,
  VNumber,
  VNumberNotNull,
  VObject,
  VObjectNotNull,
  VString,
  VStringNotNull,
  VUUID,
  VUUIDNotNull,
  datetime,
} from "structure-verifier";
```

Tambien se exportan estos tipos de condiciones:

- `VAnyConditions`
- `VArrayConditions`
- `VBooleanConditions`
- `VDateConditions`
- `VNumberConditions`
- `VObjectConditions`
- `VObjectConditionsNotNull`
- `VStringConditions`
- `VUUIDConditions`

## Estilos de uso

### API de fabrica (recomendada)

```ts
import { Verifiers as V } from "structure-verifier";

const nameV = V.StringNotNull({ minLength: 3 });
```

### Clases directas

```ts
import { VStringNotNull } from "structure-verifier";

const nameV = new VStringNotNull({ minLength: 3 });
```

### Callable constructors en `Verifiers`

Los miembros de `Verifiers` aceptan llamada normal o `new`.

```ts
const a = V.NumberNotNull({ min: 1 });
const b = new V.NumberNotNull({ min: 1 });
```

## Validadores disponibles

### Number / NumberNotNull

Salida:

- `VNumber`: `number | null`
- `VNumberNotNull`: `number`

Reglas:

- `min`
- `max`
- `in`
- `notIn`
- `maxDecimalPlaces`
- `minDecimalPlaces`
- reglas transversales (`isRequired`, `emptyAsNull`, `defaultValue`, `badTypeMessage`)

Comportamiento importante:

- Convierte con `Number(data)`.
- Rechaza `""` y valores `NaN`.

### String / StringNotNull

Salida:

- `VString`: `string | null`
- `VStringNotNull`: `string`

Reglas:

- `minLength`
- `maxLength`
- `regex`
- `notRegex`
- `in`
- `notIn`
- `strictMode`
- `ignoreCase`
- reglas transversales

Comportamiento importante:

- En modo normal convierte con `String(data)`.
- En `strictMode` exige tipo string real.
- `ignoreCase` aplica a reglas `in` y `notIn`.

### Boolean / BooleanNotNull

Salida:

- `VBoolean`: `boolean | null`
- `VBooleanNotNull`: `boolean`

Reglas:

- `strictMode`
- reglas transversales

Comportamiento importante:

- Modo normal acepta: `true`, `false`, `1`, `0`, `"1"`, `"0"`, `"true"`, `"false"`.
- `strictMode` acepta solo boolean real.

### UUID / UUIDNotNull

Salida:

- `VUUID`: `string | null`
- `VUUIDNotNull`: `string`

Reglas:

- `version` (`1 | 2 | 3 | 4 | 5`)
- `allowNoHyphens`
- `strictMode`
- reglas transversales

Comportamiento importante:

- Normaliza salida a minusculas con formato `8-4-4-4-12`.
- Si `allowNoHyphens` es `false`, exige UUID con guiones.

### Date / DateNotNull

Salida:

- `VDate`: `datetime.Dayjs | null`
- `VDateNotNull`: `datetime.Dayjs`

Reglas:

- `format`
- `timeZone`
- `maxDate`
- `minDate`
- reglas transversales

Comportamiento importante:

- Soporta entrada `number`, `string`, `Date` y `datetime.Dayjs`.
- Si no defines `timeZone`, usa `UTC`.
- Si el `format` no incluye zona horaria, aplica la zona configurada.

### Array / ArrayNotNull

Salida:

- `VArray`: `ReturnType<T["check"]>[] | null`
- `VArrayNotNull`: `ReturnType<T["check"]>[]`

Reglas:

- `minLength`
- `maxLength`
- reglas transversales

Comportamiento importante:

- Valida item por item con el verificador interno.
- En errores anidados agrega rutas como `[0]`, `[1].name`, etc.

### Object / ObjectNotNull

Salida:

- `VObject`: objeto tipado o `null`
- `VObjectNotNull`: objeto tipado

Reglas:

- `invalidPropertyMessage`
- `strictMode`
- `ignoreCase`
- `takeAllValues`
- `conds`
- reglas transversales

Comportamiento importante:

- `strictMode`: rechaza propiedades no declaradas.
- `ignoreCase`: permite mapear llaves sin distinguir mayusculas/minusculas.
- `takeAllValues`: conserva propiedades extra en la salida.
- `conds`: ejecuta validacion de negocio final sobre el objeto ya validado.

### Any

Salida:

- `VAny`: `any | null`

Reglas:

- reglas transversales

## Transformaciones

La clase base `Verifier` incluye `transform(mapper)` para postprocesar salida validada.

`VString` y `VStringNotNull` incluyen helpers:

- `trim`
- `trimStart`
- `trimEnd`
- `toLowerCase`
- `toUpperCase`
- `removeAccents`
- `padStart`
- `padEnd`

```ts
const usernameV = V.StringNotNull({ minLength: 3 })
  .trim()
  .toLowerCase()
  .removeAccents();
```

## Tipado inferido

### InferType

```ts
import { InferType, Verifiers as V } from "structure-verifier";

const schema = V.ObjectNotNull({
  id: V.UUIDNotNull(),
  profile: V.ObjectNotNull({
    name: V.StringNotNull(),
    age: V.Number(),
  }),
});

type User = InferType<typeof schema>;
```

### InferFactoryType

```ts
import { InferFactoryType, Verifiers as V } from "structure-verifier";

type NumberMaybe = InferFactoryType<typeof V.Number>;
type NumberRequired = InferFactoryType<typeof V.NumberNotNull>;
```

## Manejo de errores

Cuando una validacion falla se lanza `VerificationError`.

Campos principales:

- `message`: string unico con errores concatenados por `;`.
- `errors`: arreglo de mensajes planos.
- `errorsObj`: arreglo con `key`, `message` y metadatos.

Ejemplo:

```ts
import { Verifiers as V, VerificationError } from "structure-verifier";

try {
  V.ObjectNotNull(
    {
      name: V.StringNotNull({ minLength: 3 }),
      tags: V.ArrayNotNull(V.StringNotNull(), { minLength: 1 }),
    },
    { strictMode: true },
  ).check({ name: "Al", tags: [], extra: true });
} catch (error) {
  if (error instanceof VerificationError) {
    console.log(error.message);
    console.log(error.errors);
    console.log(error.errorsObj);
  }
}
```

Posible salida en `errorsObj`:

```ts
[
  { key: "name", message: "debe tener una longitud minima de 3" },
  { key: "tags", message: "debe tener al menos 1 elementos" },
  { key: "extra", message: "no es una propiedad valida" },
];
```

## datetime (dayjs)

La libreria exporta `dayjs` como `datetime` con plugins habilitados:

- `utc`
- `timezone`
- `customParseFormat`

```ts
import { datetime } from "structure-verifier";

const now = datetime();
const utc = now.tz("UTC").format();
console.log(utc);
```

## Buenas practicas para v1.0.0

- Define siempre `strictMode: true` en payloads de entrada externa.
- Usa variantes `NotNull` en campos de negocio obligatorios.
- Agrega reglas semanticas con `conds` para validaciones cruzadas.
- Encadena normalizaciones (`trim`, `toLowerCase`, etc.) para salida consistente.
- Centraliza mensajes custom cuando quieras UX de errores uniforme.
- Cubre cada esquema critico con pruebas de casos validos e invalidos.

## Licencia

ISC
