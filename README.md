# Structure Validator# structValidator 0.0.1

structValidator is a typescrpt library to validate data of "any" type and to ensure that it corresponds to a data type.

## Installation

```bash
    npm install structValidator
```

## Example use

```typescript
import { Validators as V,ValidationError } from "structValidator";
//////////Validator object creation
const v = new V.VNumber();
/////////Running validations

try {
    let value = v.validate(10);
    /////////Will get the value without error
} catch (error:any) {
    console.log(error as ValidationError);
}

try {
    let value = v.validate('TEST');
} catch (error:any) {
    ///////////Will get the error, because the value is not a number
    console.log(error as ValidationError);
}
```
## Types
In case it is necessary to infer the type of the response, it is achieved by using InferType

```typescript
    import { InferType } from "structValidator";
    
    const val = new V.VNumber();
    type valType = InferType<typeof val>;

    function action(data:valType){
        ...
    }
```
## Validations

### Numbers
Validations to numerical data
```typescript
    const numberVal = new V.VNumber();////return number|null
    const notNullNumberVal = new V.VNumberNotNull() ////return number
```
Number exclusive conditions

- **min:** - Used to denote the smallest valid number.
- **max:** - Used to denote the biggest valid number.
- **in:** - Used to denote an array of valid numbers that the value must be one of. 
- **notIn:** - Used to denote an array of numbers that the value must not be one of.
- **maxDecimalPlaces:** - Used to denote the maximum number of decimal places allowed.
- **minDecimalPlaces:** - Used to denote the minimum number of decimal places required.

#### Example
```typescript
    const numberVal = new V.VNumber({
        min:10,
        max:20,
        in: [15,16,17],
        notIn: [18,19,20],
        maxDecimalPlaces: 0,
        minDecimalPlaces: 0
    });
    /////Validate a number or null that meets all conditions otherwise error (ValidationError)
```
***
### Strings 
Validations for string data.

```typescript
    const stringVal = new V.VString(); // Returns string | null
    const notNullStringVal = new V.VStringNotNull(); // Returns string
```
String Exclusive Conditions
- **minLength:** - Specifies the minimum length the string must have.
- **maxLength:** - Specifies the maximum length the string can have.
- **regex:** - Specifies a regular expression pattern the string must match.
- **notRegex:** - Specifies a regular expression pattern the string must not match.
- **in:** - Specifies an array of valid string values; the string must be one of these values.
- **notIn:** - Specifies an array of string values that the string must not be one of.
- **strictMode:** - When true, ensures the value is strictly a string (not coerced from another type).
- **ignoreCase:** - When true, makes the in condition case-insensitive.

#### Example
```typescript
    const stringVal = new V.VString({
        minLength: 5,
        maxLength: 10,
        regex: /^[a-zA-Z]+$/,
        notRegex: /[^a-zA-Z]/,
        in: ['apple', 'banana', 'cherry'],
        notIn: ['date', 'fig', 'grape'],
        strictMode: true,
        ignoreCase: true
    });
    ///// Validate a string or null that meets all conditions otherwise error (ValidationError)
```

### Booleans 
Validations for boolean data.

```typescript
const booleanVal = new V.VBoolean(); // Returns boolean | null
const notNullBooleanVal = new V.VBooleanNotNull(); // Returns boolean
```

Boolean Exclusive Conditions

*No exclusive conditions for boolean validation*

#### Example
```typescript
const booleanVal = new V.VBoolean();
const notNullBooleanVal = new V.VBooleanNotNull();

try {
    console.log(booleanVal.validate('true'));  // Output: true
    console.log(booleanVal.validate('FALSE')); // Output: false
    console.log(booleanVal.validate(null));    // Output: null
    console.log(notNullBooleanVal.validate('1'));   // Output: true
    console.log(notNullBooleanVal.validate(0));     // Output: false
} catch (error) {
    console.error(error);
}
```

### Objects 
Validations for object data.

```typescript
const objectVal = new V.VObject({ properties: {  name: new V.VString({ minLength: 3 })/* properties with validations */ } }); // Returns object {name:""} | null
const notNullObjectVal = new V.VObjectNotNull({ properties: {  name: new V.VString({ minLength: 3 })/* properties with validations */ } }); // Returns object {name:""}
```

Object Exclusive Conditions

- **invalidPropertyMessage:** - Custom message for invalid properties.
- **strictMode:** - When `true`, ensures the object has exactly the same properties as defined.
- **ignoreCase:** - When `true`, makes the property names case-insensitive.
- **takeAllValues:** - When `true`, allows taking all values from the input object, not just those defined in the properties.

#### Example
```typescript
const objectVal = new V.VObject({
    properties: {
        name: new V.VString({ minLength: 3 }),
        age: new V.VNumber({ min: 18, max: 99 }),
    },
    strictMode: true,
    ignoreCase: true,
    invalidPropertyMessage: {
        es: () => "propiedad no válida",
        en: () => "invalid property"
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
        es: () => "propiedad no válida",
        en: () => "invalid property"
    }
});

try {
    console.log(objectVal.validate({ name: 'John', age: 25 }));  // Output: { name: 'John', age: 25 }
    console.log(objectVal.validate(null));                      // Output: null
    console.log(notNullObjectVal.validate({ name: 'Jane', age: 30 }));   // Output: { name: 'Jane', age: 30 }
} catch (error) {
    console.error(error);
}
```
