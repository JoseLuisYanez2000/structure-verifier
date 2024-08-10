import { Verifiers as V } from "..";

const validator = new V.VAny();
console.log(validator.check(undefined));