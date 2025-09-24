import { VerificationError } from "../src/error/v_error";
import { Verifiers as V } from "../index";
import { VerifierConfig } from "../src/config/verifierConfig";

VerifierConfig.lang = 'es';

try {
    const VVal = new V.ObjectNotNull({
        properties: {
            body: new V.ArrayNotNull({
                verifier: new V.ObjectNotNull({
                    properties: {
                        id: new V.UUIDNotNull({ allowNoHyphens: false }),
                        nombre: new V.StringNotNull({}),
                        edad: new V.NumberNotNull({ emptyAsNull: true }),
                        contactos: new V.ArrayNotNull({

                            verifier: new V.ObjectNotNull({
                                properties: {
                                    email: new V.StringNotNull({ emptyAsNull: true }),
                                    telefono: new V.StringNotNull({}),
                                }
                            })
                        })
                    },
                }),
            })
        }
    })

    console.log(
        JSON.stringify(
            VVal.check(
                {
                    body: [{
                        id: "550e8400e29b41d4a716446655440000",
                        nombre: "Juan",
                        edad: "30",
                        contactos: [{
                            email: "test",
                            telefono: "123456789"
                        },
                        {
                            email: "test",
                            telefono: "123456789"
                        }
                        ]

                    }]
                }
            ), null, 2)); // ["1", "2", "3"]

} catch (err) {
    if (err instanceof VerificationError) {
        console.log(err.errors); // [ 'contact.email is invalid' ]
        // console.log(err.errorsObj); // Original messageResp objects
    }
}