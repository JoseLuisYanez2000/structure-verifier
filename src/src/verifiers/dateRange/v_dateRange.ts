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
import { VDateNotNull } from "../date/v_date";
import { VerifierConfig } from "../../config/verifierConfig";

/**
 * Rango de fechas donde ambos extremos pueden ser nulos (abierto por un lado).
 */
export interface DateRange {
  from: datetime.Dayjs | null;
  to: datetime.Dayjs | null;
}

/**
 * Rango de fechas estricto, con ambos extremos presentes (no-null).
 */
export interface StrictDateRange {
  from: datetime.Dayjs;
  to: datetime.Dayjs;
}

/**
 * Unidades admitidas para la condicion `maxSpan`.
 */
export type MaxSpanUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

/**
 * Representa la duracion maxima permitida entre `from` y `to` para un DateRange.
 * @property value Cantidad de unidades.
 * @property unit Unidad de la cantidad.
 */
export interface MaxSpan {
  value: number;
  unit: MaxSpanUnit;
}

/**
 * Configuracion aceptada por los verificadores de rango de fechas.
 * @property format Formato esperado para cada fecha del rango.
 * @property separator Separador entre `from` y `to` cuando el input es string (default "|").
 * @property timeZone Zona horaria por defecto cuando no venga en la cadena.
 * @property maxDate Fecha maxima para `to`.
 * @property minDate Fecha minima para `from`.
 * @property maxSpan Duracion maxima permitida entre `from` y `to`.
 * @property requireFrom Si es true, exige que `from` este presente.
 * @property requireTo Si es true, exige que `to` este presente.
 * @property autoSwap Si `from > to`, intercambia los valores en vez de fallar.
 * @property exclusiveEnd Si es true, `maxSpan` se compara de forma estricta (>).
 * @property maxInputLength Longitud maxima permitida para la cadena de entrada.
 */
export interface VDateRangeConditions
  extends
    VBadTypeMessage,
    VDefaultValue<DateRange>,
    VVCIsRequired,
    IInfo<string> {
  format?: MessageType<string, { format: string }>;
  separator?: MessageType<string, { separator: string }>;
  timeZone?: MessageType<string, { timeZone: string }>;
  maxDate?: MessageType<datetime.Dayjs, { maxDate: datetime.Dayjs }>;
  minDate?: MessageType<datetime.Dayjs, { minDate: datetime.Dayjs }>;
  maxSpan?: MessageType<MaxSpan, { maxSpan: MaxSpan }>;
  requireFrom?: MessageType<boolean, void>;
  requireTo?: MessageType<boolean, void>;
  autoSwap?: boolean;
  exclusiveEnd?: boolean;
  maxInputLength?: number;
}

interface VDateRangeDefaultMessages {
  separator: IMessageLanguage<{ separator: string }>;
  atLeastOne: IMessageLanguage<void>;
  order: IMessageLanguage<void>;
  maxSpan: IMessageLanguage<{ maxSpan: MaxSpan }>;
  requireFrom: IMessageLanguage<void>;
  requireTo: IMessageLanguage<void>;
  badTypeMessage: IMessageLanguage<void>;
  tooLong: IMessageLanguage<{ max: number }>;
  format: IMessageLanguage<{ format: string; side: "from" | "to" }>;
}

const UNIT_LABELS: Record<
  MaxSpanUnit,
  { es: [string, string]; en: [string, string] }
> = {
  second: { es: ["segundo", "segundos"], en: ["second", "seconds"] },
  minute: { es: ["minuto", "minutos"], en: ["minute", "minutes"] },
  hour: { es: ["hora", "horas"], en: ["hour", "hours"] },
  day: { es: ["día", "días"], en: ["day", "days"] },
  week: { es: ["semana", "semanas"], en: ["week", "weeks"] },
  month: { es: ["mes", "meses"], en: ["month", "months"] },
  year: { es: ["año", "años"], en: ["year", "years"] },
};

/**
 * Devuelve la etiqueta de unidad (singular o plural) segun cantidad e idioma.
 * @param unit Unidad temporal.
 * @param value Cantidad asociada (determina singular vs plural).
 * @param lang Idioma ("es" o "en").
 */
function unitLabel(unit: MaxSpanUnit, value: number, lang: "es" | "en"): string {
  return UNIT_LABELS[unit][lang][value === 1 ? 0 : 1];
}

const DEFAULT_SEPARATOR = "|";
const DEFAULT_MAX_INPUT_LENGTH = 1024;

