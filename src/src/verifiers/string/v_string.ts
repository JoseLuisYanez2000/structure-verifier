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
import { Verifier } from "../verifier";

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

function normalizeStrings(values: string[]) {
  return values.map((value) => value.toLowerCase());
}

function vString(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VStringConditions,
): string {
  if (getValue(conds?.strictMode) === true && typeof data !== "string") {
    throwStringError(conds?.badTypeMessage, undefined, badTypeMessage);
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
    const comparableValues = ignoreCase
      ? normalizeStrings(allowedValues)
      : allowedValues;

    if (!comparableValues.includes(comparableValue)) {
      throwStringError(conds.in, { in: allowedValues }, dMessages.in);
    }
  }

  if (conds?.notIn !== undefined) {
    const blockedValues = getValue(conds.notIn);
    const comparableValues = ignoreCase
      ? normalizeStrings(blockedValues)
      : blockedValues;

    if (comparableValues.includes(comparableValue)) {
      throwStringError(conds.notIn, { notIn: blockedValues }, dMessages.notIn);
    }
  }

  return stringValue;
}

export class VStringNotNull extends Verifier<string> {
  check(data: any): string {
    return vString(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }
  constructor(protected cond?: VStringConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un texto`,
      en: () => `must be a string`,
    };
  }
}

export class VString extends Verifier<string | null> {
  check(data: any): string | null {
    let val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vString(val, this.badTypeMessage, this.cond);
  }
  constructor(protected cond?: VStringConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un texto`,
      en: () => `must be a string`,
    };
  }
}
