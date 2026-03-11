import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe("VAny", () => {
  it("should validate data as any", () => {
    const validator = V.Any();
    expect(validator.check([1, 2, 3])).toEqual([1, 2, 3]);
    expect(validator.check(null)).toBeNull();
    expect(validator.check(1)).toEqual(1);
    expect(validator.check("TEST")).toEqual("TEST");
  });

  it("should apply defaultValue when data is null or undefined", () => {
    const validator = V.Any({ defaultValue: { ok: true } });
    expect(validator.check(null)).toEqual({ ok: true });
    expect(validator.check(undefined)).toEqual({ ok: true });
  });

  it("should enforce isRequired when configured", () => {
    const validator = V.Any({ isRequired: true });
    expect(() => validator.check(null)).toThrow(VerificationError);
  });
});
