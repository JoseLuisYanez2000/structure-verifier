import { Verifiers as V } from "../../index";
import { VerificationError } from "../error/v_error";

describe("Verifier.transform", () => {
  it("should transform validated values", () => {
    const validator = V.StringNotNull().transform((value) =>
      value.toUpperCase(),
    );
    expect(validator.check("abc")).toBe("ABC");
  });

  it("should preserve existing validation logic before transforming", () => {
    const validator = V.Number({ min: 10 })
      .required()
      .transform((value) => value * 2);
    expect(() => validator.check(5)).toThrow(VerificationError);
    expect(validator.check(10)).toBe(20);
  });

  it("should work with required chain without changing required behavior", () => {
    const validator = V.String({ minLength: 2 })
      .required()
      .transform((value) => value.trim());

    expect(() => validator.check(null)).toThrow(VerificationError);
    expect(validator.check("  ok  ")).toBe("ok");
  });

  it("should allow nullable transforms when mapper handles null", () => {
    const validator = V.String().transform((value) =>
      value === null ? null : value.trim(),
    );

    expect(validator.check(null)).toBeNull();
    expect(validator.check("  test  ")).toBe("test");
  });

  it("should trim strings with trim helper", () => {
    const validator = V.String().trim();
    expect(validator.check("  hello  ")).toBe("hello");
    expect(validator.check(null)).toBeNull();
  });

  it("should transform to lower case with toLowerCase helper", () => {
    const validator = V.StringNotNull().toLowerCase();
    expect(validator.check("HeLLo")).toBe("hello");
  });

  it("should transform to upper case with toUpperCase helper", () => {
    const validator = V.String().required().toUpperCase();
    expect(validator.check("HeLLo")).toBe("HELLO");
  });
});
