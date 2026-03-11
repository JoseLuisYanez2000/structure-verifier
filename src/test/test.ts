import { VerificationError } from "../src/error/v_error";
import { VerifierConfig } from "../src/config/verifierConfig";
import { Verifiers as V } from "../index";

VerifierConfig.lang = "es";

try {
  const VVal = V.ObjectNotNull(
    {
      body: V.ArrayNotNull({
        verifier: V.ObjectNotNull({
          id: V.UUIDNotNull({ allowNoHyphens: false }),
          nombre: V.StringNotNull({}),
          edad: V.NumberNotNull({ emptyAsNull: true }),
          contactos: V.ArrayNotNull({
            verifier: V.ObjectNotNull({
              email: V.StringNotNull({ emptyAsNull: true }),
              telefono: V.StringNotNull({}),
            }),
          }),
        }),
      }),
    },
    {
      ignoreCase: true,
      conds: (d) => {
        if (d.body.length === 1) {
          throw new VerificationError([
            {
              message: `No se permiten arrays de longitud 1 para body`,
            },
          ]);
        }
      },
    },
  );

  console.log(
    JSON.stringify(
      VVal.check({
        Body: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
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
  );
} catch (err) {
  if (err instanceof VerificationError) {
    console.log(err.errors);
    // console.log(err.errorsObj);
  }
}
