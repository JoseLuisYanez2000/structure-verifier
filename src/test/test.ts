import { VerificationError } from "../src/error/v_error";
import { VerifierConfig } from "../src/config/verifierConfig";
import { Verifiers as V } from "../index";

VerifierConfig.lang = "es";

try {
  const VVal = V.ObjectNotNull({
    properties: {
      body: V.ArrayNotNull({
        verifier: V.ObjectNotNull({
          properties: {
            id: V.UUIDNotNull({ allowNoHyphens: false }),
            nombre: V.StringNotNull({}),
            edad: V.NumberNotNull({ emptyAsNull: true }),
            contactos: V.ArrayNotNull({
              verifier: V.ObjectNotNull({
                properties: {
                  email: V.StringNotNull({ emptyAsNull: true }),
                  telefono: V.StringNotNull({}),
                },
              }),
            }),
          },
        }),
      }),
    },
  });

  console.log(
    JSON.stringify(
      VVal.check({
        body: [
          {
            id: "550e8400e29b41d4a716446655440000",
            nombre: "Juan",
            edad: "30",
            contactos: [
              {
                email: "test",
                telefono: "123456789",
              },
              {
                email: "test",
                telefono: "123456789",
              },
            ],
          },
        ],
      }),
      null,
      2,
    ),
  ); // ["1", "2", "3"]
} catch (err) {
  if (err instanceof VerificationError) {
    console.log(err.errors); // [ 'contact.email is invalid' ]
    // console.log(err.errorsObj); // Original messageResp objects
  }
}
