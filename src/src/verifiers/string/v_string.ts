import { VerificationError } from "../../error/v_error";
import {
  MessageType,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import {
  getMessage,
  IMessageLanguage,
  getValue,
} from "../../languages/message";
import {
  ConditionMessageInput,
  conditionWithValue,
} from "../helpers/conditionMessage";
import { Verifier } from "../verifier";

/**
 * Configuracion aceptada por los verificadores de string.
 * @property minLength Longitud minima del texto.
 * @property maxLength Longitud maxima del texto.
 * @property regex Patron que debe cumplir el texto.
 * @property notRegex Patron que NO debe cumplir el texto.
 * @property in Lista de valores permitidos.
 * @property notIn Lista de valores prohibidos.
 * @property strictMode Si es true, solo acepta valores que ya sean string.
 * @property ignoreCase Habilita comparaciones insensibles a mayusculas/minusculas en `in`/`notIn`.
 */
export interface VStringConditions
  extends VBadTypeMessage, VDefaultValue<string>, VVCIsRequired {
  minLength?: MessageType<number, { minLength: number }>;
  maxLength?: MessageType<number, { maxLength: number }>;
  regex?: MessageType<RegExp, { regex: RegExp }>;
  notRegex?: MessageType<RegExp, { notRegex: RegExp }>;
  in?: MessageType<string[], { in: string[] }>;
  notIn?: MessageType<string[], { notIn: string[] }>;
  strictMode?: MessageType<boolean, void>;
  ignoreCase?: MessageType<boolean, void>;
}

const dMessages = {
  minLength: {
    es: (values: { minLength: number }) =>
      `debe tener una longitud mínima de ${values.minLength}`,
    en: (values: { minLength: number }) =>
      `must have a minimum length of ${values.minLength}`,
  },
  maxLength: {
    es: (values: { maxLength: number }) =>
      `debe tener una longitud máxima de ${values.maxLength}`,
    en: (values: { maxLength: number }) =>
      `must have a maximum length of ${values.maxLength}`,
  },
  regex: {
    es: (values: { regex: RegExp }) =>
      `debe cumplir con el patrón ${values.regex}`,
    en: (values: { regex: RegExp }) => `must match the pattern ${values.regex}`,
  },
  notRegex: {
    es: (values: { notRegex: RegExp }) =>
      `no debe cumplir con el patrón ${values.notRegex}`,
    en: (values: { notRegex: RegExp }) =>
      `must not match the pattern ${values.notRegex}`,
  },
  in: {
    es: (values: { in: string[] }) =>
      `debe ser uno de los siguientes valores ${values.in.join(", ")}`,
    en: (values: { in: string[] }) =>
      `must be one of the following values ${values.in.join(", ")}`,
  },
  notIn: {
    es: (values: { notIn: string[] }) =>
      `no debe ser uno de los siguientes valores ${values.notIn.join(", ")}`,
    en: (values: { notIn: string[] }) =>
      `must not be one of the following values ${values.notIn.join(", ")}`,
  },
};

/**
 * Lanza `VerificationError` para condiciones fallidas del verificador de string.
 * @param condition Condicion con mensaje personalizado.
 * @param values Parametros para la funcion de mensaje.
 * @param fallbackMessage Mensaje por defecto multilenguaje.
 */
function throwStringError<T>(
  condition: MessageType<T, any> | string | undefined,
  values: any,
  fallbackMessage: IMessageLanguage<any>,
): never {
  throw new VerificationError([
    {
      key: "",
      message: getMessage(condition, values, fallbackMessage),
    },
  ]);
}

/**
 * Determina si una lista contiene el valor dado, opcionalmente ignorando mayusculas.
 * @param values Lista de cadenas donde buscar.
 * @param value Valor a buscar (ya normalizado a minusculas cuando `ignoreCase` es true).
 * @param ignoreCase Habilita la comparacion case-insensitive.
 */
function includesComparable(
  values: string[],
  value: string,
  ignoreCase: boolean,
) {
  if (!ignoreCase) {
    return values.includes(value);
  }

  return values.some((item) => item.toLowerCase() === value);
}

/**
 * Convierte el dato a string y valida todas las condiciones configuradas.
 * @param data Dato a verificar.
 * @param badTypeMessage Mensaje por defecto para tipo invalido.
 * @param conds Configuracion de la verificacion.
 * @returns Valor string resultante.
 */
function vString(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VStringConditions,
): string {
  if (getValue(conds?.strictMode) === true && typeof data !== "string") {
    throwStringError(
      conds?.strictMode ?? conds?.badTypeMessage,
      undefined,
      badTypeMessage,
    );
  }

  const stringValue = String(data);
  const ignoreCase = getValue(conds?.ignoreCase) === true;
  const comparableValue = ignoreCase ? stringValue.toLowerCase() : stringValue;

  if (conds?.minLength !== undefined) {
    const minLength = getValue(conds.minLength);
    if (stringValue.length < minLength) {
      throwStringError(conds.minLength, { minLength }, dMessages.minLength);
    }
  }

  if (conds?.maxLength !== undefined) {
    const maxLength = getValue(conds.maxLength);
    if (stringValue.length > maxLength) {
      throwStringError(conds.maxLength, { maxLength }, dMessages.maxLength);
    }
  }

  if (conds?.regex !== undefined) {
    const regex = getValue(conds.regex);
    if (!regex.test(stringValue)) {
      throwStringError(conds.regex, { regex }, dMessages.regex);
    }
  }

  if (conds?.notRegex !== undefined) {
    const notRegex = getValue(conds.notRegex);
    if (notRegex.test(stringValue)) {
      throwStringError(conds.notRegex, { notRegex }, dMessages.notRegex);
    }
  }

  if (conds?.in !== undefined) {
    const allowedValues = getValue(conds.in);
    if (!includesComparable(allowedValues, comparableValue, ignoreCase)) {
      throwStringError(conds.in, { in: allowedValues }, dMessages.in);
    }
  }

  if (conds?.notIn !== undefined) {
    const blockedValues = getValue(conds.notIn);
    if (includesComparable(blockedValues, comparableValue, ignoreCase)) {
      throwStringError(conds.notIn, { notIn: blockedValues }, dMessages.notIn);
    }
  }

  return stringValue;
}

/**
 * Verificador de string que NO acepta null/undefined (siempre requerido).
 * Provee metodos encadenables para longitud, regex, listas blancas/negras,
 * modo estricto e insensible a mayusculas, ademas de transformaciones de texto.
 *
 * @example
 * ```ts
 * Verifiers.StringNotNull().minLength(3).trim().toLowerCase().check(" HOLA "); // "hola"
 * ```
 */
export class VStringNotNull extends Verifier<string> {
  /**
   * Verifica y convierte el dato a string. Lanza si es null/undefined.
   * @param data Dato a verificar.
   * @returns String resultante.
   */
  check(data: any): string {
    return vString(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  /**
   * Define la longitud minima.
   * @param n Longitud minima permitida.
   * @param message Mensaje personalizado (opcional).
   */
  minLength(
    n: number,
    message?: ConditionMessageInput<number, { minLength: number }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      minLength: conditionWithValue<number, { minLength: number }>(n, message),
    });
  }

  /**
   * Define la longitud maxima.
   * @param n Longitud maxima permitida.
   * @param message Mensaje personalizado (opcional).
   */
  maxLength(
    n: number,
    message?: ConditionMessageInput<number, { maxLength: number }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      maxLength: conditionWithValue<number, { maxLength: number }>(n, message),
    });
  }

  /**
   * Exige que el texto cumpla con el patron dado.
   * @param pattern Expresion regular a cumplir.
   * @param message Mensaje personalizado (opcional).
   */
  regex(
    pattern: RegExp,
    message?: ConditionMessageInput<RegExp, { regex: RegExp }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      regex: conditionWithValue<RegExp, { regex: RegExp }>(pattern, message),
    });
  }

  /**
   * Exige que el texto NO cumpla con el patron dado.
   * @param pattern Expresion regular prohibida.
   * @param message Mensaje personalizado (opcional).
   */
  notRegex(
    pattern: RegExp,
    message?: ConditionMessageInput<RegExp, { notRegex: RegExp }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      notRegex: conditionWithValue<RegExp, { notRegex: RegExp }>(
        pattern,
        message,
      ),
    });
  }

  /**
   * Restringe los valores validos a la lista indicada.
   * @param values Lista blanca de cadenas permitidas.
   * @param message Mensaje personalizado (opcional).
   */
  in(
    values: string[],
    message?: ConditionMessageInput<string[], { in: string[] }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      in: conditionWithValue<string[], { in: string[] }>(values, message),
    });
  }

  /**
   * Lista negra de valores prohibidos.
   * @param values Lista de cadenas no permitidas.
   * @param message Mensaje personalizado (opcional).
   */
  notIn(
    values: string[],
    message?: ConditionMessageInput<string[], { notIn: string[] }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      notIn: conditionWithValue<string[], { notIn: string[] }>(values, message),
    });
  }

  /**
   * Habilita el modo estricto (no convierte numeros u objetos a string).
   * @param enabled Estado (default true).
   * @param message Mensaje personalizado (opcional).
   */
  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  /**
   * Habilita comparacion insensible a mayusculas en `in`/`notIn`.
   * @param enabled Estado (default true).
   * @param message Mensaje personalizado (opcional).
   */
  ignoreCase(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      ignoreCase: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  /**
   * Devuelve un verificador que aplica `trim` al resultado.
   * NOTA: al aplicar transformaciones se rompe la cadena fluente especifica de string.
   */
  trim(): Verifier<string> {
    return this.transform((value) => value.trim());
  }

  /**
   * Devuelve un verificador que aplica `trimStart` al resultado.
   */
  trimStart(): Verifier<string> {
    return this.transform((value) => value.trimStart());
  }

  /**
   * Devuelve un verificador que aplica `trimEnd` al resultado.
   */
  trimEnd(): Verifier<string> {
    return this.transform((value) => value.trimEnd());
  }

  /**
   * Devuelve un verificador que convierte el string a minusculas.
   */
  toLowerCase(): Verifier<string> {
    return this.transform((value) => value.toLowerCase());
  }

  /**
   * Devuelve un verificador que convierte el string a mayusculas.
   */
  toUpperCase(): Verifier<string> {
    return this.transform((value) => value.toUpperCase());
  }

  /**
   * Elimina los acentos/diacriticos del string (normalizacion NFD + strip marks).
   */
  removeAccents(): Verifier<string> {
    return this.transform((value) =>
      value.normalize("NFD").replace(/\p{M}/gu, ""),
    );
  }

  /**
   * Rellena el string al inicio hasta alcanzar `maxLength`.
   * @param maxLength Longitud final esperada.
   * @param fillString Caracter(es) de relleno (opcional).
   */
  padStart(maxLength: number, fillString?: string): Verifier<string> {
    return this.transform((value) => value.padStart(maxLength, fillString));
  }

  /**
   * Rellena el string al final hasta alcanzar `maxLength`.
   * @param maxLength Longitud final esperada.
   * @param fillString Caracter(es) de relleno (opcional).
   */
  padEnd(maxLength: number, fillString?: string): Verifier<string> {
    return this.transform((value) => value.padEnd(maxLength, fillString));
  }

  /**
   * Establece un valor por defecto.
   * @param value Valor a utilizar cuando no haya dato.
   */
  default(value: string): VStringNotNull {
    return new VStringNotNull({ ...this.cond, defaultValue: value });
  }

  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VStringConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un texto`,
      en: () => `must be a string`,
    };
  }
}

/**
 * Verificador de string que acepta null/undefined (opcional).
 * Espeja los metodos de `VStringNotNull`, pero propaga `null` cuando el dato esta ausente.
 *
 * @example
 * ```ts
 * Verifiers.String().check(null); // null
 * Verifiers.String().required().check(null); // lanza error
 * ```
 */
export class VString extends Verifier<string | null> {
  /**
   * Verifica el dato y retorna string o null cuando esta ausente.
   * @param data Dato a verificar.
   * @returns String verificado o null.
   */
  check(data: any): string | null {
    let val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vString(val, this.badTypeMessage, this.cond);
  }

  minLength(
    n: number,
    message?: ConditionMessageInput<number, { minLength: number }>,
  ): VString {
    return new VString({
      ...this.cond,
      minLength: conditionWithValue<number, { minLength: number }>(n, message),
    });
  }

  maxLength(
    n: number,
    message?: ConditionMessageInput<number, { maxLength: number }>,
  ): VString {
    return new VString({
      ...this.cond,
      maxLength: conditionWithValue<number, { maxLength: number }>(n, message),
    });
  }

  regex(
    pattern: RegExp,
    message?: ConditionMessageInput<RegExp, { regex: RegExp }>,
  ): VString {
    return new VString({
      ...this.cond,
      regex: conditionWithValue<RegExp, { regex: RegExp }>(pattern, message),
    });
  }

  notRegex(
    pattern: RegExp,
    message?: ConditionMessageInput<RegExp, { notRegex: RegExp }>,
  ): VString {
    return new VString({
      ...this.cond,
      notRegex: conditionWithValue<RegExp, { notRegex: RegExp }>(
        pattern,
        message,
      ),
    });
  }

  in(
    values: string[],
    message?: ConditionMessageInput<string[], { in: string[] }>,
  ): VString {
    return new VString({
      ...this.cond,
      in: conditionWithValue<string[], { in: string[] }>(values, message),
    });
  }

  notIn(
    values: string[],
    message?: ConditionMessageInput<string[], { notIn: string[] }>,
  ): VString {
    return new VString({
      ...this.cond,
      notIn: conditionWithValue<string[], { notIn: string[] }>(values, message),
    });
  }

  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VString {
    return new VString({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  ignoreCase(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VString {
    return new VString({
      ...this.cond,
      ignoreCase: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  trim(): Verifier<string | null> {
    return this.transform((value) => (value === null ? null : value.trim()));
  }

  trimStart(): Verifier<string | null> {
    return this.transform((value) =>
      value === null ? null : value.trimStart(),
    );
  }

  trimEnd(): Verifier<string | null> {
    return this.transform((value) => (value === null ? null : value.trimEnd()));
  }

  toLowerCase(): Verifier<string | null> {
    return this.transform((value) =>
      value === null ? null : value.toLowerCase(),
    );
  }

  toUpperCase(): Verifier<string | null> {
    return this.transform((value) =>
      value === null ? null : value.toUpperCase(),
    );
  }

  removeAccents(): Verifier<string | null> {
    return this.transform((value) =>
      value === null ? null : value.normalize("NFD").replace(/\p{M}/gu, ""),
    );
  }

  padStart(maxLength: number, fillString?: string): Verifier<string | null> {
    return this.transform((value) =>
      value === null ? null : value.padStart(maxLength, fillString),
    );
  }

  padEnd(maxLength: number, fillString?: string): Verifier<string | null> {
    return this.transform((value) =>
      value === null ? null : value.padEnd(maxLength, fillString),
    );
  }

  constructor(protected cond?: VStringConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un texto`,
      en: () => `must be a string`,
    };
  }

  required(): VStringNotNull {
    return new VStringNotNull(this.cond);
  }

  default(value: string): VStringNotNull {
    return new VStringNotNull({ ...this.cond, defaultValue: value });
  }
}
