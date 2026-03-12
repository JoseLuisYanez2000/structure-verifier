import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe("VNumber", () => {
  it("should validate a number correctly", () => {
    const validator = V.Number();
    expect(validator.check(123)).toBe(123);
    expect(validator.check(null)).toBeNull();
  });

  it("should throw a validation error for min", () => {
    const validator = V.Number({ min: 10 });
    expect(() => validator.check(5)).toThrow(VerificationError);
    expect(validator.check(10)).toBe(10);
  });

  it("should throw a validation error for max", () => {
    const validator = V.Number({ max: 10 });
    expect(() => validator.check(15)).toThrow(VerificationError);
    expect(validator.check(5)).toBe(5);
  });

  it("should throw a validation error for in", () => {
    const validator = V.Number({ in: [1, 2, 3] });
    expect(() => validator.check(4)).toThrow(VerificationError);
    expect(validator.check(2)).toBe(2);
  });

  it("should throw a validation error for notIn", () => {
    const validator = V.Number({ notIn: [1, 2, 3] });
    expect(() => validator.check(2)).toThrow(VerificationError);
    expect(validator.check(4)).toBe(4);
  });

  it("should throw a validation error for maxDecimalPlaces", () => {
    const validator = V.Number({ maxDecimalPlaces: 2 });
    expect(() => validator.check(1.234)).toThrow(VerificationError);
    expect(validator.check(1.23)).toBe(1.23);
  });

  it("should throw a validation error for minDecimalPlaces", () => {
    const validator = V.Number({ minDecimalPlaces: 2 });
    expect(() => validator.check(1.2)).toThrow(VerificationError);
    expect(validator.check(1.23)).toBe(1.23);
  });

  it("should throw a validation error for invalid type", () => {
    const validator = V.Number();
    expect(() => validator.check("string")).toThrow(VerificationError);
  });

  it("should validate numeric strings against in and notIn constraints", () => {
    expect(V.Number({ in: [2, 3] }).check("2")).toBe(2);
    expect(() => V.Number({ notIn: [2, 3] }).check("2")).toThrow(
      VerificationError,
    );
  });

  it("should support fluent condition methods", () => {
    const validator = V.Number()
      .min(2)
      .max(3)
      .in([2.5, 3])
      .notIn([2])
      .minDecimalPlaces(1)
      .maxDecimalPlaces(2);

    expect(validator.check(2.5)).toBe(2.5);
    expect(() => validator.check(1.5)).toThrow(VerificationError);
  });

  it("should use custom fluent message for min", () => {
    const validator = V.Number().min(5, {
      val: 5,
      message: () => "too small",
    });
    expect(() => validator.check(4)).toThrow("too small");
  });

  it("should support custom messages for all fluent number conditions", () => {
    expect(() => V.Number().max(2, "max 2").check(3)).toThrow("max 2");
    expect(() =>
      V.Number()
        .in([1, 2], (v) => `permitidos ${v.in.join(",")}`)
        .check(3),
    ).toThrow("permitidos 1,2");
    expect(() => V.Number().notIn([1], "1 bloqueado").check(1)).toThrow(
      "1 bloqueado",
    );
    expect(() =>
      V.Number()
        .maxDecimalPlaces(2, (v) => `max ${v.maxDecimalPlaces} decimales`)
        .check(1.234),
    ).toThrow("max 2 decimales");
    expect(() =>
      V.Number().minDecimalPlaces(2, "min 2 decimales").check(1.2),
    ).toThrow("min 2 decimales");
  });
});

describe("VNumberNotNull", () => {
  it("should validate a non-null number correctly", () => {
    const validator = V.NumberNotNull();
    expect(validator.check(123)).toBe(123);
  });

  it("should throw a validation error for null or undefined", () => {
    const validator = V.NumberNotNull();
    expect(() => validator.check(null)).toThrow(VerificationError);
    expect(() => validator.check(undefined)).toThrow(VerificationError);
  });

  it("should throw a validation error for min", () => {
    const validator = V.NumberNotNull({ min: 10 });
    expect(() => validator.check(5)).toThrow(VerificationError);
    expect(validator.check(10)).toBe(10);
  });

  it("should throw a validation error for max", () => {
    const validator = V.NumberNotNull({ max: 10 });
    expect(() => validator.check(15)).toThrow(VerificationError);
    expect(validator.check(5)).toBe(5);
  });

  it("should throw a validation error for in", () => {
    const validator = V.NumberNotNull({ in: [1, 2, 3] });
    expect(() => validator.check(4)).toThrow(VerificationError);
    expect(validator.check(2)).toBe(2);
  });

  it("should throw a validation error for notIn", () => {
    const validator = V.NumberNotNull({ notIn: [1, 2, 3] });
    expect(() => validator.check(2)).toThrow(VerificationError);
    expect(validator.check(4)).toBe(4);
  });

  it("should throw a validation error for maxDecimalPlaces", () => {
    const validator = V.NumberNotNull({ maxDecimalPlaces: 2 });
    expect(() => validator.check(1.234)).toThrow(VerificationError);
    expect(validator.check(1.23)).toBe(1.23);
  });

  it("should throw a validation error for minDecimalPlaces", () => {
    const validator = V.NumberNotNull({ minDecimalPlaces: 2 });
    expect(() => validator.check(1.2)).toThrow(VerificationError);
    expect(validator.check(1.23)).toBe(1.23);
  });

  it("should throw a validation error for invalid type", () => {
    const validator = V.NumberNotNull();
    expect(() => validator.check("string")).toThrow(VerificationError);
  });

  it("should support fluent condition methods", () => {
    const validator = V.NumberNotNull()
      .min(2)
      .max(3)
      .in([2.5, 3])
      .notIn([2])
      .minDecimalPlaces(1)
      .maxDecimalPlaces(2);

    expect(validator.check(2.5)).toBe(2.5);
    expect(() => validator.check(1.5)).toThrow(VerificationError);
  });
});
