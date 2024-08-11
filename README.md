# structure-verifier 0.0.5

structure-verifier is a typescrpt library to validate data of "any" type and to ensure that it corresponds to a data type.

## Installation

```bash
    npm install structure-verifier
```

## Example use

```typescript
import { Verifiers as V,VerificationError } from "structure-verifier";
//////////Verificator object creation
const v = new V.VNumber();
/////////Running validations

try {
    let value = v.check(10);
    /////////Will get the value without error
} catch (error:any) {
    console.log(error as VerificationError);
}

try {
    let value = v.check('TEST');
} catch (error:any) {
    ///////////Will get the error, because the value is not a number
    console.log(error as VerificationError);
}
```
## Types
In case it is necessary to infer the type of the response, it is achieved by using InferType

```typescript
    import { InferType } from "structure-verifier";
    
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
    /////Validate a number or null that meets all conditions otherwise error (VerificationError)
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
    ///// Validate a string or null that meets all conditions otherwise error (VerificationError)
```
***
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
    console.log(booleanVal.check('true'));  // Output: true
    console.log(booleanVal.check('FALSE')); // Output: false
    console.log(booleanVal.check(null));    // Output: null
    console.log(notNullBooleanVal.check('1'));   // Output: true
    console.log(notNullBooleanVal.check(0));     // Output: false
} catch (error) {
    console.error(error);
}
```
***
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
        message: () => "no es una propiedad valida",
        val: undefined
    }
});

try {
    console.log(objectVal.check({ name: 'John', age: 25 }));  // Output: { name: 'John', age: 25 }
    console.log(objectVal.check(null));                      // Output: null
    console.log(notNullObjectVal.check({ name: 'Jane', age: 30 }));   // Output: { name: 'Jane', age: 30 }
} catch (error) {
    console.error(error);
}
```
***
### Arrays
Validations for array data.

```typescript
const arrayVal = new V.VArray({verifier:new V.VNumber()}); // Returns Array | null
const notNullArrayVal = new V.VArrayNotNull({verifier:new V.VNumber()}); // Returns Array
```

Array Exclusive Conditions

- **minLength**: Minimum length of the array.
- **maxLength**: Maximum length of the array.

#### Example
```typescript
const arrayVal = new V.VArray(new V.VNumber(), { minLength: 1, maxLength: 5 });
const notNullArrayVal = new V.VArrayNotNull(new V.VNumber(), { minLength: 2 });

try {
    console.log(arrayVal.check([1, 2, 3]));  // Output: [1, 2, 3]
    console.log(arrayVal.check([]));         // Throws VerificationError (array too short)
    console.log(arrayVal.check(null));       // Output: null
    console.log(notNullArrayVal.check([1, 2]));   // Output: [1, 2]
    console.log(notNullArrayVal.check([1]));      // Throws VerificationError (array too short)
} catch (error) {
    console.error(error);
}
```
***
### Any 
Validations for any data.

```typescript
const anyVal = new V.VAny(); // Returns any type
```

VAny Exclusive Conditions

*No exclusive conditions for any validation*

#### Example
```typescript
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
```
***
### Date 
Validations for date data (depends Moment).

```typescript
    const vdate = new V.VDate();
    const vdateNotNull = new V.VDateNotNull();
```

VDate Exclusive Conditions

- **format**: Specifies the date format to be validated against.
- **timeZone**: Specifies the expected time zone of the input date.
- **maxDate**: Specifies the maximum allowed date.
- **minDate**: Specifies the minimum allowed date.

#### Example
#### Basic Date Validation

```typescript
const vdate = new V.VDate();
console.log(vdate.check("2023-08-09")?.format("YYYY-MM-DD")); // Output: "2023-08-09"
```

#### Date with Specific Format

```typescript
const vdate = new V.VDate({ format: "DD/MM/YYYY" });
console.log(vdate.check("09/08/2023")?.format("DD/MM/YYYY")); // Output: "09/08/2023"
```

#### Date with Time Zone

```typescript
const vdate = new V.VDate({ timeZone: "America/New_York" });
const result = vdate.check("2023-08-09T10:00:00");
console.log(result.tz("America/New_York").format()); // Output: "2023-08-09T10:00:00-04:00"
```

#### Date within Range

```typescript
const vdate = new V.VDate({
    minDate: moment("2023-01-01"),
    maxDate: moment("2023-12-31")
});
console.log(vdate.check("2023-08-09").format("YYYY-MM-DD")); // Output: "2023-08-09"
```