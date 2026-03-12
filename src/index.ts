import { VAny, type VAnyConditions } from "./src/verifiers/any/v_any";
import {
  VArray,
  VArrayNotNull,
  type VArrayConditions,
} from "./src/verifiers/array/v_array";
import {
  VBoolean,
  VBooleanNotNull,
  type VBooleanConditions,
} from "./src/verifiers/boolean/v_boolean";
import {
  VDate,
  VDateNotNull,
  type VDateConditions,
} from "./src/verifiers/date/v_date";
import {
  VNumber,
  VNumberNotNull,
  type VNumberConditions,
} from "./src/verifiers/number/v_number";
import {
  VObject,
  VObjectNotNull,
  type VObjectConditions,
  type VObjectConditionsNotNull,
} from "./src/verifiers/object/v_object";
import {
  VString,
  VStringNotNull,
  type VStringConditions,
} from "./src/verifiers/string/v_string";
import {
  VUUID,
  VUUIDNotNull,
  type VUUIDConditions,
} from "./src/verifiers/uuid/v_uuid";
import { Verifier } from "./src/verifiers/verifier";

export { VerificationError } from "./src/error/v_error";

export { InferFactoryType, InferType } from "./src/verifiers/type";

export { Verifier } from "./src/verifiers/verifier";
export type { VAnyConditions } from "./src/verifiers/any/v_any";
export type { VArrayConditions } from "./src/verifiers/array/v_array";
export type { VBooleanConditions } from "./src/verifiers/boolean/v_boolean";
export type { VDateConditions } from "./src/verifiers/date/v_date";
export type { VNumberConditions } from "./src/verifiers/number/v_number";
export type {
  VObjectConditions,
  VObjectConditionsNotNull,
} from "./src/verifiers/object/v_object";
export type { VStringConditions } from "./src/verifiers/string/v_string";
export type { VUUIDConditions } from "./src/verifiers/uuid/v_uuid";
export { VNumberNotNull, VNumber } from "./src/verifiers/number/v_number";
export { VStringNotNull, VString } from "./src/verifiers/string/v_string";
export { VBooleanNotNull, VBoolean } from "./src/verifiers/boolean/v_boolean";
export { VObjectNotNull, VObject } from "./src/verifiers/object/v_object";
export { VArrayNotNull, VArray } from "./src/verifiers/array/v_array";
export { VAny } from "./src/verifiers/any/v_any";
export { VDateNotNull, VDate } from "./src/verifiers/date/v_date";
export { VUUIDNotNull, VUUID } from "./src/verifiers/uuid/v_uuid";
export { datetime } from "./src/utils/datetime";

type CallableCtor<T, A extends any[] = any[]> = {
  (...args: A): T;
  new (...args: A): T;
};

function callableCtor<T, A extends any[]>(
  factory: (...args: A) => T,
): CallableCtor<T, A> {
  return function (...args: A): T {
    return factory(...args);
  } as CallableCtor<T, A>;
}

export const Verifiers = {
  Verifier,
  NumberNotNull: callableCtor(
    (cond?: VNumberConditions) => new VNumberNotNull(cond),
  ),
  Number: callableCtor((cond?: VNumberConditions) => new VNumber(cond)),
  StringNotNull: callableCtor(
    (cond?: VStringConditions) => new VStringNotNull(cond),
  ),
  String: callableCtor((cond?: VStringConditions) => new VString(cond)),
  Boolean: callableCtor((cond?: VBooleanConditions) => new VBoolean(cond)),
  BooleanNotNull: callableCtor(
    (cond?: VBooleanConditions) => new VBooleanNotNull(cond),
  ),
  ObjectNotNull: callableCtor(
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditionsNotNull<T>,
    ) => new VObjectNotNull<T>(properties, cond),
  ) as unknown as {
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditionsNotNull<T>,
    ): VObjectNotNull<T>;
    new <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditionsNotNull<T>,
    ): VObjectNotNull<T>;
  },
  Object: callableCtor(
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditions<T>,
    ) => new VObject<T>(properties, cond),
  ) as unknown as {
    <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditions<T>,
    ): VObject<T>;
    new <T extends Record<string, Verifier<any>>>(
      properties: T,
      cond?: VObjectConditions<T>,
    ): VObject<T>;
  },
  Array: callableCtor(
    <T extends Verifier<any>>(verifier: T, cond?: VArrayConditions<T>) =>
      new VArray<T>(verifier, cond),
  ) as unknown as {
    <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArray<T>;
    new <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArray<T>;
  },
  ArrayNotNull: callableCtor(
    <T extends Verifier<any>>(verifier: T, cond?: VArrayConditions<T>) =>
      new VArrayNotNull<T>(verifier, cond),
  ) as unknown as {
    <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArrayNotNull<T>;
    new <T extends Verifier<any>>(
      verifier: T,
      cond?: VArrayConditions<T>,
    ): VArrayNotNull<T>;
  },
  Any: callableCtor((cond?: VAnyConditions) => new VAny(cond)),
  Date: callableCtor((cond?: VDateConditions) => new VDate(cond)),
  DateNotNull: callableCtor((cond?: VDateConditions) => new VDateNotNull(cond)),
  UUIDNotNull: callableCtor((cond?: VUUIDConditions) => new VUUIDNotNull(cond)),
  UUID: callableCtor((cond?: VUUIDConditions) => new VUUID(cond)),
};
