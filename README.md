# structure-verifier

Libreria de validacion para TypeScript orientada a esquemas declarativos, tipado inferido y errores detallados por ruta.

Ideal para validar payloads de API, formularios, configuraciones y estructuras anidadas complejas.

Version actual: 0.0.17

## Contenido

- Caracteristicas
- Instalacion
- Inicio rapido
- Conceptos base
- API publica
- Referencia completa de validadores
- Transformaciones de valores
- Tipado inferido
- Manejo de errores
- Ejemplos avanzados
- Scripts de desarrollo

## Caracteristicas

- Validadores para number, string, boolean, uuid, date, array, object y any.
- Soporte para estructuras anidadas con errores por ruta.
- API fluida por clases y API de fabrica mediante Verifiers.
- Tipado inferido en compile-time para mantener consistencia del dominio.
- Personalizacion de mensajes por regla y por validador.
- Integracion con dayjs (exportado como datetime) para manejo de fechas.

## Instalacion

```bash
npm install structure-verifier
```

## Inicio rapido

```ts
import { Verifiers as V, VerificationError } from "structure-verifier";

const userVerifier = V.ObjectNotNull(
  {
    id: V.UUIDNotNull({ version: 4 }),
    name: V.StringNotNull({ minLength: 2 }),
    age: V.Number({ min: 0 }),
    active: V.BooleanNotNull(),
    tags: V.ArrayNotNull(V.StringNotNull()).minLength(1),
  },
  {
    strictMode: true,
  },
);

try {
  const user = userVerifier.check({
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Ana",
    age: "31",
    active: "true",
    tags: ["admin"],
  });

  console.log(user);
} catch (error) {
  if (error instanceof VerificationError) {
    console.log(error.message);
    console.log(error.errors);
    console.log(error.errorsObj);
  }
}
```

## Conceptos base

### 1) Nullable vs NotNull

- VNumber, VString, VBoolean, VDate, VUUID, VArray y VObject retornan tipo nullable.
- Sus versiones NotNull retornan el tipo requerido.
- Tambien puedes promover un validador nullable a requerido con required().

### 2) Reglas comunes

Muchos validadores comparten estas opciones:

- isRequired: fuerza que el valor exista.
- emptyAsNull: transforma string vacio a null antes de validar.
- defaultValue: valor por defecto para undefined y, en algunos casos, null.
- badTypeMessage: reemplaza el mensaje de tipo invalido.

### 3) Mensajes personalizados

Las reglas aceptan mensajes de estas formas:

- String fijo.
- Funcion callback con el objeto de valores de la regla.
- Objeto con estructura val + message.

Ejemplo:

```ts
const age = V.NumberNotNull().min(18, (v) => `Edad minima: ${v.min}`);
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

Tambien se exportan los tipos de condiciones:

- VAnyConditions
- VArrayConditions
- VBooleanConditions
- VDateConditions
- VNumberConditions
- VObjectConditions
- VObjectConditionsNotNull
- VStringConditions
- VUUIDConditions

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

### Callable constructors

En Verifiers puedes usar los miembros como funcion o con new.

```ts
const a = V.NumberNotNull({ min: 1 });
const b = new V.NumberNotNull({ min: 1 });
```

## Referencia completa de validadores

### Number y NumberNotNull

Retorno:

- VNumber: number | null
- VNumberNotNull: number

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

Comportamiento clave:

- Convierte el valor usando Number(data).
- Rechaza string vacio y NaN.

Ejemplo:

```ts
const priceV = V.NumberNotNull().min(0).maxDecimalPlaces(2);
const price = priceV.check("25.99");
```

### String y StringNotNull

Retorno:

- VString: string | null
- VStringNotNull: string

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

Comportamiento clave:

- En modo normal convierte con String(data).
- En strictMode exige string real.
- ignoreCase afecta in y notIn.

Ejemplo:

```ts
const roleV = V.StringNotNull()
  .ignoreCase()
  .in(["admin", "user", "guest"])
  .trim()
  .toLowerCase();

