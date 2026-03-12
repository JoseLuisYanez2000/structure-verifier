import { VerificationError } from "../src/error/v_error";
import { VerifierConfig } from "../src/config/verifierConfig";
import { Verifiers as V } from "../index";

VerifierConfig.lang = "es";

try {
  const userVerifier = V.ObjectNotNull(
    {
      id: V.UUID({ version: 4 }).required(),
      name: V.StringNotNull({ minLength: 2 }).trim(),
      age: V.Number({ min: 0 }),
      active: V.BooleanNotNull(),
      tags: V.ArrayNotNull(V.StringNotNull(), { minLength: 1 }),
    },
    {
      strictMode: true,
    },
  );

  const b = userVerifier.check({
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "John Doe",
    age: 30,
    active: true,
    tags: ["admin", "user"],
  });
  console.log(b);

  const verifier = V.Object({
    id: V.UUID({ version: 4 }).required(),
    scopes: V.Array(V.String().required())
      .required()
      .minLength(1, (v) => `debe tener al menos ${v.minLength} elementos`),
    email: V.String()
      .required()
      .minLength(5, `el email debe tener al menos 10 caracteres`),
    age: V.Number({})
      .required()
      .min(18, (v) => `la edad debe ser al menos ${v.min}`),
    //.transform((value) => Number(value)),
  })
    .required()
    .transform((value) => {
      if (value.email === "trdt@") {
        throw new VerificationError([
          {
            message: "email no puede ser trdt@",
          },
        ]);
      }
      return value;
    });
  // .transform((value) => ({
  //   email: value.email,
  //   email2: value.email,
  // }));

  const a = verifier.check({
    email: "trdt@",
    age: 20,
    scopes: ["admin", "user"],
  });
  console.log(a);
} catch (err) {
  if (err instanceof VerificationError) {
    console.log(err.errors);
    // console.log(err.errorsObj);
  }
}
