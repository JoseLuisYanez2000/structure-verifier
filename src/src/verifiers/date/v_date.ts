import {
  IInfo,
  MessageType,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import {
  getMessage,
  getValue,
  IMessageLanguage,
} from "../../languages/message";
import { VerificationError } from "../../error/v_error";
import {
  ConditionMessageInput,
  conditionWithValue,
} from "../helpers/conditionMessage";
import { Verifier } from "../verifier";
import { datetime } from "../../utils/datetime";

/**
 * Configuracion aceptada por los verificadores de fecha.
 * @property format Formato esperado (parsing estricto con dayjs).
 * @property timeZone Zona horaria a aplicar cuando la fecha no trae offset/zona.
 * @property maxDate Fecha maxima permitida (inclusive).
 * @property minDate Fecha minima permitida (inclusive).
 * @property default Valor por defecto (compatibilidad historica; preferir `defaultValue`).
 */
export interface VDateConditions
  extends
    VBadTypeMessage,
    VDefaultValue<datetime.Dayjs>,
    VVCIsRequired,
    IInfo<number | string | Date | datetime.Dayjs> {
  format?: MessageType<string, { format: string }>;
  timeZone?: MessageType<string, { timeZone: string }>;
  maxDate?: MessageType<datetime.Dayjs, { maxDate: datetime.Dayjs }>;
  minDate?: MessageType<datetime.Dayjs, { minDate: datetime.Dayjs }>;
  default?: MessageType<datetime.Dayjs, { default: datetime.Dayjs }>;
}

interface VDateDefaultMessages {
  format: IMessageLanguage<{ format: string }>;
  timeZone: IMessageLanguage<{ timeZone: string }>;
  maxDate: IMessageLanguage<{ maxDate: datetime.Dayjs }>;
  minDate: IMessageLanguage<{ minDate: datetime.Dayjs }>;
  badTypeMessage: IMessageLanguage<void>;
}

const dMessages: VDateDefaultMessages = {
  format: {
    es: (values: { format: string }) =>
      `debe tener el formato ${values.format}`,
    en: (values: { format: string }) => `must have the format ${values.format}`,
  },
  timeZone: {
    es: (values: { timeZone: string }) =>
      `debe tener la zona horaria ${values.timeZone}`,
    en: (values: { timeZone: string }) =>
      `must have the time zone ${values.timeZone}`,
  },
  maxDate: {
    es: (values: { maxDate: datetime.Dayjs }) =>
      `debe ser menor o igual a ${values.maxDate.format()}`,
    en: (values: { maxDate: datetime.Dayjs }) =>
      `must be less or equal to ${values.maxDate.format()}`,
  },
  minDate: {
    es: (values: { minDate: datetime.Dayjs }) =>
      `debe ser mayor o igual a ${values.minDate.format()}`,
    en: (values: { minDate: datetime.Dayjs }) =>
      `must be greater or equal to ${values.minDate.format()}`,
  },
  badTypeMessage: {
    es: () => `debe ser una fecha`,
    en: () => `must be a date`,
  },
};

/**
 * Lanza `VerificationError` usando el mensaje personalizado solo si la condicion
 * provista contiene realmente un mensaje; de lo contrario usa el fallback.
 * @param condition Condicion con posible mensaje personalizado.
 * @param values Parametros para la funcion de mensaje.
 * @param fallbackMessage Mensaje por defecto multilenguaje.
 */
function throwDateError<T>(
  condition: MessageType<T, any> | string | undefined,
  values: any,
  fallbackMessage: IMessageLanguage<any>,
): never {
  const hasCustomMessage =
    typeof condition === "object" &&
    condition !== null &&
    "val" in condition &&
    "message" in condition;
  throw new VerificationError([
    {
      key: "",
      message: getMessage(
        hasCustomMessage ? condition : undefined,
        values,
        fallbackMessage,
      ),
    },
  ]);
}

/**
 * Determina si el dato es uno de los tipos soportados por el verificador.
 * Admite: number (timestamps), string, Date nativo o dayjs.
 */
function isSupportedDateInput(data: any) {
  return (
    typeof data === "number" ||
    typeof data === "string" ||
    data instanceof Date ||
    datetime.isDayjs(data)
  );
}

/**
 * Detecta si una cadena ya incluye informacion de zona horaria (offset o identificador).
 */
function haveTimezone(input: any) {
  const regexDesplazamiento = /(?:UTC|GMT|[+-]\d{2}:?\d{2})$/;
  const regexIdentificadorZona =
    /(?:Europe\/|America\/|Asia\/|Africa\/|Australia\/|Antarctica\/|Atlantic\/|Indian\/|Pacific\/)[A-Za-z_]+/;
  return regexDesplazamiento.test(input) || regexIdentificadorZona.test(input);
}

/**
 * Determina si un formato dayjs contiene tokens de zona horaria (`Z`, `ZZ`, `z`, `zz`).
 */
function formatWithTimeZone(format: string) {
  return /Z{1,2}|z{1,2}/.test(format);
}

/**
 * Aplica una zona horaria a una fecha interpretando sus campos como hora local en esa zona.
 * @param date Fecha base (dayjs).
 * @param timeZone Nombre de la zona (ej. "America/Mexico_City").
 */
function applyDefaultTimezone(date: datetime.Dayjs, timeZone: string) {
  return datetime.tz(date.format("YYYY-MM-DD HH:mm:ss"), timeZone);
}

/**
 * Parsea una fecha usando un formato especifico (modo estricto de dayjs).
 * Si el formato no incluye zona horaria, aplica la `timeZone` provista.
 * @param data Valor a parsear.
 * @param format Formato esperado.
 * @param timeZone Zona horaria a aplicar cuando corresponda.
 * @param conds Configuracion (para mensajes personalizados).
 */
function parseDateWithFormat(
  data: any,
  format: string,
  timeZone: string,
  conds?: VDateConditions,
) {
  let date = datetime(data, format, true);

  if (!date.isValid()) {
    throwDateError(conds?.format, { format }, dMessages.format);
  }

  if (!formatWithTimeZone(format)) {
    date = applyDefaultTimezone(date, timeZone);
  }

  return date;
}

/**
 * Parsea una fecha sin un formato explicito. Si el string ya incluye zona horaria,
 * se respeta; en otro caso se aplica la `timeZone` provista.
 */
function parseDateWithoutFormat(data: any, timeZone: string) {
  let date = datetime(data);

  if (!date.isValid()) {
    return date;
  }

  const stringHasTimezone =
    typeof data === "string" && haveTimezone(data);

  if (!stringHasTimezone) {
    date = applyDefaultTimezone(date, timeZone);
  }

  return date;
}

/**
 * Resuelve el parser adecuado segun si hay formato configurado o no.
 * Propaga `VerificationError` de `parseDateWithFormat` y relanza errores genericos como "tipo invalido".
 */
function parseDateInput(
  data: any,
  timeZone: string,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VDateConditions,
) {
  const format = conds?.format ? getValue(conds.format) : undefined;
  let date: datetime.Dayjs;
  try {
    date = format
      ? parseDateWithFormat(data, format, timeZone, conds)
      : parseDateWithoutFormat(data, timeZone);
  } catch (error) {
    if (error instanceof VerificationError) {
      throw error;
    }
    throwDateError(conds?.badTypeMessage, undefined, badTypeMessage);
  }

  if (!date.isValid()) {
    throwDateError(conds?.badTypeMessage, undefined, badTypeMessage);
  }

  return date;
}

/**
 * Verifica que la fecha este dentro del rango `minDate`..`maxDate` configurado.
 * @param date Fecha ya parseada.
 * @param conds Configuracion que puede traer minDate/maxDate.
 */
function validateDateRange(date: datetime.Dayjs, conds?: VDateConditions) {
  if (conds?.maxDate) {
    const maxDate = getValue(conds.maxDate);
    if (date.isAfter(maxDate)) {
      throwDateError(conds.maxDate, { maxDate }, dMessages.maxDate);
    }
  }

  if (conds?.minDate) {
    const minDate = getValue(conds.minDate);
    if (date.isBefore(minDate)) {
      throwDateError(conds.minDate, { minDate }, dMessages.minDate);
    }
  }
}

/**
 * Orquesta la verificacion completa de una fecha: verifica tipo de entrada,
 * aplica zona horaria (UTC por defecto), parsea y valida el rango min/max.
 * @param data Dato a verificar.
 * @param badTypeMessage Mensaje fallback de tipo invalido.
 * @param conds Configuracion de la verificacion.
 * @returns Instancia `dayjs` resultante.
 */
function vDate(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VDateConditions,
): datetime.Dayjs {
  const timeZone = getValue(conds?.timeZone) || "UTC";

  if (data === "" || !isSupportedDateInput(data)) {
    throwDateError(conds?.badTypeMessage, undefined, badTypeMessage);
  }

  const date = parseDateInput(data, timeZone, badTypeMessage, conds);
  validateDateRange(date, conds);

  return date;
}

/**
 * Verificador de fechas que NO acepta null/undefined (siempre requerido).
 * Retorna una instancia `dayjs` en la zona horaria resuelta.
 *
 * @example
 * ```ts
 * Verifiers.DateNotNull()
 *   .format("YYYY-MM-DD")
 *   .timeZone("America/Mexico_City")
 *   .check("2026-04-20");
 * ```
 */
export class VDateNotNull extends Verifier<datetime.Dayjs> {
  /**
   * Verifica y parsea la fecha. Lanza si es null/undefined.
   * @param data Dato a verificar.
   * @returns Instancia dayjs verificada.
   */
  check(data: any): datetime.Dayjs {
    return vDate(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  /**
   * Define el formato que debe cumplir la fecha (parsing estricto).
   * @param fmt Formato estilo dayjs (ej. "YYYY-MM-DD").
   * @param message Mensaje personalizado (opcional).
   */
  format(
    fmt: string,
    message?: ConditionMessageInput<string, { format: string }>,
  ): VDateNotNull {
    return new VDateNotNull({
      ...this.cond,
      format: conditionWithValue<string, { format: string }>(fmt, message),
    });
  }

  /**
   * Define la zona horaria aplicada al parsear (si el input no la incluye).
   * @param tz Identificador IANA (ej. "America/Mexico_City") u offset.
   * @param message Mensaje personalizado (opcional).
   */
  timeZone(
    tz: string,
    message?: ConditionMessageInput<string, { timeZone: string }>,
  ): VDateNotNull {
    return new VDateNotNull({
      ...this.cond,
      timeZone: conditionWithValue<string, { timeZone: string }>(tz, message),
    });
  }

  /**
   * Define la fecha maxima permitida (inclusive).
   * @param date Fecha maxima (dayjs).
   * @param message Mensaje personalizado (opcional).
   */
  maxDate(
    date: datetime.Dayjs,
    message?: ConditionMessageInput<
      datetime.Dayjs,
      { maxDate: datetime.Dayjs }
    >,
  ): VDateNotNull {
    return new VDateNotNull({
      ...this.cond,
      maxDate: conditionWithValue<datetime.Dayjs, { maxDate: datetime.Dayjs }>(
        date,
        message,
      ),
    });
  }

  /**
   * Define la fecha minima permitida (inclusive).
   * @param date Fecha minima (dayjs).
   * @param message Mensaje personalizado (opcional).
   */
  minDate(
    date: datetime.Dayjs,
    message?: ConditionMessageInput<
      datetime.Dayjs,
      { minDate: datetime.Dayjs }
    >,
  ): VDateNotNull {
    return new VDateNotNull({
      ...this.cond,
      minDate: conditionWithValue<datetime.Dayjs, { minDate: datetime.Dayjs }>(
        date,
        message,
      ),
    });
  }

  /**
   * Establece un valor por defecto.
   * @param value Fecha por defecto (dayjs).
   */
  default(value: datetime.Dayjs): VDateNotNull {
    return new VDateNotNull({ ...this.cond, defaultValue: value });
  }

  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VDateConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }
}

/**
 * Verificador de fechas que acepta null/undefined (opcional por defecto).
 * Use `.required()` o `.default()` para cambiar a la variante requerida.
 */
export class VDate extends Verifier<datetime.Dayjs | null> {
  /**
   * Verifica y parsea la fecha, retornando null si el dato esta ausente.
   * @param data Dato a verificar.
   * @returns Instancia dayjs o null.
   */
  check(data: any): datetime.Dayjs | null {
    let val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vDate(val, this.badTypeMessage, this.cond);
  }

  /**
   * Define el formato que debe cumplir la fecha (parsing estricto).
   */
  format(
    fmt: string,
    message?: ConditionMessageInput<string, { format: string }>,
  ): VDate {
    return new VDate({
      ...this.cond,
      format: conditionWithValue<string, { format: string }>(fmt, message),
    });
  }

  /**
   * Define la zona horaria aplicada al parsear (si el input no la incluye).
   */
  timeZone(
    tz: string,
    message?: ConditionMessageInput<string, { timeZone: string }>,
  ): VDate {
    return new VDate({
      ...this.cond,
      timeZone: conditionWithValue<string, { timeZone: string }>(tz, message),
    });
  }

  /**
   * Define la fecha maxima permitida (inclusive).
   */
  maxDate(
    date: datetime.Dayjs,
    message?: ConditionMessageInput<
      datetime.Dayjs,
      { maxDate: datetime.Dayjs }
    >,
  ): VDate {
    return new VDate({
      ...this.cond,
      maxDate: conditionWithValue<datetime.Dayjs, { maxDate: datetime.Dayjs }>(
        date,
        message,
      ),
    });
  }

  /**
   * Define la fecha minima permitida (inclusive).
   */
  minDate(
    date: datetime.Dayjs,
    message?: ConditionMessageInput<
      datetime.Dayjs,
      { minDate: datetime.Dayjs }
    >,
  ): VDate {
    return new VDate({
      ...this.cond,
      minDate: conditionWithValue<datetime.Dayjs, { minDate: datetime.Dayjs }>(
        date,
        message,
      ),
    });
  }

  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VDateConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }

  /**
   * Convierte el verificador en su variante `VDateNotNull` (requerido).
   */
  required(): VDateNotNull {
    return new VDateNotNull(this.cond);
  }

  /**
   * Establece una fecha por defecto. Resultado: `VDateNotNull`.
   */
  default(value: datetime.Dayjs): VDateNotNull {
    return new VDateNotNull({ ...this.cond, defaultValue: value });
  }
}
