import { VAny } from "./src/verifiers/any/v_any";
import { VArray, VArrayNotNull } from "./src/verifiers/array/v_array";
import { VBoolean, VBooleanNotNull } from "./src/verifiers/boolean/v_boolean";
import { VDate, VDateNotNull } from "./src/verifiers/date/v_date";
import { VNumber, VNumberNotNull } from "./src/verifiers/number/v_number";
import { VObject, VObjectNotNull } from "./src/verifiers/object/v_object";
import { VString, VStringNotNull } from "./src/verifiers/string/v_string";
import { VUUID, VUUIDNotNull } from "./src/verifiers/uuid/v_uuid";
import { Verifier } from './src/verifiers/verifier';

export { VerificationError } from "./src/error/v_error";

export { InferType } from "./src/verifiers/type";

export { Verifier } from './src/verifiers/verifier';
export { VNumberNotNull, VNumber } from "./src/verifiers/number/v_number";
export { VStringNotNull, VString } from "./src/verifiers/string/v_string";
export { VBooleanNotNull, VBoolean } from "./src/verifiers/boolean/v_boolean";
export { VObjectNotNull, VObject } from "./src/verifiers/object/v_object";
export { VArrayNotNull, VArray } from "./src/verifiers/array/v_array";
export { VAny } from "./src/verifiers/any/v_any";
export { VDateNotNull, VDate } from "./src/verifiers/date/v_date";
export { VUUIDNotNull, VUUID } from "./src/verifiers/uuid/v_uuid";


export const Verifiers = {
    Verifier,
    NumberNotNull: VNumberNotNull,
    Number: VNumber,
    StringNotNull: VStringNotNull,
    String: VString,
    Boolean: VBoolean,
    BooleanNotNull: VBooleanNotNull,
    ObjectNotNull: VObjectNotNull,
    Object: VObject,
    Array: VArray,
    ArrayNotNull: VArrayNotNull,
    Any: VAny,
    Date: VDate,
    DateNotNull: VDateNotNull,
    UUIDNotNull: VUUIDNotNull,
    UUID: VUUID
}