const role = roleV.check(" ADMIN ");
```

### Boolean y BooleanNotNull

Retorno:

- VBoolean: boolean | null
- VBooleanNotNull: boolean

Condiciones:

- strictMode
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Comportamiento clave:

- En modo normal acepta: true, false, 1, 0, "1", "0", "true", "false".
- En strictMode solo acepta boolean.

Ejemplo:

```ts
const active = V.BooleanNotNull().check("true");
const strictActive = V.BooleanNotNull().strictMode().check(true);
```

### UUID y UUIDNotNull

Retorno:

- VUUID: string | null
- VUUIDNotNull: string

Condiciones:

- version (1 | 2 | 3 | 4 | 5)
- allowNoHyphens
- strictMode
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Comportamiento clave:

- Normaliza salida a minusculas y formato con guiones.
- Si allowNoHyphens no esta activo, exige formato 8-4-4-4-12.

Ejemplo:

```ts
const uuidV = V.UUIDNotNull().version(4);
const id = uuidV.check("550E8400E29B41D4A716446655440000");
```

### Date y DateNotNull

Retorno:

- VDate: datetime.Dayjs | null
- VDateNotNull: datetime.Dayjs

Condiciones:

- format
- timeZone
- maxDate
- minDate
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Comportamiento clave:

- Entradas soportadas: number, string, Date y datetime.Dayjs.
- Si no defines timeZone usa UTC por defecto.
- Si format no incluye zona horaria, se aplica la zona configurada.

Ejemplo:

```ts
import { Verifiers as V, datetime } from "structure-verifier";

const dateV = V.DateNotNull()
  .format("YYYY-MM-DD")
  .timeZone("America/Mexico_City")
  .minDate(datetime("2024-01-01"));

const d = dateV.check("2025-05-10");
```

### Array y ArrayNotNull

Firma:

```ts
const tagsV = V.Array(V.StringNotNull(), { minLength: 1 });
const tagsRequiredV = V.ArrayNotNull(V.StringNotNull(), { minLength: 1 });
```

Retorno:

- VArray: ReturnType<T["check"]>[] | null
- VArrayNotNull: ReturnType<T["check"]>[]

Condiciones:

- minLength
- maxLength
- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

Comportamiento clave:

- Valida item por item con el verificador interno.
- En errores anidados agrega rutas como [0], [1].name.

### Object y ObjectNotNull

Firma:

```ts
const userV = V.Object(
  {
    name: V.StringNotNull(),
    age: V.Number(),
  },
  {
    strictMode: true,
    ignoreCase: false,
    takeAllValues: false,
  },
);
```

Retorno:

- VObject: objeto tipado | null
- VObjectNotNull: objeto tipado

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

Comportamiento clave:

- strictMode rechaza propiedades no declaradas.
- ignoreCase permite mapear llaves sin distinguir mayusculas.
- takeAllValues conserva propiedades extra en la salida.
- conds ejecuta una validacion final con el objeto ya validado.

### Any

Retorno:

- VAny: any | null

Condiciones:

- isRequired
- emptyAsNull
- defaultValue
- badTypeMessage

## Transformaciones de valores

La clase base Verifier incluye transform(mapper), que permite postprocesar la salida validada sin perder la validacion previa.

String y StringNotNull incluyen helpers listos:

- trim
- trimStart
- trimEnd
- toLowerCase
- toUpperCase
- removeAccents
- padStart
- padEnd

Ejemplo:

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

Cuando una validacion falla se lanza VerificationError.

Propiedades principales:

- message: todos los errores concatenados por punto y coma.
- errors: arreglo de mensajes planos.
- errorsObj: arreglo de objetos con key, message y metadatos.

Ejemplo:

```ts
try {
  V.ObjectNotNull({
    name: V.StringNotNull({ minLength: 3 }),
    tags: V.ArrayNotNull(V.StringNotNull(), { minLength: 1 }),
  }).check({ name: "Al", tags: [] });
} catch (error) {
  if (error instanceof VerificationError) {
    console.log(error.errors);
    console.log(error.errorsObj);
  }
}
```

## datetime (dayjs)

La libreria exporta dayjs como datetime con plugins activados:

- utc
- timezone
- customParseFormat

Ejemplo:

```ts
import { datetime } from "structure-verifier";

const now = datetime();
const utc = now.tz("UTC").format();
console.log(utc);
```

## Ejemplos avanzados

### Validacion de payload API

```ts
const createOrderV = V.ObjectNotNull(
  {
    customerId: V.UUIDNotNull({ version: 4 }),
    items: V.ArrayNotNull(
      V.ObjectNotNull({
        sku: V.StringNotNull({ minLength: 1 }),
        quantity: V.NumberNotNull({ min: 1 }),
      }),
      { minLength: 1 },
    ),
    createdAt: V.DateNotNull().timeZone("UTC"),
  },
  {
    strictMode: true,
  },
);
```

### conds para reglas de negocio

```ts
const personV = V.ObjectNotNull(
  {
    age: V.NumberNotNull({ min: 0 }),
    hasParentalConsent: V.Boolean(),
  },
  {
    conds: (value) => {
      if (value.age < 18 && value.hasParentalConsent !== true) {
        throw new Error("Parental consent is required for minors");
      }
    },
  },
);
```

## Scripts de desarrollo

```bash
npm test
npm run dev
```

## Licencia

ISC
