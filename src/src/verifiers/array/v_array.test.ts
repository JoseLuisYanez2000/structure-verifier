import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe("VArray", () => {
  it("should validate arrays with valid data", () => {
    const validator = V.Array(V.NumberNotNull());
    expect(validator.check([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("should throw a validation error for arrays with invalid data", () => {
    const validator = V.Array(V.NumberNotNull());
    expect(() => validator.check([1, "2a", 3])).toThrow(VerificationError);
  });

  it("should return null for null or undefined values", () => {
    const validator = V.Array(V.NumberNotNull());
    expect(validator.check(null)).toBeNull();
  });

  it("should throw a validation error for arrays that do not meet minLength condition", () => {
    const validator = V.Array(V.NumberNotNull(), {
      minLength: 3,
    });
    expect(() => validator.check([1, 2])).toThrow(VerificationError);
  });

  it("should throw a validation error for arrays that exceed maxLength condition", () => {
    const validator = V.Array(V.NumberNotNull(), {
      maxLength: 2,
    });
    expect(() => validator.check([1, 2, 3])).toThrow(VerificationError);
  });

  it("should use custom badTypeMessage for invalid array input", () => {
    const validator = V.Array(V.NumberNotNull(), {
      badTypeMessage: "custom array message",
    });
    expect(() => validator.check("invalid")).toThrow("custom array message");
  });
});

describe("VArrayNotNull", () => {
  it("should validate arrays with valid data", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull());
    expect(validator.check([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("should throw a validation error for arrays with invalid data", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull());
    expect(() => validator.check([1, "2a", 3])).toThrow(VerificationError);
  });

  it("should throw a validation error for null or undefined values", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull());
    expect(() => validator.check(null)).toThrow(VerificationError);
    expect(() => validator.check(undefined)).toThrow(VerificationError);
  });

  it("should throw a validation error for arrays that do not meet minLength condition", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull(), {
      minLength: 3,
    });
    expect(() => validator.check([1, 2])).toThrow(VerificationError);
  });

  it("should throw a validation error for arrays that exceed maxLength condition", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull(), {
      maxLength: 2,
    });
    expect(() => validator.check([1, 2, 3])).toThrow(VerificationError);
  });
});
