import { VAny } from "./src/verifiers/any/v_any";
import { VArray, VArrayNotNull } from "./src/verifiers/array/v_array";
import { VBoolean, VBooleanNotNull } from "./src/verifiers/boolean/v_boolean";
import { VDate, VDateNotNull } from "./src/verifiers/date/v_date";
import { VNumber, VNumberNotNull } from "./src/verifiers/number/v_number";
import { VObject, VObjectNotNull } from "./src/verifiers/object/v_object";
import { VString, VStringNotNull } from "./src/verifiers/string/v_string";
import { Verifier } from './src/verifiers/verifier';



export const Verifiers = {
    Verifier,
    VNumberNotNull,
    VNumber,
    VStringNotNull,
    VString,
    VBoolean,
    VBooleanNotNull,
    VObjectNotNull,
    VObject,
    VArray,
    VArrayNotNull,
    VAny,
    VDate,
    VDateNotNull
}