const dMessages: VDateRangeDefaultMessages = {
  separator: {
    es: (values: { separator: string }) =>
      `debe contener exactamente un separador "${values.separator}"`,
    en: (values: { separator: string }) =>
      `must contain exactly one separator "${values.separator}"`,
  },
  atLeastOne: {
    es: () => `debe tener al menos una fecha (inicial o final)`,
    en: () => `must contain at least one date (start or end)`,
  },
  order: {
    es: () => `la fecha inicial debe ser menor o igual a la final`,
    en: () => `the start date must be less than or equal to the end date`,
  },
  maxSpan: {
    es: (values: { maxSpan: MaxSpan }) =>
      `el rango no puede exceder ${values.maxSpan.value} ${
        unitLabel(values.maxSpan.unit, values.maxSpan.value, "es")
      }`,
    en: (values: { maxSpan: MaxSpan }) =>
      `the range cannot exceed ${values.maxSpan.value} ${
        unitLabel(values.maxSpan.unit, values.maxSpan.value, "en")
      }`,
  },
  requireFrom: {
    es: () => `la fecha inicial es obligatoria`,
    en: () => `the start date is required`,
  },
  requireTo: {
    es: () => `la fecha final es obligatoria`,
    en: () => `the end date is required`,
  },
  badTypeMessage: {
    es: () => `debe ser un rango de fechas`,
    en: () => `must be a date range`,
  },
  tooLong: {
    es: (values: { max: number }) =>
      `la entrada excede el largo máximo permitido (${values.max})`,
    en: (values: { max: number }) =>
      `input exceeds the maximum allowed length (${values.max})`,
  },
  format: {
    es: (values: { format: string; side: "from" | "to" }) =>
      `la fecha ${values.side === "from" ? "inicial" : "final"} debe tener el formato ${values.format}`,
    en: (values: { format: string; side: "from" | "to" }) =>
      `the ${values.side === "from" ? "start" : "end"} date must have the format ${values.format}`,
  },
};

/**
 * Lanza `VerificationError` asociando el error a un `key` especifico (p. ej. "from", "to", "range").
 * @param condition Condicion con posible mensaje personalizado.
 * @param values Parametros para la funcion de mensaje.
 * @param fallback Mensaje por defecto multilenguaje.
 * @param key Clave bajo la cual se reporta el error.
 */
function throwRangeError(
  condition: MessageType<any, any> | string | undefined,
  values: any,
  fallback: IMessageLanguage<any>,
  key: string = "",
): never {
  throw new VerificationError([
    {
      key,
      message: getMessage(condition, values, fallback),
    },
  ]);
}

/**
 * Type guard para detectar un objeto que ya viene en forma `DateRange` (con keys from/to).
 */
function isDateRangeObject(v: any): v is DateRange {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    "from" in v &&
    "to" in v
  );
}

/**
 * Normaliza el dato de entrada a una de las 3 formas soportadas:
 * - `DateRange` (objeto ya tipado),
 * - `string` con separador,
 * - `null` cuando el tipo no es soportado.
 * Arrays `[from, to]` se convierten a string usando el `separator` indicado.
 */
function normalizeInput(
  data: any,
  separator: string,
): string | DateRange | null {
  if (isDateRangeObject(data)) {
    return data;
  }
  if (Array.isArray(data) && data.length === 2) {
    const [from, to] = data;
    const l = from === null || from === undefined ? "" : String(from);
    const r = to === null || to === undefined ? "" : String(to);
    return `${l}${separator}${r}`;
  }
  if (typeof data === "string") {
    return data;
  }
  return null;
}

/**
 * Construye la condicion de formato para un lado (`from`/`to`) incluyendo un mensaje
 * que identifica si el error proviene de la fecha inicial o final.
 * Si el usuario ya envio un mensaje personalizado, se respeta tal cual.
 */
function buildFormatConditionForSide(
  formatCond: MessageType<string, { format: string }> | undefined,
  side: "from" | "to",
): MessageType<string, { format: string }> | undefined {
  if (formatCond === undefined) return undefined;
  const fmt = getValue(formatCond);

  if (
    typeof formatCond === "object" &&
    formatCond !== null &&
    "val" in formatCond &&
    "message" in formatCond
  ) {
    return formatCond;
  }

  return {
    val: fmt,
    message: (values: { format: string }) =>
      dMessages.format[VerifierConfig.lang]({ ...values, side }),
  };
}

