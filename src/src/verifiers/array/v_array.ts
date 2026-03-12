import { VerificationError } from "../../error/v_error";
import {
  messageResp,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import {
  getMessage,
  getValue,
  IMessageLanguage,
} from "../../languages/message";
import { VAny } from "../any/v_any";
import { VObject, VObjectNotNull } from "../object/v_object";
import { Verifier } from "../verifier";

export interface VArrayConditions<T extends Verifier<any>>
  extends
    VBadTypeMessage,
    VDefaultValue<ReturnType<T["check"]>[]>,
    VVCIsRequired {
  minLength?: number;
  maxLength?: number;
}

interface VArrayDefaultMessages {
  minLength: IMessageLanguage<{ minLength: number }>;
  maxLength: IMessageLanguage<{ maxLength: number }>;
  badTypeMessage: IMessageLanguage<void>;
}

const dMessages: VArrayDefaultMessages = {
  minLength: {
    es: (values: { minLength: number }) =>
      `debe tener al menos ${values.minLength} elementos`,
    en: (values: { minLength: number }) =>
      `must have at least ${values.minLength} elements`,
  },
  maxLength: {
    es: (values: { maxLength: number }) =>
      `no puede tener más de ${values.maxLength} elementos`,
    en: (values: { maxLength: number }) =>
      `must not have more than ${values.maxLength} elements`,
  },
  badTypeMessage: {
    es: () => `debe ser un array`,
    en: () => `must be an array`,
  },
};

function isNestedVerifier(verifier: Verifier<any>) {
  return (
    verifier instanceof VObject ||
    verifier instanceof VObjectNotNull ||
    verifier instanceof VArray ||
    verifier instanceof VArrayNotNull ||
    verifier instanceof VAny
  );
}

function prefixArrayErrorKey(index: number, key?: string) {
  const baseKey = `[${index}]`;
  return key ? `${baseKey}.${key}` : baseKey;
}

function vArray<T extends Verifier<any>>(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  verifier: T,
  conds: VArrayConditions<T>,
): ReturnType<T["check"]>[] {
  if (!Array.isArray(data)) {
    throw new VerificationError([
      {
        key: "",
        message: getMessage(conds?.badTypeMessage, undefined, badTypeMessage),
      },
    ]);
  }

  if (conds.minLength !== undefined && data.length < conds.minLength) {
    throw new VerificationError([
      {
        key: "",
        message: getMessage(
          conds?.minLength,
          { minLength: getValue(conds?.minLength) },
          dMessages.minLength,
        ),
      },
    ]);
  }
  if (conds.maxLength !== undefined && data.length > conds.maxLength) {
    throw new VerificationError([
      {
        key: "",
        message: getMessage(
          conds?.maxLength,
          { maxLength: getValue(conds?.maxLength) },
          dMessages.maxLength,
        ),
      },
    ]);
  }

  const errors: messageResp[] = [];
  const value: ReturnType<T["check"]>[] = [];

  for (let i = 0; i < data.length; i++) {
    try {
      value.push(verifier.check(data[i]));
    } catch (error) {
      if (error instanceof VerificationError) {
        errors.push(
          ...error.errorsObj.map((itemError) => {
            if (isNestedVerifier(verifier)) {
              return {
                ...itemError,
                key: prefixArrayErrorKey(i, itemError.key),
              };
            }

            return {
              ...itemError,
              key: `[${i}]`,
            };
          }),
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new VerificationError(errors);
  }
  return value;
}

export class VArray<T extends Verifier<any>> extends Verifier<
  ReturnType<T["check"]>[] | null
> {
  check(data: any): ReturnType<T["check"]>[] | null {
    const validatedData = this.isRequired(data);
    if (validatedData === null) {
      return null;
    }
    return vArray(validatedData, this.badTypeMessage, this.verifier, this.cond);
  }

  constructor(
    protected verifier: T,
    protected cond: VArrayConditions<T> = {} as any,
  ) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }

  required(): VArrayNotNull<T> {
    return new VArrayNotNull<T>(this.verifier, this.cond);
  }
}

export class VArrayNotNull<T extends Verifier<any>> extends Verifier<
  ReturnType<T["check"]>[]
> {
  check(data: any): ReturnType<T["check"]>[] {
    const validatedData = this.isRequired(data, true);
    return vArray(validatedData, this.badTypeMessage, this.verifier, this.cond);
  }

  constructor(
    protected verifier: T,
    protected cond: VArrayConditions<T> = {} as any,
  ) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }
}
