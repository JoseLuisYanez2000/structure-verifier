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
  properties: T;
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
  properties: T;
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
  conds: VObjectConditions<T> | VObjectConditionsNotNull<T>,
): { [K in keyof T]: ReturnType<T[K]["check"]> } {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new VerificationError([
      {
        key: "",
        message: getMessage(
          conds?.badTypeMessage != undefined
            ? conds?.badTypeMessage
            : undefined,
          undefined,
          badTypeMessage,
        ),
      },
    ]);
  }

  const keysData = Object.keys(data);
  const keysValidations = Object.keys(conds.properties);
  if (conds.strictMode) {
    let dif: string[] = [];
    if (conds.ignoreCase) {
      const temp = keysValidations.map((v) => v.toUpperCase());
      dif = keysData.filter((v) => !temp.includes(v.toUpperCase()));
    } else {
      dif = keysData.filter((v) => !keysValidations.includes(v));
    }

    if (dif.length > 0) {
      const error = new VerificationError(
        dif.map((v) => {
          return {
            key: v,
            message: getMessage(conds.invalidPropertyMessage, undefined, {
              es: () => "no es una propiedad válida",
              en: () => "is not a valid property",
            }),
          };
        }),
      );
      if (error.errors.length > 0) throw error;
    }
  }

  const errors: messageResp[] = [];
  const value: Record<string, any> = {};
  const keyMap: { keyV: string; keyD: string }[] = [];

  for (const key in conds.properties) {
    if (conds.ignoreCase) {
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

  if (conds.takeAllValues) {
    for (const dataKey of keysData) {
      if (!keyMap.find((v) => v.keyD == dataKey)) {
        setObjectValue(value, dataKey, getObjectValue(data, dataKey));
      }
    }
  }

  for (const keys of keyMap) {
    try {
      const result = conds.properties[keys.keyV].check(
        getObjectValue(data, keys.keyD),
      );
      setObjectValue(value, keys.keyV, result);
    } catch (error: any) {
      if (error instanceof VerificationError) {
        errors.push(
          ...error.errorsObj.map((v) => {
            const cond = conds.properties[keys.keyV];

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
  if (conds.conds) {
    conds.conds(typedValue);
  }
  return typedValue;
}

export class VObjectNotNull<
  T extends Record<string, Verifier<any>>,
> extends Verifier<{ [K in keyof T]: ReturnType<T[K]["check"]> }> {
  check(data: any): { [K in keyof T]: ReturnType<T[K]["check"]> } {
    return vObject(this.isRequired(data, true), this.badTypeMessage, this.cond);
  }
  constructor(protected cond: VObjectConditionsNotNull<T>) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un objeto`,
      en: () => `must be an object`,
    };
  }
}

export class VObject<T extends Record<string, Verifier<any>>> extends Verifier<
  { [K in keyof T]: ReturnType<T[K]["check"]> } | null
> {
  check(data: any): { [K in keyof T]: ReturnType<T[K]["check"]> } | null {
    let val = this.isRequired(data);
    if (val === null || val === undefined) {
      return null;
    }
    return vObject(val, this.badTypeMessage, this.cond);
  }
  constructor(protected cond: VObjectConditions<T>) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un objeto`,
      en: () => `must be an object`,
    };
  }
}
