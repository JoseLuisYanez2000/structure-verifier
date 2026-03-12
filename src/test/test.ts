import { VerificationError } from "../src/error/v_error";
import { VerifierConfig } from "../src/config/verifierConfig";
import { Verifiers as V } from "../index";

VerifierConfig.lang = "es";

try {
  const verifier = V.Object({
    email: V.String()
      .required()
      .transform((value) => Number(value)),
  })
    .required()
    .transform((value) => ({
      email: value.email,
      email2: value.email,
    }));

  const a = verifier.check({
    email: "trdt@",
  });
  console.log(a);
} catch (err) {
  if (err instanceof VerificationError) {
    console.log(err.errors);
    // console.log(err.errorsObj);
  }
}
