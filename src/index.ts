import { VAny, type VAnyConditions } from "./src/verifiers/any/v_any";
import {
  VArray,
  VArrayNotNull,
  type VArrayConditions,
} from "./src/verifiers/array/v_array";
import {
  VBoolean,
  VBooleanNotNull,
  type VBooleanConditions,
} from "./src/verifiers/boolean/v_boolean";
import {
  VDate,
  VDateNotNull,
  type VDateConditions,
} from "./src/verifiers/date/v_date";
import {
  VNumber,
  VNumberNotNull,
  type VNumberConditions,
} from "./src/verifiers/number/v_number";
import {
  VObject,
  VObjectNotNull,
  type VObjectConditions,
  type VObjectConditionsNotNull,
} from "./src/verifiers/object/v_object";
import {
  VString,
  VStringNotNull,
  type VStringConditions,
} from "./src/verifiers/string/v_string";
import {
  VUUID,
  VUUIDNotNull,
  type VUUIDConditions,
} from "./src/verifiers/uuid/v_uuid";
import {
  VDateRange,
  VDateRangeNotNull,
  type VDateRangeConditions,
} from "./src/verifiers/dateRange/v_dateRange";
import { Verifier } from "./src/verifiers/verifier";

export { VerificationError } from "./src/error/v_error";

export { InferFactoryType, InferType } from "./src/verifiers/type";

export { Verifier } from "./src/verifiers/verifier";
export type { SafeCheckResult, RefineMessage } from "./src/verifiers/verifier";
export type { VAnyConditions } from "./src/verifiers/any/v_any";
export type { VArrayConditions } from "./src/verifiers/array/v_array";
export type { VBooleanConditions } from "./src/verifiers/boolean/v_boolean";
export type { VDateConditions } from "./src/verifiers/date/v_date";
export type { VNumberConditions } from "./src/verifiers/number/v_number";
export type {
  VObjectConditions,
  VObjectConditionsNotNull,
} from "./src/verifiers/object/v_object";
export type { VStringConditions } from "./src/verifiers/string/v_string";
export type { VUUIDConditions } from "./src/verifiers/uuid/v_uuid";
export type {
  VDateRangeConditions,
  DateRange,
  StrictDateRange,
  MaxSpan,
  MaxSpanUnit,
} from "./src/verifiers/dateRange/v_dateRange";
export { VNumberNotNull, VNumber } from "./src/verifiers/number/v_number";
export { VStringNotNull, VString } from "./src/verifiers/string/v_string";
export { VBooleanNotNull, VBoolean } from "./src/verifiers/boolean/v_boolean";
export { VObjectNotNull, VObject } from "./src/verifiers/object/v_object";
export { VArrayNotNull, VArray } from "./src/verifiers/array/v_array";
export { VAny } from "./src/verifiers/any/v_any";
export { VDateNotNull, VDate } from "./src/verifiers/date/v_date";
export { VUUIDNotNull, VUUID } from "./src/verifiers/uuid/v_uuid";
export {
  VDateRangeNotNull,
  VDateRange,
} from "./src/verifiers/dateRange/v_dateRange";
export { datetime } from "./src/utils/datetime";

/**
 * Tipo que representa un constructor que puede invocarse con o sin `new`.
 * Permite exponer las factories de `Verifiers` de forma ergonomica.
 */
type CallableCtor<T, A extends any[] = any[]> = {
  (...args: A): T;
  new (...args: A): T;
};

/**
 * Envuelve una factory en una funcion invocable con o sin `new`.
 * @param factory Funcion que crea una instancia del verificador.
 * @returns Factory dual (funcion + constructor).
 */
function callableCtor<T, A extends any[]>(
  factory: (...args: A) => T,
): CallableCtor<T, A> {
  return function (...args: A): T {
    return factory(...args);
  } as CallableCtor<T, A>;
}

/**
 * Namespace principal `Verifiers` con factories listas para usar de cada verificador.
 * Cada propiedad expone una factory invocable con o sin `new`, que retorna la instancia
 * correspondiente (p. ej. `Verifiers.StringNotNull()` o `new Verifiers.StringNotNull()`).
 *
 * @example
 * ```ts
 * import { Verifiers } from "structure-verifier";
 *
 * const schema = Verifiers.ObjectNotNull({
 *   id: Verifiers.UUIDNotNull(),
 *   age: Verifiers.NumberNotNull().min(0),
 * });
 * schema.check(payload);
 * ```
 */
