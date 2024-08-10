import { Verifiers as V } from "..";

const validator = new V.VAny();
console.log(validator.check(undefined));

const anyVal = new V.VAny();

try {
    console.log(anyVal.check('true'));  // Output: true
    console.log(anyVal.check('FALSE')); // Output: false
    console.log(anyVal.check(null));    // Output: null
    console.log(anyVal.check('1'));   // Output: true
    console.log(anyVal.check(0));     // Output: false
} catch (error) {
    console.error(error);
}