import { Verifiers as V } from "../../index";
import { VerificationError } from "../error/v_error";

describe("Verifier.safeCheck", () => {
  it("returns success with the verified value", () => {
    const result = V.NumberNotNull().min(0).safeCheck("42");

    expect(result).toEqual({ success: true, value: 42 });
  });

  it("returns the VerificationError without throwing", () => {
    const result = V.StringNotNull({ minLength: 3 }).safeCheck("ab");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(VerificationError);
      expect(result.error.errors.length).toBeGreaterThan(0);
    }
  });

  it("keeps error keys for nested structures", () => {
    const verifier = V.ObjectNotNull({
      tags: V.ArrayNotNull(V.StringNotNull({ strictMode: true })),
    });

    const result = verifier.safeCheck({ tags: ["ok", 5] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errorsObj.some((e) => e.key === "tags.[1]")).toBe(
        true,
      );
    }
  });

  it("rethrows errors that are not VerificationError", () => {
    const verifier = V.StringNotNull().transform(() => {
      throw new TypeError("boom");
    });

    expect(() => verifier.safeCheck("hola")).toThrow(TypeError);
  });
});
