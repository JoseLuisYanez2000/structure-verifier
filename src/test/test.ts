import { VerificationError } from "../src/error/v_error";
import { Verifiers as V } from "../index";
try {
    const VVal = new V.ObjectNotNull({
        properties: {
            body: new V.ArrayNotNull({
                verifier: new V.ObjectNotNull({
                    properties: {
                        nombre: new V.StringNotNull({}),
                        edad: new V.NumberNotNull({}),
                        contactos: new V.ArrayNotNull({

                            verifier: new V.ObjectNotNull({
                                properties: {
                                    email: new V.StringNotNull({}),
                                    telefono: new V.StringNotNull({})
                                }
                            })
                        })
                    },
                }),
            })
        }
    })

    console.log(VVal.check(
        {
            body: [{
                // nombre: "Juan",
                edad: 20,
                contactos: [{
                    verifier: {
                        email: "",
                    }
                },
                {
                    verifier: {
                        email: "",
                    }
                }]

            }]
        }
    )); // ["1", "2", "3"]

} catch (err) {
    if (err instanceof VerificationError) {
        console.log(err.errors); // [ 'contact.email is invalid' ]
        // console.log(err.errorsObj); // Original messageResp objects
    }
}