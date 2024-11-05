import { VerificationError } from "../src/error/v_error";
import { Verifiers as V } from "../index";
try {
    const VVal = new V.VObjectNotNull({
        properties: {
            body: new V.VArrayNotNull({
                verifier: new V.VObjectNotNull({
                    properties: {
                        nombre: new V.VStringNotNull({}),
                        edad: new V.VNumberNotNull({}),
                        contactos: new V.VArrayNotNull({

                            verifier: new V.VObjectNotNull({
                                properties: {
                                    email: new V.VStringNotNull({}),
                                    telefono: new V.VStringNotNull({})
                                }
                            })


                        })
                    }
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