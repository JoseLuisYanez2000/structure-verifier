import { Verifiers as V } from "..";
import { VerificationError } from "../src/error/v_error";
import { VNumber, VNumberNotNull } from "../src/verifiers/number/v_number";
import { VArrayNotNull } from '../src/verifiers/array/v_array';
import { VObjectNotNull } from "../src/verifiers/object/v_object";

const arrayVal = new V.VArray({ verifier: new V.VNumber() }); // Returns Array | null
const notNullArrayVal = new V.VArrayNotNull({ verifier: new V.VNumber() }); // Returns Array

const myArrayVerifier = new V.VArray({
    verifier: new VObjectNotNull({
        properties: {
            name: new V.VStringNotNull({ minLength: 1, maxLength: 5 }),
            age: new VNumberNotNull({ min: 18, max: 100 }),
        }
    }),
    minLength: 2,
    maxLength: 5,
});

try {
    const result = myArrayVerifier.check([{
        name: "John",
        age: 25
    }, {
        name: "Jane",
        age: 30
    }]);

    console.log(result);
    // for (const r of result) {
    //     console.log(`${r.name} is ${r.age} years old`);
    // }

} catch (error) {
    if (error instanceof VerificationError) {
        console.error("Errores de validación:", error.errorsObj);
    }
}