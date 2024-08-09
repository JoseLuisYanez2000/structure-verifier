import { Validators as V } from "..";
import { InferType } from "../src/validators/type";

const val = new V.VObjectNotNull({
    properties: {
        name: new V.VStringNotNull(),
        age: new V.VNumberNotNull(),
    }
})


let data = val.validate({ name: "John", age: 20 })


console.log(data) 