export const Verifiers = {
  /**
   * Clase base abstracta de todos los verificadores.
   * Expone la API comun: `check`, `transform`, `refine`.
   * Util para tipado (`Verifier<T>`) y herencia avanzada.
   */
  Verifier,

  /**
   * Crea un verificador numerico **requerido** (no admite null/undefined).
   * Admite condiciones: `min`, `max`, `in`, `notIn`, `maxDecimalPlaces`, `minDecimalPlaces`.
   *
   * @param cond Configuracion opcional del verificador.
   * @returns Instancia de `VNumberNotNull`.
   *
   * @example
   * ```ts
   * Verifiers.NumberNotNull().min(0).max(100).check("42"); // 42
   * ```
   */
  NumberNotNull: callableCtor(
    (cond?: VNumberConditions) => new VNumberNotNull(cond),
  ),

  /**
   * Crea un verificador numerico **opcional** (admite null/undefined).
   * Llame a `.required()` o `.default()` para endurecer la regla.
   *
   * @param cond Configuracion opcional del verificador.
   * @returns Instancia de `VNumber`.
   *
   * @example
   * ```ts
   * Verifiers.Number().min(1).check(null); // null
   * ```
   */
  Number: callableCtor((cond?: VNumberConditions) => new VNumber(cond)),

  /**
   * Crea un verificador de texto **requerido** (no admite null/undefined).
   * Admite `minLength`, `maxLength`, `regex`, `notRegex`, `in`, `notIn`, `strictMode`,
   * `ignoreCase` y transformaciones (`trim`, `toLowerCase`, etc.).
   *
   * @param cond Configuracion opcional del verificador.
   * @returns Instancia de `VStringNotNull`.
   *
   * @example
   * ```ts
   * Verifiers.StringNotNull({ minLength: 3 }).trim().check(" hola "); // "hola"
   * ```
   */
  StringNotNull: callableCtor(
    (cond?: VStringConditions) => new VStringNotNull(cond),
  ),

  /**
   * Crea un verificador de texto **opcional** (admite null/undefined).
   * Llame a `.required()` o `.default()` para convertirlo en requerido.
   *
   * @param cond Configuracion opcional del verificador.
   * @returns Instancia de `VString`.
   */
  String: callableCtor((cond?: VStringConditions) => new VString(cond)),

  /**
   * Crea un verificador booleano **opcional** (admite null/undefined).
   * En modo no estricto acepta `true/false`, `1/0` y los strings `"true"/"false"`.
   *
   * @param cond Configuracion opcional del verificador.
   * @returns Instancia de `VBoolean`.
   */
  Boolean: callableCtor((cond?: VBooleanConditions) => new VBoolean(cond)),

  /**
   * Crea un verificador booleano **requerido** (no admite null/undefined).
   * Use `.strictMode()` para exigir un booleano nativo.
   *
   * @param cond Configuracion opcional del verificador.
   * @returns Instancia de `VBooleanNotNull`.
   */
  BooleanNotNull: callableCtor(
    (cond?: VBooleanConditions) => new VBooleanNotNull(cond),
  ),

  /**
   * Crea un verificador de objeto **requerido** a partir de un esquema de propiedades.
   * Cada key del esquema se verifica con su propio `Verifier`.
   * Admite `strictMode`, `ignoreCase`, `takeAllValues`, `conds` y `refine` tipado.
   *
   * @param properties Esquema `{ [key]: Verifier<any> }`.
   * @param cond Configuracion opcional.
   * @returns Instancia de `VObjectNotNull`.
   *
   * @example
   * ```ts
   * Verifiers.ObjectNotNull({
   *   id: Verifiers.UUIDNotNull(),
   *   age: Verifiers.NumberNotNull().min(0),
   * }).check(payload);
   * ```
   */
  ObjectNotNull: callableCtor(
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditionsNotNull<T>,
    ) => new VObjectNotNull<T>(properties, cond),
  ) as unknown as {
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditionsNotNull<T>,
    ): VObjectNotNull<T>;
    new <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditionsNotNull<T>,
    ): VObjectNotNull<T>;
  },

  /**
   * Crea un verificador de objeto **opcional** a partir de un esquema de propiedades.
   * Llame a `.required()` o `.default()` para obtener una instancia `VObjectNotNull`.
   *
   * @param properties Esquema `{ [key]: Verifier<any> }`.
   * @param cond Configuracion opcional.
   * @returns Instancia de `VObject`.
   */
  Object: callableCtor(
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditions<T>,
    ) => new VObject<T>(properties, cond),
  ) as unknown as {
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditions<T>,
    ): VObject<T>;
    new <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditions<T>,
    ): VObject<T>;
  },

  /**
   * Crea un verificador de arreglo **opcional**.
   * Cada elemento es verificado con el `verifier` proporcionado.
   * Admite `minLength` y `maxLength`. Los errores de items se reportan con ruta `[i]`.
   *
   * @param verifier Verificador aplicado a cada item.
   * @param cond Configuracion opcional.
   * @returns Instancia de `VArray`.
   *
   * @example
   * ```ts
   * Verifiers.Array(Verifiers.StringNotNull()).minLength(1).check(["a"]);
   * ```
   */
  Array: callableCtor(
    <T extends Verifier<any>>(verifier: T, cond?: VArrayConditions<T>) =>
      new VArray<T>(verifier, cond),
  ) as unknown as {
    <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArray<T>;
    new <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArray<T>;
  },

  /**
   * Crea un verificador de arreglo **requerido** (no admite null/undefined).
   * Cada elemento es verificado con el `verifier` proporcionado.
   *
   * @param verifier Verificador aplicado a cada item.
   * @param cond Configuracion opcional.
   * @returns Instancia de `VArrayNotNull`.
   */
  ArrayNotNull: callableCtor(
    <T extends Verifier<any>>(verifier: T, cond?: VArrayConditions<T>) =>
      new VArrayNotNull<T>(verifier, cond),
  ) as unknown as {
    <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArrayNotNull<T>;
    new <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArrayNotNull<T>;
  },

  /**
   * Crea un verificador que acepta **cualquier tipo** de dato.
   * Solo aplica las reglas de requerido y valor por defecto.
   *
   * @param cond Configuracion opcional.
   * @returns Instancia de `VAny`.
   */
  Any: callableCtor((cond?: VAnyConditions) => new VAny(cond)),

  /**
   * Crea un verificador de fecha **opcional** (admite null/undefined).
   * Retorna una instancia `dayjs` en la zona horaria resuelta.
   * Admite `format`, `timeZone`, `minDate`, `maxDate`.
   *
   * @param cond Configuracion opcional.
   * @returns Instancia de `VDate`.
   */
  Date: callableCtor((cond?: VDateConditions) => new VDate(cond)),

  /**
   * Crea un verificador de fecha **requerido** (no admite null/undefined).
   * Retorna una instancia `dayjs` en la zona horaria resuelta.
   *
   * @param cond Configuracion opcional.
   * @returns Instancia de `VDateNotNull`.
   *
   * @example
   * ```ts
   * Verifiers.DateNotNull().format("YYYY-MM-DD").check("2026-04-20");
   * ```
   */
  DateNotNull: callableCtor((cond?: VDateConditions) => new VDateNotNull(cond)),

  /**
   * Crea un verificador de UUID **requerido** (no admite null/undefined).
   * La salida es el UUID con guiones y en minusculas.
   * Admite `version` (1..5), `allowNoHyphens` y `strictMode`.
   *
   * @param cond Configuracion opcional.
   * @returns Instancia de `VUUIDNotNull`.
   */
  UUIDNotNull: callableCtor((cond?: VUUIDConditions) => new VUUIDNotNull(cond)),

  /**
   * Crea un verificador de UUID **opcional** (admite null/undefined).
   * Llame a `.required()` o `.default()` para cambiar a la variante requerida.
   *
   * @param cond Configuracion opcional.
   * @returns Instancia de `VUUID`.
   */
  UUID: callableCtor((cond?: VUUIDConditions) => new VUUID(cond)),

  /**
   * Crea un verificador de rango de fechas **opcional** (admite null/undefined).
   * Acepta como entrada un string `from|to`, un arreglo `[from, to]` o un objeto `{from, to}`.
   * Admite `format`, `separator`, `timeZone`, `minDate`, `maxDate`, `maxSpan`,
   * `requireFrom`/`requireTo`, `autoSwap`, `exclusiveEnd` y `maxInputLength`.
   *
   * @param cond Configuracion del rango.
   * @returns Instancia de `VDateRange`.
   */
  DateRange: callableCtor(
    (cond: VDateRangeConditions) => new VDateRange(cond),
  ),

  /**
   * Crea un verificador de rango de fechas **requerido** (no admite null/undefined).
   * Use `.strict()` para obtener un verificador que garantice `from` y `to` presentes.
   *
   * @param cond Configuracion del rango.
   * @returns Instancia de `VDateRangeNotNull`.
   *
   * @example
   * ```ts
   * Verifiers.DateRangeNotNull({})
   *   .format("YYYY-MM-DD")
   *   .maxSpan({ value: 30, unit: "day" })
   *   .check("2026-01-01|2026-01-20");
   * ```
   */
  DateRangeNotNull: callableCtor(
    (cond: VDateRangeConditions) => new VDateRangeNotNull(cond),
  ),
};
