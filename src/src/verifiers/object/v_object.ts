import { VerificationError } from "../../error/v_error";
import {
  messageResp,
  MessageType,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import { getMessage, IMessageLanguage } from "../../languages/message";
import { VAny } from "../any/v_any";
import { VArray, VArrayNotNull } from "../array/v_array";
import { Verifier } from "../verifier";

export interface VObjectConditions<T extends Record<string, Verifier<any>>>
  extends VBadTypeMessage, VDefaultValue<T>, VVCIsRequired {
  invalidPropertyMessage?: MessageType<void, void>;
  strictMode?: boolean;
  ignoreCase?: boolean;
  takeAllValues?: boolean;
  conds?: (val: { [K in keyof T]: ReturnType<T[K]["check"]> } | null) => void;
}

export interface VObjectConditionsNotNull<
  T extends Record<string, Verifier<any>>,
>
  extends VBadTypeMessage, VDefaultValue<T>, VVCIsRequired {
  invalidPropertyMessage?: MessageType<void, void>;
  strictMode?: boolean;
  ignoreCase?: boolean;
  takeAllValues?: boolean;
  conds?: (val: { [K in keyof T]: ReturnType<T[K]["check"]> }) => void;
}

const UNSAFE_OBJECT_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function setObjectValue(target: Record<string, any>, key: string, value: any) {
  if (UNSAFE_OBJECT_KEYS.has(key)) {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return;
  }

  target[key] = value;
}

function getObjectValue(source: Record<string, any>, key: string) {
  const descriptor = Object.getOwnPropertyDescriptor(source, key);
  return descriptor ? descriptor.value : source[key];
}

function isNestedVerifier(verifier: Verifier<any>) {
  return (
    verifier instanceof VObject ||
    verifier instanceof VObjectNotNull ||
    verifier instanceof VArray ||
    verifier instanceof VArrayNotNull ||
    verifier instanceof VAny
  );
}

function vObject<T extends Record<string, Verifier<any>>>(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  properties: T,
  options: VObjectConditions<T> | VObjectConditionsNotNull<T>,
): { [K in keyof T]: ReturnType<T[K]["check"]> } {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new VerificationError([
      {
        key: "",
        message: getMessage(
          options?.badTypeMessage != undefined
            ? options?.badTypeMessage
            : undefined,
          undefined,
          badTypeMessage,
        ),
      },
    ]);
  }

  const keysData = Object.keys(data);
  const keysValidations = Object.keys(properties);

  if (options.strictMode) {
    let dif: string[] = [];

    if (options.ignoreCase) {
      const temp = keysValidations.map((v) => v.toUpperCase());
      dif = keysData.filter((v) => !temp.includes(v.toUpperCase()));
    } else {
      dif = keysData.filter((v) => !keysValidations.includes(v));
    }

    if (dif.length > 0) {
      const error = new VerificationError(
        dif.map((v) => ({
          key: v,
          message: getMessage(options.invalidPropertyMessage, undefined, {
            es: () => "no es una propiedad válida",
            en: () => "is not a valid property",
          }),
        })),
      );

      if (error.errors.length > 0) throw error;
    }
  }

  const errors: messageResp[] = [];
  const value: Record<string, any> = {};
  const keyMap: { keyV: string; keyD: string }[] = [];

  for (const key in properties) {
    if (options.ignoreCase) {
      const dataKey = keysData.find(
        (v) => v.toLocaleUpperCase() == key.toUpperCase(),
      );

      if (dataKey) {
        keyMap.push({
          keyV: key,
          keyD: dataKey,
        });
      } else {
        keyMap.push({
          keyV: key,
          keyD: key,
        });
      }
    } else {
      keyMap.push({
        keyV: key,
        keyD: key,
      });
    }
  }

  if (options.takeAllValues) {
    for (const dataKey of keysData) {
      if (!keyMap.find((v) => v.keyD == dataKey)) {
        setObjectValue(value, dataKey, getObjectValue(data, dataKey));
      }
    }
  }

  for (const keys of keyMap) {
    try {
      const result = properties[keys.keyV].check(
        getObjectValue(data, keys.keyD),
      );

      setObjectValue(value, keys.keyV, result);
    } catch (error: any) {
      if (error instanceof VerificationError) {
        errors.push(
          ...error.errorsObj.map((v) => {
            const cond = properties[keys.keyV];

            if (isNestedVerifier(cond)) {
              v.key = keys.keyV + (v.key ? "." + v.key : "");
            } else {
              v.key = keys.keyV;
            }

            v.isEmpty = undefined;
            return v;
          }),
        );
      } else {
        throw error;
      }
    }
  }

  if (errors.length > 0) {
    throw new VerificationError(errors);
  }

  const typedValue = value as { [K in keyof T]: ReturnType<T[K]["check"]> };

  if (options.conds) {
    options.conds(typedValue);
  }

  return typedValue;
}

export class VObjectNotNull<
  T extends Record<string, Verifier<any>>,
> extends Verifier<{ [K in keyof T]: ReturnType<T[K]["check"]> }> {
  constructor(
    protected properties: T,
    protected conditions: VObjectConditionsNotNull<T> = {} as any,
  ) {
    super(conditions);
    this.badTypeMessage = {
      es: () => `debe ser un objeto`,
      en: () => `must be an object`,
    };
  }

  check(data: any): { [K in keyof T]: ReturnType<T[K]["check"]> } {
    return vObject(
      this.isRequired(data, true),
      this.badTypeMessage,
      this.properties,
      this.conditions,
    );
  }
}

export class VObject<T extends Record<string, Verifier<any>>> extends Verifier<
  { [K in keyof T]: ReturnType<T[K]["check"]> } | null
> {
  constructor(
    protected properties: T,
    protected conditions: VObjectConditions<T> = {} as any,
  ) {
    super(conditions);
    this.badTypeMessage = {
      es: () => `debe ser un objeto`,
      en: () => `must be an object`,
    };
  }

  check(data: any): { [K in keyof T]: ReturnType<T[K]["check"]> } | null {
    let val = this.isRequired(data);

    if (val === null || val === undefined) {
      if (this.conditions.conds) {
        this.conditions.conds(null);
      }
      return null;
    }

    return vObject(val, this.badTypeMessage, this.properties, this.conditions);
  }

  required(): VObjectNotNull<T> {
    return new VObjectNotNull<T>(
      this.properties,
      this.conditions as unknown as VObjectConditionsNotNull<T>,
    );
  }
}