/**
 * Parsea una de las dos fechas del rango reutilizando `VDateNotNull`.
 * Si falla, remapea el `key` del error al lado correspondiente ("from" o "to").
 */
function parseSide(
  raw: string,
  side: "from" | "to",
  conds: VDateRangeConditions,
): datetime.Dayjs {
  try {
    const sub = new VDateNotNull({
      format: buildFormatConditionForSide(conds.format, side),
      timeZone: conds.timeZone,
      minDate: conds.minDate,
      maxDate: conds.maxDate,
    });
    return sub.check(raw);
  } catch (err) {
    if (err instanceof VerificationError) {
      const remapped = err.errorsObj.map((m) => ({
        ...m,
        key: side,
      }));
      throw new VerificationError(remapped);
    }
    throw err;
  }
}

/**
 * Orquesta la verificacion de un rango de fechas a partir de:
 * string con separador, array `[from, to]` u objeto `DateRange`.
 * Aplica reglas de longitud maxima, requiredFrom/To, minDate/maxDate,
 * orden (o autoSwap) y maxSpan (inclusivo/exclusivo).
 *
 * @param data Dato a verificar.
 * @param badTypeMessage Mensaje fallback para tipo invalido.
 * @param conds Configuracion del rango.
 * @returns Objeto `DateRange` con fechas ya parseadas.
 */
function vDateRange(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds: VDateRangeConditions,
): DateRange {
  const separator = conds.separator
    ? getValue(conds.separator)
    : DEFAULT_SEPARATOR;

  if (typeof separator !== "string" || separator.length === 0) {
    throw new Error("VDateRange: separator must be a non-empty string");
  }

  const normalized = normalizeInput(data, separator);

  if (normalized !== null && typeof normalized === "object") {
    return validateRangeObject(normalized, badTypeMessage, conds);
  }

  if (typeof normalized !== "string" || normalized.length === 0) {
    throwRangeError(conds.badTypeMessage, undefined, badTypeMessage);
  }

  const maxLen = conds.maxInputLength ?? DEFAULT_MAX_INPUT_LENGTH;
  if (normalized.length > maxLen) {
    throwRangeError(undefined, { max: maxLen }, dMessages.tooLong, "range");
  }

  const sepIndex = normalized.indexOf(separator);
  if (
    sepIndex === -1 ||
    normalized.indexOf(separator, sepIndex + separator.length) !== -1
  ) {
    throwRangeError(conds.separator, { separator }, dMessages.separator);
  }

  const fromRaw = normalized.slice(0, sepIndex).trim();
  const toRaw = normalized.slice(sepIndex + separator.length).trim();

  if (fromRaw.length === 0 && toRaw.length === 0) {
    throwRangeError(undefined, undefined, dMessages.atLeastOne, "range");
  }

  if (
    fromRaw.length === 0 &&
    conds.requireFrom !== undefined &&
    getValue(conds.requireFrom) === true
  ) {
    throwRangeError(conds.requireFrom, undefined, dMessages.requireFrom, "from");
  }

  if (
    toRaw.length === 0 &&
    conds.requireTo !== undefined &&
    getValue(conds.requireTo) === true
  ) {
    throwRangeError(conds.requireTo, undefined, dMessages.requireTo, "to");
  }

  let from = fromRaw.length > 0 ? parseSide(fromRaw, "from", conds) : null;
  let to = toRaw.length > 0 ? parseSide(toRaw, "to", conds) : null;

  return finalizeRange({ from, to }, conds);
}

/**
 * Verifica un `DateRange` ya tipado (objeto con dayjs). Valida instancias,
 * presencia segun `requireFrom`/`requireTo`, limites `minDate`/`maxDate`
 * y delega la finalizacion (orden, swap, span) a `finalizeRange`.
 */
