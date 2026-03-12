import { VerificationError } from "../../error/v_error";
import {
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
import { Verifier } from "../verifier";

export interface VBooleanConditions
  extends VBadTypeMessage, VDefaultValue<boolean>, VVCIsRequired {
  strictMode?: MessageType<boolean, void>;
}

const TRUE_VALUES = [true, 1, "1"] as const;
const FALSE_VALUES = [false, 0, "0"] as const;
const BOOLEAN_STRINGS = ["true", "false"] as const;

function throwBooleanError(
  conds: VBooleanConditions | undefined,
  badTypeMessage: IMessageLanguage<void>,
): never {
  throw new VerificationError([
    {
      key: "",
      message: getMessage(conds?.badTypeMessage, undefined, badTypeMessage),
    },
  ]);
}

function vBoolean(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VBooleanConditions,
): boolean {
  if (getValue(conds?.strictMode) === true) {
    if (typeof data !== "boolean") {
      throwBooleanError(conds, badTypeMessage);
    }

    return data;
  }

  if (TRUE_VALUES.includes(data)) {
    return true;
  }

  if (FALSE_VALUES.includes(data)) {
    return false;
  }

  if (typeof data === "string") {
    const normalized = data.toLowerCase();
    if (
      BOOLEAN_STRINGS.includes(normalized as (typeof BOOLEAN_STRINGS)[number])
    ) {
      return normalized === "true";
    }
  }

  throwBooleanError(conds, badTypeMessage);
}

export class VBooleanNotNull extends Verifier<boolean> {
  check(data: any): boolean {
    return vBoolean(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }
  constructor(protected cond?: VBooleanConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un booleano`,
      en: () => `must be a boolean`,
    };
  }
}

export class VBoolean extends Verifier<boolean | null> {
  check(data: any): boolean | null {
    let val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vBoolean(val, this.badTypeMessage, this.cond);
  }
  constructor(protected cond?: VBooleanConditions) {
    super(cond);
    this.cond = cond;
    this.badTypeMessage = {
      es: () => `debe ser un booleano`,
      en: () => `must be a boolean`,
    };
  }

  required(): VBooleanNotNull {
    return new VBooleanNotNull(this.cond);
  }
}
