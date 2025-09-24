# structure-verifier 0.0.9

structure-verifier is a typescript library to validate data of "any" type and to ensure that it corresponds to a data type.

## Installation

```bash
    npm install structure-verifier
```

## Example use

```typescript
import { Verifiers as V, VerificationError } from "structure-verifier";
//////////Verificator object creation
const v = new V.Number();
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

### Alternative Import with Verifiers Object

You can also import the `Verifiers` object which contains all available validators:

```typescript
import { Verifiers, VerificationError } from "structure-verifier";

// Available verifiers:
const numberVal = new Verifiers.Number();           // VNumber
const numberNotNullVal = new Verifiers.NumberNotNull(); // VNumberNotNull
const stringVal = new Verifiers.String();           // VString
const stringNotNullVal = new Verifiers.StringNotNull(); // VStringNotNull
const booleanVal = new Verifiers.Boolean();         // VBoolean
const booleanNotNullVal = new Verifiers.BooleanNotNull(); // VBooleanNotNull
const objectVal = new Verifiers.Object({ properties: {} }); // VObject
const objectNotNullVal = new Verifiers.ObjectNotNull({ properties: {} }); // VObjectNotNull
const arrayVal = new Verifiers.Array({ verifier: new Verifiers.Number() }); // VArray
const arrayNotNullVal = new Verifiers.ArrayNotNull({ verifier: new Verifiers.Number() }); // VArrayNotNull
const anyVal = new Verifiers.Any();                 // VAny
const dateVal = new Verifiers.Date();               // VDate
const dateNotNullVal = new Verifiers.DateNotNull(); // VDateNotNull
const uuidVal = new Verifiers.UUID();               // VUUID
const uuidNotNullVal = new Verifiers.UUIDNotNull(); // VUUIDNotNull
```
## Types
In case it is necessary to infer the type of the response, it is achieved by using InferType

```typescript
    import { InferType, Verifiers as V } from "structure-verifier";
    
    const val = new V.Number();
    type valType = InferType<typeof val>;

    function action(data:valType){
        ...
    }
