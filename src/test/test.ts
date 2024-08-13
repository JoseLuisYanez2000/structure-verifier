import { Verifiers as V } from "..";
import { VerificationError } from "../src/error/v_error";

const objectVal = new V.VObject({
    properties: {
        name: new V.VStringNotNull({ minLength: 3 }),
        age: new V.VNumberNotNull({ min: 18, max: 99 }),
    },
    strictMode: true,
    ignoreCase: true,
    conds: (value) => {
        if (value) {
            if (value.age > 18 && value.name === 'John') {
                throw new VerificationError([{
                    key: "",
                    message: "John no puede tener más de 18 años"
                }])
            }

        }
    }
});

const data = {
    name: 'John',
    age: 20
}

objectVal.check(data);