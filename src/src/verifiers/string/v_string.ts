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

  minLength(
    n: number,
    message?: ConditionMessageInput<number, { minLength: number }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      minLength: conditionWithValue<number, { minLength: number }>(n, message),
    });
  }

  maxLength(
    n: number,
    message?: ConditionMessageInput<number, { maxLength: number }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      maxLength: conditionWithValue<number, { maxLength: number }>(n, message),
    });
  }

  regex(
    pattern: RegExp,
    message?: ConditionMessageInput<RegExp, { regex: RegExp }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      regex: conditionWithValue<RegExp, { regex: RegExp }>(pattern, message),
    });
  }

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

  in(
    values: string[],
    message?: ConditionMessageInput<string[], { in: string[] }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      in: conditionWithValue<string[], { in: string[] }>(values, message),
    });
  }

  notIn(
    values: string[],
    message?: ConditionMessageInput<string[], { notIn: string[] }>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      notIn: conditionWithValue<string[], { notIn: string[] }>(values, message),
    });
  }

  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  ignoreCase(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VStringNotNull {
    return new VStringNotNull({
      ...this.cond,
      ignoreCase: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  trim(): Verifier<string> {
    return this.transform((value) => value.trim());
  }

  trimStart(): Verifier<string> {
    return this.transform((value) => value.trimStart());
  }

  trimEnd(): Verifier<string> {
    return this.transform((value) => value.trimEnd());
  }

  toLowerCase(): Verifier<string> {
    return this.transform((value) => value.toLowerCase());
  }

  toUpperCase(): Verifier<string> {
    return this.transform((value) => value.toUpperCase());
  }

  removeAccents(): Verifier<string> {
    return this.transform((value) =>
      value.normalize("NFD").replace(/\p{M}/gu, ""),
    );
  }

  padStart(maxLength: number, fillString?: string): Verifier<string> {
    return this.transform((value) => value.padStart(maxLength, fillString));
  }

  padEnd(maxLength: number, fillString?: string): Verifier<string> {
    return this.transform((value) => value.padEnd(maxLength, fillString));
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
}