function validateRangeObject(
  range: DateRange,
  badTypeMessage: IMessageLanguage<void>,
  conds: VDateRangeConditions,
): DateRange {
  const from = range.from ?? null;
  const to = range.to ?? null;

  if (from !== null && !datetime.isDayjs(from)) {
    throwRangeError(conds.badTypeMessage, undefined, badTypeMessage, "from");
  }
  if (to !== null && !datetime.isDayjs(to)) {
    throwRangeError(conds.badTypeMessage, undefined, badTypeMessage, "to");
  }

  if (from === null && to === null) {
    throwRangeError(undefined, undefined, dMessages.atLeastOne, "range");
  }

  if (
    from === null &&
    conds.requireFrom !== undefined &&
    getValue(conds.requireFrom) === true
  ) {
    throwRangeError(conds.requireFrom, undefined, dMessages.requireFrom, "from");
  }

  if (
    to === null &&
    conds.requireTo !== undefined &&
    getValue(conds.requireTo) === true
  ) {
    throwRangeError(conds.requireTo, undefined, dMessages.requireTo, "to");
  }

  if (from !== null && conds.minDate !== undefined) {
    const minDate = getValue(conds.minDate);
    if (from.isBefore(minDate)) {
      throwRangeError(conds.badTypeMessage, undefined, badTypeMessage, "from");
    }
  }
  if (to !== null && conds.maxDate !== undefined) {
    const maxDate = getValue(conds.maxDate);
    if (to.isAfter(maxDate)) {
      throwRangeError(conds.badTypeMessage, undefined, badTypeMessage, "to");
    }
  }

  return finalizeRange({ from, to }, conds);
}

/**
 * Normaliza el orden (`from <= to`) aplicando `autoSwap` si esta habilitado,
 * y valida la duracion maxima del rango segun `maxSpan`/`exclusiveEnd`.
 * @param range Rango previo.
 * @param conds Configuracion.
 * @returns Rango verificado (posiblemente con from/to intercambiados).
 */
function finalizeRange(
  range: DateRange,
  conds: VDateRangeConditions,
): DateRange {
  let { from, to } = range;

  if (from && to && from.isAfter(to)) {
    if (conds.autoSwap === true) {
      const swap = from;
      from = to;
      to = swap;
    } else {
      throwRangeError(undefined, undefined, dMessages.order, "range");
    }
  }

  if (conds.maxSpan !== undefined && from && to) {
    const max = getValue(conds.maxSpan);
    const diff = to.diff(from, max.unit, true);
    const exceeds = conds.exclusiveEnd === true
      ? diff >= max.value
      : diff > max.value;
    if (exceeds) {
      throwRangeError(conds.maxSpan, { maxSpan: max }, dMessages.maxSpan, "range");
    }
  }

  return { from, to };
}

/**
 * Base abstracta compartida por `VDateRange` y `VDateRangeNotNull`.
 * Expone los metodos de configuracion fluente sobre `VDateRangeConditions`.
 * @typeParam T Tipo de retorno de `check` (DateRange o DateRange | null).
 */
abstract class VDateRangeBase<T extends DateRange | null> extends Verifier<T> {
  /**
   * @param cond Configuracion del rango (obligatoria en la base).
   */
  constructor(protected cond: VDateRangeConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }

  /**
   * Acceso de solo lectura a la configuracion actual del verificador.
   */
  get conditions(): Readonly<VDateRangeConditions> {
    return this.cond;
  }

  /**
   * Crea una nueva instancia de la misma subclase aplicando un parche a las condiciones.
   * @param patch Cambios a fusionar.
   */
  protected with(patch: Partial<VDateRangeConditions>): this {
    const Ctor = this.constructor as new (c: VDateRangeConditions) => this;
    return new Ctor({ ...this.cond, ...patch });
  }

  /**
   * Define el formato esperado para cada fecha del rango.
   */
  format(
    fmt: string,
    message?: ConditionMessageInput<string, { format: string }>,
  ): this {
    return this.with({
      format: conditionWithValue<string, { format: string }>(fmt, message),
    });
  }

  /**
   * Define el separador usado entre `from` y `to` cuando el input es string.
   * Debe ser un string no vacio.
   */
  separator(
    sep: string,
    message?: ConditionMessageInput<string, { separator: string }>,
  ): this {
    if (typeof sep !== "string" || sep.length === 0) {
      throw new Error("VDateRange: separator must be a non-empty string");
    }
    return this.with({
      separator: conditionWithValue<string, { separator: string }>(sep, message),
    });
  }

  /**
   * Define la zona horaria por defecto aplicada al parsear.
   */
  timeZone(
    tz: string,
    message?: ConditionMessageInput<string, { timeZone: string }>,
  ): this {
    return this.with({
      timeZone: conditionWithValue<string, { timeZone: string }>(tz, message),
    });
  }

  /**
   * Define la fecha minima aceptada para `from`.
   */
  minDate(
    date: datetime.Dayjs,
    message?: ConditionMessageInput<
      datetime.Dayjs,
      { minDate: datetime.Dayjs }
    >,
  ): this {
    return this.with({
      minDate: conditionWithValue<datetime.Dayjs, { minDate: datetime.Dayjs }>(
        date,
        message,
      ),
    });
  }

