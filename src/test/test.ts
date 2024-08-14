import { VerificationError } from "../src/error/v_error";

try {
    throw new VerificationError([{ key: "email", message: "is invalid", parent: "contact" }]);
} catch (err) {
    if (err instanceof VerificationError) {
        console.log(err.errors); // [ 'contact.email is invalid' ]
        console.log(err.errorsObj); // Original messageResp objects
    }
}