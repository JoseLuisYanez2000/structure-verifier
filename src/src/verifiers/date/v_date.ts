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

function throwDateError<T>(
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

function isSupportedDateInput(data: any) {
  return (
    typeof data === "number" ||
    typeof data === "string" ||
    data instanceof Date ||
    datetime.isDayjs(data)
  );
}

function haveTimezone(input: any) {
  const regexDesplazamiento = /(?:UTC|GMT|[+-]\d{2}:?\d{2})$/;
  const regexIdentificadorZona =
    /(?:Europe\/|America\/|Asia\/|Africa\/|Australia\/|Antarctica\/|Atlantic\/|Indian\/|Pacific\/)[A-Za-z_]+/;
  return regexDesplazamiento.test(input) || regexIdentificadorZona.test(input);
}

function formatWithTimeZone(format: string) {
  return /Z{1,2}|z{1,2}/.test(format);
}

function applyDefaultTimezone(date: datetime.Dayjs, timeZone: string) {
  return datetime.tz(date.format("YYYY-MM-DD HH:mm:ss"), timeZone);
}

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

function parseDateWithoutFormat(data: any, timeZone: string) {
  let date = datetime(data);

  if (typeof data === "string" && !haveTimezone(data)) {
    date = applyDefaultTimezone(date, timeZone);
  }

  return date;
}

function parseDateInput(
  data: any,
  timeZone: string,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VDateConditions,
) {
  const format = conds?.format ? getValue(conds.format) : undefined;
  const date = format
    ? parseDateWithFormat(data, format, timeZone, conds)
    : parseDateWithoutFormat(data, timeZone);

  if (!date.isValid()) {
    throwDateError(conds?.badTypeMessage, undefined, badTypeMessage);
  }

  return date;
}

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

export class VDateNotNull extends Verifier<datetime.Dayjs> {
  check(data: any): datetime.Dayjs {
    return vDate(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  format(
    fmt: string,
    message?: ConditionMessageInput<string, { format: string }>,
  ): VDateNotNull {
    return new VDateNotNull({
      ...this.cond,
      format: conditionWithValue<string, { format: string }>(fmt, message),
    });
  }

  timeZone(
    tz: string,
    message?: ConditionMessageInput<string, { timeZone: string }>,
  ): VDateNotNull {
    return new VDateNotNull({
      ...this.cond,
      timeZone: conditionWithValue<string, { timeZone: string }>(tz, message),
    });
  }

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

  constructor(protected cond?: VDateConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }
}

export class VDate extends Verifier<datetime.Dayjs | null> {
  check(data: any): datetime.Dayjs | null {
    let val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vDate(val, this.badTypeMessage, this.cond);
  }

  format(
    fmt: string,
    message?: ConditionMessageInput<string, { format: string }>,
  ): VDate {
    return new VDate({
      ...this.cond,
      format: conditionWithValue<string, { format: string }>(fmt, message),
    });
  }

  timeZone(
    tz: string,
    message?: ConditionMessageInput<string, { timeZone: string }>,
  ): VDate {
    return new VDate({
      ...this.cond,
      timeZone: conditionWithValue<string, { timeZone: string }>(tz, message),
    });
  }

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

  constructor(protected cond?: VDateConditions) {
    super(cond);
    this.cond = cond;
    this.badTypeMessage = dMessages.badTypeMessage;
  }

  required(): VDateNotNull {
    return new VDateNotNull(this.cond);
  }
}