  /**
   * Define la fecha maxima aceptada para `to`.
   */
  maxDate(
    date: datetime.Dayjs,
    message?: ConditionMessageInput<
      datetime.Dayjs,
      { maxDate: datetime.Dayjs }
    >,
  ): this {
    return this.with({
      maxDate: conditionWithValue<datetime.Dayjs, { maxDate: datetime.Dayjs }>(
        date,
        message,
      ),
    });
  }

  /**
   * Limita la duracion maxima del rango (p. ej. 30 dias).
   */
  maxSpan(
    span: MaxSpan,
    message?: ConditionMessageInput<MaxSpan, { maxSpan: MaxSpan }>,
  ): this {
    return this.with({
      maxSpan: conditionWithValue<MaxSpan, { maxSpan: MaxSpan }>(span, message),
    });
  }

  /**
   * Exige que la fecha inicial este presente.
   */
  requireFrom(
    message?: ConditionMessageInput<boolean, void>,
  ): this {
    return this.with({
      requireFrom: conditionWithValue<boolean, void>(true, message),
    });
  }

  /**
   * Exige que la fecha final este presente.
   */
  requireTo(
    message?: ConditionMessageInput<boolean, void>,
  ): this {
    return this.with({
      requireTo: conditionWithValue<boolean, void>(true, message),
    });
  }

  /**
   * Si se habilita y `from > to`, intercambia los valores en lugar de lanzar error.
   */
  autoSwap(enabled: boolean = true): this {
    return this.with({ autoSwap: enabled });
  }

  /**
   * Si se habilita, `maxSpan` se evalua como `>` (exclusivo) en vez de `>=`.
   */
  exclusiveEnd(enabled: boolean = true): this {
    return this.with({ exclusiveEnd: enabled });
  }

  /**
   * Define la longitud maxima permitida para la cadena de entrada.
   */
  maxInputLength(max: number): this {
    return this.with({ maxInputLength: max });
  }
}

/**
 * Verificador de rango de fechas que NO acepta null/undefined (siempre requerido).
 *
 * @example
 * ```ts
 * Verifiers.DateRangeNotNull({})
 *   .format("YYYY-MM-DD")
 *   .separator("|")
 *   .maxSpan({ value: 30, unit: "day" })
 *   .check("2026-01-01|2026-01-20");
 * ```
 */
export class VDateRangeNotNull extends VDateRangeBase<DateRange> {
  /**
   * Verifica y parsea el rango de fechas. Lanza si es null/undefined.
   * @param data Dato a verificar (string, array u objeto DateRange).
   * @returns `DateRange` verificado.
   */
  check(data: any): DateRange {
    return vDateRange(
      this.isRequired(data, true, this.cond.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  /**
   * Establece un `DateRange` por defecto.
   */
  default(value: DateRange): VDateRangeNotNull {
    return new VDateRangeNotNull({ ...this.cond, defaultValue: value });
  }

  /**
   * Devuelve un verificador que garantiza que ambos extremos (`from` y `to`) esten presentes.
   * Internamente aplica `requireFrom().requireTo()` y transforma el resultado a `StrictDateRange`.
   * @returns Verificador que retorna `StrictDateRange`.
   */
  strict(): Verifier<StrictDateRange> {
    const base = this.requireFrom().requireTo();
    return base.transform<StrictDateRange>((r) => ({
      from: r.from as datetime.Dayjs,
      to: r.to as datetime.Dayjs,
    }));
  }
}

/**
 * Verificador de rango de fechas que acepta null/undefined (opcional por defecto).
 * Use `.required()` o `.default()` para cambiar a la variante requerida.
 */
export class VDateRange extends VDateRangeBase<DateRange | null> {
  /**
   * Verifica el rango o devuelve null cuando el dato esta ausente.
   * @param data Dato a verificar.
   * @returns `DateRange` verificado o null.
   */
  check(data: any): DateRange | null {
    const val = this.isRequired(data, undefined, this.cond.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vDateRange(val, this.badTypeMessage, this.cond);
  }

  /**
   * Convierte el verificador en su variante `VDateRangeNotNull` (requerido).
   */
  required(): VDateRangeNotNull {
    return new VDateRangeNotNull(this.cond);
  }

  /**
   * Establece un `DateRange` por defecto. Resultado: `VDateRangeNotNull`.
   */
  default(value: DateRange): VDateRangeNotNull {
    return new VDateRangeNotNull({ ...this.cond, defaultValue: value });
  }
}
