import { VerificationError } from "../../error/v_error";
import {
  IInfo,
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
 * Configuracion aceptada por los verificadores numericos.
 * @property min Valor minimo aceptado (inclusive).
 * @property max Valor maximo aceptado (inclusive).
 * @property in Lista de valores permitidos.
 * @property notIn Lista de valores no permitidos.
 * @property maxDecimalPlaces Cantidad maxima de decimales.
 * @property minDecimalPlaces Cantidad minima de decimales.
 */
export interface VNumberConditions
  extends VBadTypeMessage, VDefaultValue<number>, VVCIsRequired, IInfo<number> {
  min?: MessageType<number, { min: number }>;
  max?: MessageType<number, { max: number }>;
  in?: MessageType<number[], { in: number[] }>;
  notIn?: MessageType<number[], { notIn: number[] }>;
  maxDecimalPlaces?: MessageType<number, { maxDecimalPlaces: number }>;
  minDecimalPlaces?: MessageType<number, { minDecimalPlaces: number }>;
}

interface VNumberDefaultMessages {
  min: IMessageLanguage<{ min: number }>;
  max: IMessageLanguage<{ max: number }>;
  in: IMessageLanguage<{ in: number[] }>;
  notIn: IMessageLanguage<{ notIn: number[] }>;
  maxDecimalPlaces: IMessageLanguage<{ maxDecimalPlaces: number }>;
  minDecimalPlaces: IMessageLanguage<{ minDecimalPlaces: number }>;
  badTypeMessage: IMessageLanguage<void>;
}

const dMessages: VNumberDefaultMessages = {
  min: {
    es: (values: { min: number }) => `debe ser mayor o igual a ${values.min}`,
    en: (values: { min: number }) =>
      `must be greater or equal to ${values.min}`,
  },
  max: {
    es: (values: { max: number }) => `debe ser menor o igual a ${values.max}`,
    en: (values: { max: number }) => `must be less or equal to ${values.max}`,
  },
  in: {
    es: (values: { in: number[] }) =>
      `debe ser uno de los siguientes valores ${values.in.join(", ")}`,
    en: (values: { in: number[] }) =>
      `must be one of the following values ${values.in.join(", ")}`,
  },
  notIn: {
    es: (values: { notIn: number[] }) =>
      `no debe ser uno de los siguientes valores ${values.notIn.join(", ")}`,
    en: (values: { notIn: number[] }) =>
      `must not be one of the following values ${values.notIn.join(", ")}`,
  },
  maxDecimalPlaces: {
    es: (values: { maxDecimalPlaces: number }) =>
      `debe tener como máximo ${values.maxDecimalPlaces} decimales`,
    en: (values: { maxDecimalPlaces: number }) =>
      `must have at most ${values.maxDecimalPlaces} decimal places`,
  },
  minDecimalPlaces: {
    es: (values: { minDecimalPlaces: number }) =>
      `debe tener como mínimo ${values.minDecimalPlaces} decimales`,
    en: (values: { minDecimalPlaces: number }) =>
      `must have at least ${values.minDecimalPlaces} decimal places`,
  },
  badTypeMessage: {
    es: () => `debe ser un número`,
    en: () => `must be a number`,
  },
};

/**
 * Lanza `VerificationError` usando el mensaje personalizado o el mensaje por defecto.
 * @param condition Condicion con el mensaje personalizado.
 * @param values Parametros para la funcion de mensaje.
 * @param fallbackMessage Mensaje por defecto.
 */
function throwNumberError<T>(
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
 * Convierte el dato a numero y valida todas las condiciones numericas definidas.
 * Rechaza booleanos, arrays, objetos, cadenas vacias, `NaN` e infinitos.
 * @param data Dato a verificar.
 * @param badTypeMessage Mensaje multilenguaje fallback para tipo invalido.
 * @param conds Configuracion de la verificacion.
 * @returns Valor numerico resultante.
 */
function vNumber(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VNumberConditions,
): number {
  if (
    typeof data === "boolean" ||
    Array.isArray(data) ||
    (typeof data === "object" && data !== null) ||
    data === "" ||
    (typeof data !== "number" && typeof data !== "string") ||
    (typeof data === "string" && data.trim() === "") ||
    isNaN(Number(data)) ||
    !Number.isFinite(Number(data))
  ) {
    throwNumberError(conds?.badTypeMessage, undefined, badTypeMessage);
  }

  const numericValue = Number(data);
  const decimalPart = String(data).split(".")[1] || "";

  if (conds?.min !== undefined) {
    const minValue = getValue(conds.min);
    if (numericValue < minValue) {
      throwNumberError(conds.min, { min: minValue }, dMessages.min);
    }
  }

  if (conds?.max !== undefined) {
    const maxValue = getValue(conds.max);
    if (numericValue > maxValue) {
      throwNumberError(conds.max, { max: maxValue }, dMessages.max);
    }
  }

  if (conds?.in !== undefined) {
    const allowedValues = getValue(conds.in);
    if (!allowedValues.includes(numericValue)) {
      throwNumberError(conds.in, { in: allowedValues }, dMessages.in);
    }
  }

  if (conds?.notIn !== undefined) {
    const blockedValues = getValue(conds.notIn);
    if (blockedValues.includes(numericValue)) {
      throwNumberError(conds.notIn, { notIn: blockedValues }, dMessages.notIn);
    }
  }

  if (conds?.maxDecimalPlaces !== undefined) {
    const maxDecimalPlaces = getValue(conds.maxDecimalPlaces);
    if (decimalPart.length > maxDecimalPlaces) {
      throwNumberError(
        conds.maxDecimalPlaces,
        { maxDecimalPlaces },
        dMessages.maxDecimalPlaces,
      );
    }
  }

  if (conds?.minDecimalPlaces !== undefined) {
    const minDecimalPlaces = getValue(conds.minDecimalPlaces);
    if (decimalPart.length < minDecimalPlaces) {
      throwNumberError(
        conds.minDecimalPlaces,
        { minDecimalPlaces },
        dMessages.minDecimalPlaces,
      );
    }
  }

  return numericValue;
}

/**
 * Verificador numerico que NO acepta null/undefined (siempre requerido).
 * Admite condiciones: min, max, in, notIn, maxDecimalPlaces, minDecimalPlaces.
 *
 * @example
 * ```ts
 * Verifiers.NumberNotNull().min(0).max(100).check("50"); // 50
 * ```
 */
export class VNumberNotNull extends Verifier<number> {
  /**
   * Verifica que el dato sea numerico y cumpla las condiciones configuradas.
   * @param data Dato a verificar (number o string numerico).
   * @returns Numero verificado.
   */
  check(data: any): number {
    return vNumber(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  /**
   * Define el valor minimo permitido (inclusive).
   * @param n Valor minimo.
   * @param message Mensaje personalizado (opcional).
   */
  min(
    n: number,
    message?: ConditionMessageInput<number, { min: number }>,
  ): VNumberNotNull {
    return new VNumberNotNull({
      ...this.cond,
      min: conditionWithValue<number, { min: number }>(n, message),
    });
  }

  /**
   * Define el valor maximo permitido (inclusive).
   * @param n Valor maximo.
   * @param message Mensaje personalizado (opcional).
   */
  max(
    n: number,
    message?: ConditionMessageInput<number, { max: number }>,
  ): VNumberNotNull {
    return new VNumberNotNull({
      ...this.cond,
      max: conditionWithValue<number, { max: number }>(n, message),
    });
  }

  /**
   * Restringe los valores validos a la lista indicada.
   * @param values Lista de valores permitidos.
   * @param message Mensaje personalizado (opcional).
   */
  in(
    values: number[],
    message?: ConditionMessageInput<number[], { in: number[] }>,
  ): VNumberNotNull {
    return new VNumberNotNull({
      ...this.cond,
      in: conditionWithValue<number[], { in: number[] }>(values, message),
    });
  }

  /**
   * Rechaza los valores indicados en la lista.
   * @param values Lista de valores prohibidos.
   * @param message Mensaje personalizado (opcional).
   */
  notIn(
    values: number[],
    message?: ConditionMessageInput<number[], { notIn: number[] }>,
  ): VNumberNotNull {
    return new VNumberNotNull({
      ...this.cond,
      notIn: conditionWithValue<number[], { notIn: number[] }>(values, message),
    });
  }

  /**
   * Limita la cantidad maxima de decimales.
   * @param n Numero maximo de decimales.
   * @param message Mensaje personalizado (opcional).
   */
  maxDecimalPlaces(
    n: number,
    message?: ConditionMessageInput<number, { maxDecimalPlaces: number }>,
  ): VNumberNotNull {
    return new VNumberNotNull({
      ...this.cond,
      maxDecimalPlaces: conditionWithValue<
        number,
        { maxDecimalPlaces: number }
      >(n, message),
    });
  }

  /**
   * Exige una cantidad minima de decimales.
   * @param n Numero minimo de decimales.
   * @param message Mensaje personalizado (opcional).
   */
  minDecimalPlaces(
    n: number,
    message?: ConditionMessageInput<number, { minDecimalPlaces: number }>,
  ): VNumberNotNull {
    return new VNumberNotNull({
      ...this.cond,
      minDecimalPlaces: conditionWithValue<
        number,
        { minDecimalPlaces: number }
      >(n, message),
    });
  }

  /**
   * Establece un valor por defecto.
   * @param value Valor a utilizar cuando no haya dato.
   */
  default(value: number): VNumberNotNull {
    return new VNumberNotNull({ ...this.cond, defaultValue: value });
  }

  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VNumberConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }
}

/**
 * Verificador numerico que acepta null/undefined (opcional por defecto).
 * Use `.required()` o `.default()` para obtener una variante `VNumberNotNull`.
 *
 * @example
 * ```ts
 * Verifiers.Number().min(1).check(null); // null
 * ```
 */
export class VNumber extends Verifier<number | null> {
  /**
   * Verifica el dato y retorna numero o null cuando esta ausente.
   * @param data Dato a verificar.
   * @returns Numero verificado o null.
   */
  check(data: any): number | null {
    let val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vNumber(val, this.badTypeMessage, this.cond);
  }

  /**
   * Define el valor minimo permitido (inclusive).
   * @param n Valor minimo.
   * @param message Mensaje personalizado (opcional).
   */
  min(
    n: number,
    message?: ConditionMessageInput<number, { min: number }>,
  ): VNumber {
    return new VNumber({
      ...this.cond,
      min: conditionWithValue<number, { min: number }>(n, message),
    });
  }

  /**
   * Define el valor maximo permitido (inclusive).
   * @param n Valor maximo.
   * @param message Mensaje personalizado (opcional).
   */
  max(
    n: number,
    message?: ConditionMessageInput<number, { max: number }>,
  ): VNumber {
    return new VNumber({
      ...this.cond,
      max: conditionWithValue<number, { max: number }>(n, message),
    });
  }

  /**
   * Restringe los valores validos a la lista indicada.
   * @param values Lista de valores permitidos.
   * @param message Mensaje personalizado (opcional).
   */
  in(
    values: number[],
    message?: ConditionMessageInput<number[], { in: number[] }>,
  ): VNumber {
    return new VNumber({
      ...this.cond,
      in: conditionWithValue<number[], { in: number[] }>(values, message),
    });
  }

  /**
   * Rechaza los valores indicados en la lista.
   * @param values Lista de valores prohibidos.
   * @param message Mensaje personalizado (opcional).
   */
  notIn(
    values: number[],
    message?: ConditionMessageInput<number[], { notIn: number[] }>,
  ): VNumber {
    return new VNumber({
      ...this.cond,
      notIn: conditionWithValue<number[], { notIn: number[] }>(values, message),
    });
  }

  /**
   * Limita la cantidad maxima de decimales.
   * @param n Numero maximo de decimales.
   * @param message Mensaje personalizado (opcional).
   */
  maxDecimalPlaces(
    n: number,
    message?: ConditionMessageInput<number, { maxDecimalPlaces: number }>,
  ): VNumber {
    return new VNumber({
      ...this.cond,
      maxDecimalPlaces: conditionWithValue<
        number,
        { maxDecimalPlaces: number }
      >(n, message),
    });
  }

  /**
   * Exige una cantidad minima de decimales.
   * @param n Numero minimo de decimales.
   * @param message Mensaje personalizado (opcional).
   */
  minDecimalPlaces(
    n: number,
    message?: ConditionMessageInput<number, { minDecimalPlaces: number }>,
  ): VNumber {
    return new VNumber({
      ...this.cond,
      minDecimalPlaces: conditionWithValue<
        number,
        { minDecimalPlaces: number }
      >(n, message),
    });
  }

  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VNumberConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }

  /**
   * Convierte el verificador en su variante `VNumberNotNull` (requerido).
   */
  required(): VNumberNotNull {
    return new VNumberNotNull(this.cond);
  }

  /**
   * Establece un valor por defecto. Resultado: `VNumberNotNull`.
   * @param value Valor a utilizar cuando no haya dato.
   */
  default(value: number): VNumberNotNull {
    return new VNumberNotNull({ ...this.cond, defaultValue: value });
  }
}
