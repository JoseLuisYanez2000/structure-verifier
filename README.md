# structure-verifier 0.0.16

Libreria TypeScript para validar estructuras de datos con tipado inferido.

Permite validar valores simples y estructuras anidadas (objetos y arrays), con errores detallados por ruta (por ejemplo: name, items[0], address.city).

## Instalacion

```bash
npm install structure-verifier
```

## Inicio rapido

```ts
import { Verifiers as V, VerificationError } from "structure-verifier";

const userValidator = V.ObjectNotNull({
  id: V.UUIDNotNull({ version: 4 }),
  name: V.StringNotNull({ minLength: 2 }),
  age: V.Number({ min: 0 }),
  active: V.BooleanNotNull(),
});

try {
  const user = userValidator.check({
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Ana",
    age: 31,
    active: "true",
  });

  // user queda tipado con los tipos inferidos de cada propiedad
  console.log(user);
} catch (error) {
  if (error instanceof VerificationError) {
    console.log(error.errors); // mensajes planos
    console.log(error.errorsObj); // mensajes con key y metadatos
  }
}
```

## API publica

Import principal:

```ts
import {
  Verifiers,
  VerificationError,
  Verifier,
  InferType,
  InferFactoryType,
  VAny,
  VAnyConditions,
  VArray,
  VArrayNotNull,
  VArrayConditions,
  VBoolean,
  VBooleanNotNull,
  VBooleanConditions,
  VDate,
  VDateNotNull,
  VDateConditions,
  VNumber,
  VNumberNotNull,
  VNumberConditions,
  VObject,
  VObjectNotNull,
  VObjectConditions,
  VObjectConditionsNotNull,
  VString,
  VStringNotNull,
  VStringConditions,
  VUUID,
  VUUIDNotNull,
  VUUIDConditions,
  datetime,
} from "structure-verifier";
```

## Formas de uso

La libreria soporta dos estilos:

1. API recomendada con Verifiers (callable, con o sin new)
2. Clases directas (new VString(...), new VObject(...), etc.)

Ejemplo con Verifiers:

```ts
import { Verifiers as V } from "structure-verifier";

const a = V.StringNotNull({ minLength: 3 });
const b = new V.StringNotNull({ minLength: 3 });

console.log(a.check("hola"));
console.log(b.check("hola"));
```

## Inferencia de tipos

### InferType

```ts
import { InferType, Verifiers as V } from "structure-verifier";

const v = V.ObjectNotNull({
  id: V.UUIDNotNull(),
  tags: V.ArrayNotNull(V.StringNotNull()),
});

type User = InferType<typeof v>;
```

### InferFactoryType

Funciona con funciones que retornan un Verifier (por ejemplo, miembros callable de Verifiers).

```ts
import { InferFactoryType, Verifiers as V } from "structure-verifier";

type NullableNumber = InferFactoryType<typeof V.Number>; // number | null
type RequiredNumber = InferFactoryType<typeof V.NumberNotNull>; // number
```

## Manejo de errores

Cuando una validacion falla se lanza VerificationError.

```ts
try {
  V.NumberNotNull({ min: 10 }).check(5);
} catch (error) {
  if (error instanceof VerificationError) {
    console.log(error.errors); // ["debe ser mayor o igual a 10"]
    console.log(error.errorsObj); // [{ key: "", message: "..." }]
  }
}
```

## Opciones comunes

Muchos validadores comparten estas opciones:

- isRequired: fuerza que el valor exista.
- emptyAsNull: si llega string vacio, se convierte a null antes de validar.
- defaultValue: valor por defecto si llega undefined (y en algunos flujos tambien null).
- badTypeMessage: mensaje personalizado de tipo invalido.

Puedes pasar mensajes simples o mensajes dinamicos con estructura:

```ts
{ val: valorReal, message: (values) => "mensaje" }
```

## Validadores

### Number / NumberNotNull

```ts
const n1 = V.Number();
const n2 = V.NumberNotNull();
```

Condiciones:

- min
- max
- in
- notIn
- maxDecimalPlaces
- minDecimalPlaces
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Notas:

- Convierte con Number(data), por lo que acepta strings numericos como "42".
- "" y NaN fallan.

### String / StringNotNull

```ts
const s1 = V.String();
const s2 = V.StringNotNull();
```

Condiciones:

- minLength
- maxLength
- regex
- notRegex
- in
- notIn
- strictMode
- ignoreCase
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Notas:

- En modo no estricto convierte con String(data).
- En strictMode exige typeof data === "string".
- ignoreCase afecta in y notIn.

### Boolean / BooleanNotNull

```ts
const b1 = V.Boolean();
const b2 = V.BooleanNotNull();
```

Condiciones:

- strictMode
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Notas:

- En modo no estricto acepta: true, false, 1, 0, "1", "0", "true", "false" (case-insensitive).
- En strictMode solo acepta boolean real.

### UUID / UUIDNotNull

```ts
const u1 = V.UUID();
const u2 = V.UUIDNotNull();
```

Condiciones:

- version (1 | 2 | 3 | 4 | 5)
- allowNoHyphens
- strictMode
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Notas:

- Devuelve UUID normalizado en minusculas y con guiones.
- Si allowNoHyphens es false, exige formato 8-4-4-4-12.

### Date / DateNotNull

```ts
import { Verifiers as V, datetime } from "structure-verifier";

const d1 = V.Date();
const d2 = V.DateNotNull({
  format: "YYYY-MM-DD",
  timeZone: "UTC",
  minDate: datetime("2024-01-01"),
  maxDate: datetime("2026-12-31"),
});
```

Condiciones:

- format
- timeZone
- minDate
- maxDate
- default
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Notas:

- Retorna instancias dayjs (re-exportado como datetime).
- Inputs soportados: number, string, Date y datetime.Dayjs.
- timeZone por defecto: UTC.

### Any

```ts
const anyVal = V.Any();
```

Condiciones:

- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

### Array / ArrayNotNull

Firma:

```ts
const arr1 = V.Array(verifier, conditions?);
const arr2 = V.ArrayNotNull(verifier, conditions?);
```

Ejemplo:

```ts
const numbers = V.ArrayNotNull(V.NumberNotNull(), {
  minLength: 1,
  maxLength: 5,
});
```

Condiciones:

- minLength
- maxLength
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Notas:

- Valida item por item con el verificador interno.
- En errores anidados utiliza claves como [0], [1].name, etc.

### Object / ObjectNotNull

Firma:

```ts
const o1 = V.Object(properties, conditions?);
const o2 = V.ObjectNotNull(properties, conditions?);
```

Ejemplo:

```ts
const user = V.ObjectNotNull(
  {
    name: V.StringNotNull({ minLength: 3 }),
    age: V.NumberNotNull({ min: 18 }),
  },
  {
    strictMode: true,
    ignoreCase: true,
    takeAllValues: false,
  },
);
```

Condiciones:

- invalidPropertyMessage
- strictMode
- ignoreCase
- takeAllValues
- conds
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Notas:

- strictMode rechaza propiedades extra.
- ignoreCase permite mapear propiedades sin importar mayusculas/minusculas.
- takeAllValues conserva propiedades no definidas en el esquema.
- conds ejecuta una validacion adicional al final con el objeto ya tipado.

## datetime (dayjs)

La libreria re-exporta dayjs como datetime con plugins:

- utc
- timezone
- customParseFormat

Ejemplo:

```ts
import { datetime } from "structure-verifier";

const now = datetime();
console.log(now.tz("UTC").format());
```

## Ejecutar tests del proyecto

```bash
npm test
```
