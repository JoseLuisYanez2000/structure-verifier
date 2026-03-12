import { VerificationError } from "../src/error/v_error";
import { VerifierConfig } from "../src/config/verifierConfig";
import { Verifiers as V } from "../index";

VerifierConfig.lang = "es";

try {
  const verifier = V.Object({
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