```
## Validations

### Numbers
Validations to numerical data
```typescript
    const numberVal = new V.Number();////return number|null
    const notNullNumberVal = new V.NumberNotNull() ////return number
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
    const numberVal = new V.Number({
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
    const stringVal = new V.String(); // Returns string | null
    const notNullStringVal = new V.StringNotNull(); // Returns string
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
    const stringVal = new V.String({
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
const booleanVal = new V.Boolean(); // Returns boolean | null
const notNullBooleanVal = new V.BooleanNotNull(); // Returns boolean
```

Boolean Exclusive Conditions

*No exclusive conditions for boolean validation*

#### Example
```typescript
const booleanVal = new V.Boolean();
const notNullBooleanVal = new V.BooleanNotNull();

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
const objectVal = new V.Object({ properties: {  name: new V.String({ minLength: 3 })/* properties with validations */ } }); // Returns object {name:""} | null
const notNullObjectVal = new V.ObjectNotNull({ properties: {  name: new V.String({ minLength: 3 })/* properties with validations */ } }); // Returns object {name:""}
```

Object Exclusive Conditions

- **invalidPropertyMessage:** - Custom message for invalid properties.
- **strictMode:** - When `true`, ensures the object has exactly the same properties as defined.
- **ignoreCase:** - When `true`, makes the property names case-insensitive.
- **takeAllValues:** - When `true`, allows taking all values from the input object, not just those defined in the properties.

#### Example
```typescript
const objectVal = new V.Object({
    properties: {
        name: new V.String({ minLength: 3 }),
        age: new V.Number({ min: 18, max: 99 }),
    },
    strictMode: true,
    ignoreCase: true,
    invalidPropertyMessage: {
        message: () => "no es una propiedad valida",
        val: undefined
    }
});

const notNullObjectVal = new V.ObjectNotNull({
    properties: {
        name: new V.StringNotNull({ minLength: 3 }),
        age: new V.NumberNotNull({ min: 18, max: 99 }),
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
const arrayVal = new V.Array({verifier: new V.Number()}); // Returns Array | null
const notNullArrayVal = new V.ArrayNotNull({verifier: new V.Number()}); // Returns Array
```

Array Exclusive Conditions

- **minLength**: Minimum length of the array.
- **maxLength**: Maximum length of the array.

#### Example
```typescript
const arrayVal = new V.Array({ verifier: new V.Number(), minLength: 1, maxLength: 5 });
const notNullArrayVal = new V.ArrayNotNull({ verifier: new V.Number(), minLength: 2 });

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
const anyVal = new V.Any(); // Returns any type
```

VAny Exclusive Conditions

*No exclusive conditions for any validation*

#### Example
```typescript
const anyVal = new V.Any();

try {
    console.log(anyVal.check('true'));  // Output: 'true'
    console.log(anyVal.check('FALSE')); // Output: 'FALSE'
    console.log(anyVal.check(null));    // Output: null
    console.log(anyVal.check('1'));     // Output: '1'
    console.log(anyVal.check(0));       // Output: 0
} catch (error) {
    console.error(error);
}
```
***
### Date 
Validations for date data (depends Moment).

```typescript
    const vdate = new V.Date();
    const vdateNotNull = new V.DateNotNull();
```

VDate Exclusive Conditions

- **format**: Specifies the date format to be validated against.
- **timeZone**: Specifies the expected time zone of the input date.
- **maxDate**: Specifies the maximum allowed date.
- **minDate**: Specifies the minimum allowed date.

#### Example
#### Basic Date Validation

```typescript
const vdate = new V.Date();
console.log(vdate.check("2023-08-09")?.format("YYYY-MM-DD")); // Output: "2023-08-09"
```

#### Date with Specific Format

```typescript
const vdate = new V.Date({ format: "DD/MM/YYYY" });
console.log(vdate.check("09/08/2023")?.format("DD/MM/YYYY")); // Output: "09/08/2023"
```

#### Date with Time Zone

```typescript
const vdate = new V.Date({ timeZone: "America/New_York" });
const result = vdate.check("2023-08-09T10:00:00");
console.log(result.tz("America/New_York").format()); // Output: "2023-08-09T10:00:00-04:00"
```

#### Date within Range

```typescript
const vdate = new VDate({
    minDate: moment("2023-01-01"),
    maxDate: moment("2023-12-31")
});
console.log(vdate.check("2023-08-09").format("YYYY-MM-DD")); // Output: "2023-08-09"
```

***
### UUID 
Validations for UUID (Universally Unique Identifier) data.

```typescript
const uuidVal = new V.UUID(); // Returns string | null
const notNullUuidVal = new V.UUIDNotNull(); // Returns string
```

UUID Exclusive Conditions

- **version**: Specifies the UUID version to validate against (1, 2, 3, 4, or 5). If not specified, accepts any version.
- **allowNoHyphens**: When `true`, allows UUIDs without hyphens. Default is `false`.
- **strictMode**: When `true`, ensures the input value is strictly a string (not coerced from another type).

#### Example

#### Basic UUID Validation

```typescript
const uuidVal = new V.UUID();
console.log(uuidVal.check("550e8400-e29b-41d4-a716-446655440000")); // Output: "550e8400-e29b-41d4-a716-446655440000"
console.log(uuidVal.check(null)); // Output: null
```

#### UUID with Specific Version

```typescript
const uuidV4Val = new V.UUID({ version: 4 });
console.log(uuidV4Val.check("550e8400-e29b-41d4-a716-446655440000")); // Output: "550e8400-e29b-41d4-a716-446655440000"
```

#### UUID without Hyphens

```typescript
const uuidNoHyphensVal = new V.UUID({ allowNoHyphens: true });
console.log(uuidNoHyphensVal.check("550e8400e29b41d4a716446655440000")); // Output: "550e8400-e29b-41d4-a716-446655440000"
```

#### Strict Mode UUID

```typescript
const strictUuidVal = new V.UUIDNotNull({ strictMode: true });
try {
    console.log(strictUuidVal.check("550e8400-e29b-41d4-a716-446655440000")); // Output: "550e8400-e29b-41d4-a716-446655440000"
    console.log(strictUuidVal.check(123)); // Throws VerificationError
} catch (error) {
    console.error(error);
}
```

***
## VerificationError

The `VerificationError` class extends the native JavaScript `Error` object to provide enhanced error handling for validation scenarios. This class is designed to collect and format multiple error messages, making it easier to understand and manage errors in your application.

### Import

To use the `VerificationError` class, import it as follows:

```typescript
import { VerificationError } from "./path/to/your/VerificationError";
```

### Constructor

#### `constructor(messages: messageResp[])`

The constructor takes an array of `messageResp` objects as an argument. Each `messageResp` object represents an individual validation error and has the following structure:

```typescript
interface messageResp {
    key: string;
    message: string;
    parent?: string;
}
```

The constructor will generate a formatted error message by concatenating each `messageResp` into a single string, separating them by a semicolon (`;`). Additionally, it stores the original errors in two formats:

- **`_errors`**: An array of strings, where each string is a formatted error message.
- **`_errorsObj`**: An array of `messageResp` objects.

### Properties

#### `errors: string[]`

This getter returns the array of formatted error messages. Each message is generated based on the `parent`, `key`, and `message` properties of the `messageResp` objects.

#### `errorsObj: messageResp[]`

This getter returns the original array of `messageResp` objects, allowing access to the detailed structure of each validation error.

### Usage Example

```typescript
import { VerificationError } from "../src/error/v_error";

try {
    throw new VerificationError([{ key: "email", message: "is invalid", parent: "contact" }]);
} catch (err) {
    if (err instanceof VerificationError) {
        console.log(err.errors); // [ 'contact.email is invalid' ]
        console.log(err.errorsObj); // Original messageResp objects
    }
}
```