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

  it("should support fluent minLength and maxLength methods", () => {
    const validator = V.Array(V.NumberNotNull()).minLength(2).maxLength(3);
    expect(validator.check([1, 2])).toEqual([1, 2]);
    expect(() => validator.check([1])).toThrow(VerificationError);
    expect(() => validator.check([1, 2, 3, 4])).toThrow(VerificationError);
  });

  it("should support fluent minLength string message", () => {
    const validator = V.Array(V.NumberNotNull()).minLength(
      3,
      "Debe tener al menos 3 elementos",
    );
    expect(() => validator.check([1, 2])).toThrow(
      "Debe tener al menos 3 elementos",
    );
  });

  it("should support fluent maxLength callback message", () => {
    const validator = V.Array(V.NumberNotNull()).maxLength(
      2,
      (v) => `maximo permitido ${v.maxLength}`,
    );
    expect(() => validator.check([1, 2, 3])).toThrow("maximo permitido 2");
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

  it("should support fluent minLength and maxLength methods", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull())
      .minLength(2)
      .maxLength(3);
    expect(validator.check([1, 2])).toEqual([1, 2]);
    expect(() => validator.check([1])).toThrow(VerificationError);
    expect(() => validator.check([1, 2, 3, 4])).toThrow(VerificationError);
  });

  it("should support fluent minLength string message", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull()).minLength(
      3,
      "Debe tener al menos 3 elementos",
    );
    expect(() => validator.check([1, 2])).toThrow(
      "Debe tener al menos 3 elementos",
    );
  });

  it("should support fluent maxLength callback message", () => {
    const validator = V.ArrayNotNull(V.NumberNotNull()).maxLength(
      2,
      (v) => `maximo permitido ${v.maxLength}`,
    );
    expect(() => validator.check([1, 2, 3])).toThrow("maximo permitido 2");
  });
});
