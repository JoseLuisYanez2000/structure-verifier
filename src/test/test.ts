import { Verifiers as V } from "..";


const objectVal = new V.VObject({
    properties: {
        name: new V.VString({ minLength: 3 }),
        age: new V.VNumber({ min: 18, max: 99 }),
    },
    strictMode: true,
    ignoreCase: true,
    invalidPropertyMessage: {
        message: () => "no es una propiedad valida",
        val: undefined
    }
});

const notNullObjectVal = new V.VObjectNotNull({
    properties: {
        name: new V.VStringNotNull({ minLength: 3 }),
        age: new V.VNumberNotNull({ min: 18, max: 99 }),
    },
    strictMode: true,
    ignoreCase: true,
    invalidPropertyMessage: {
        message: () => "invalid property",
        val: undefined
    }
});

try {
    console.log(objectVal.check({ name: 'John', ages: 25 }));  // Output: { name: 'John', age: 25 }
    console.log(objectVal.check(null));                      // Output: null
    console.log(notNullObjectVal.check({ name: 'Jane', age: 30 }));   // Output: { name: 'Jane', age: 30 }
} catch (error) {
    console.error(error);
}