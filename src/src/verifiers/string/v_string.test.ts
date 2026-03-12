import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe("VString", () => {
  it("should validate a string correctly", () => {
    const validator = V.String();
    expect(validator.check("valid string")).toBe("valid string");
    expect(validator.check(null)).toBeNull();
  });

  it("should throw a validation error for minLength", () => {
    const validator = V.String({ minLength: 5 });
    expect(() => validator.check("abc")).toThrow(VerificationError);
    expect(validator.check("abcde")).toBe("abcde");
  });

  it("should throw a validation error for maxLength", () => {
    const validator = V.String({ maxLength: 5 });
    expect(() => validator.check("abcdef")).toThrow(VerificationError);
    expect(validator.check("abc")).toBe("abc");
  });

  it("should throw a validation error for regex", () => {
    const validator = V.String({ regex: /^[a-z]+$/ });
    expect(() => validator.check("abc123")).toThrow(VerificationError);
    expect(validator.check("abcdef")).toBe("abcdef");
  });

  it("should throw a validation error for notRegex", () => {
    const validator = V.String({ notRegex: /^[0-9]+$/ });
    expect(() => validator.check("123")).toThrow(VerificationError);
    expect(validator.check("abc")).toBe("abc");
  });

  it("should throw a validation error for in", () => {
    const validator = V.String({ in: ["apple", "banana", "cherry"] });
    expect(() => validator.check("orange")).toThrow(VerificationError);
    expect(validator.check("apple")).toBe("apple");
  });

  it("should throw a validation error for notIn", () => {
    const validator = V.String({ notIn: ["apple", "banana", "cherry"] });
    expect(() => validator.check("apple")).toThrow(VerificationError);
    expect(validator.check("orange")).toBe("orange");
  });

  it("should validate string in strictMode", () => {
    const validator = V.String({ strictMode: true });
    expect(() => validator.check(123)).toThrow(VerificationError);
    expect(validator.check("valid string")).toBe("valid string");
  });

  it("should validate string with ignoreCase in in condition", () => {
    const validator = V.String({
      in: ["Apple", "Banana", "Cherry"],
      ignoreCase: true,
    });
    expect(validator.check("apple")).toBe("apple");
    expect(() => validator.check("orange")).toThrow(VerificationError);
  });

  it("should support fluent condition methods", () => {
    const validator = V.String()
      .minLength(3)
      .maxLength(5)
      .regex(/^[a-z]+$/i)
      .notRegex(/\d/)
      .in(["abc", "def"])
      .notIn(["xyz"])
      .ignoreCase()
      .strictMode();

    expect(validator.check("ABC")).toBe("ABC");
    expect(() => validator.check("12")).toThrow(VerificationError);
  });

  it("should use custom fluent message for minLength", () => {
    const validator = V.String().minLength(4, {
      val: 4,
      message: () => "too short",
    });
    expect(() => validator.check("abc")).toThrow("too short");
  });

  it("should allow shorthand string message in minLength", () => {
    const validator = V.String().minLength(
      5,
      "El correo debe tener al menos 5 caracteres",
    );
    expect(() => validator.check("abcd")).toThrow(
      "El correo debe tener al menos 5 caracteres",
    );
  });

  it("should allow shorthand callback message in minLength", () => {
    const validator = V.String().minLength(
      5,
      (v) => `el minimo es ${v.minLength}`,
    );
    expect(() => validator.check("abcd")).toThrow("el minimo es 5");
  });

  it("should support custom messages for all fluent string conditions", () => {
    expect(() => V.String().maxLength(2, "max 2").check("abcd")).toThrow(
      "max 2",
    );
    expect(() =>
      V.String()
        .regex(/^[a-z]+$/, (v) => `patron ${v.regex}`)
        .check("123"),
    ).toThrow("patron /^[a-z]+$/");
    expect(() =>
      V.String().notRegex(/^\d+$/, "solo numeros no permitido").check("123"),
    ).toThrow("solo numeros no permitido");
    expect(() =>
      V.String()
        .in(["a", "b"], (v) => `permitidos ${v.in.join(",")}`)
        .check("c"),
    ).toThrow("permitidos a,b");
    expect(() => V.String().notIn(["x"], "x bloqueado").check("x")).toThrow(
      "x bloqueado",
    );
  });
});

describe("VStringNotNull", () => {
  it("should validate a non-null string correctly", () => {
    const validator = V.StringNotNull();
    expect(validator.check("valid string")).toBe("valid string");
  });

  it("should throw a validation error for null or undefined", () => {
    const validator = V.StringNotNull();
    expect(() => validator.check(null)).toThrow(VerificationError);
    expect(() => validator.check(undefined)).toThrow(VerificationError);
  });

  it("should throw a validation error for minLength", () => {
    const validator = V.StringNotNull({ minLength: 5 });
    expect(() => validator.check("abc")).toThrow(VerificationError);
    expect(validator.check("abcde")).toBe("abcde");
  });

  it("should throw a validation error for maxLength", () => {
    const validator = V.StringNotNull({ maxLength: 5 });
    expect(() => validator.check("abcdef")).toThrow(VerificationError);
    expect(validator.check("abc")).toBe("abc");
  });

  it("should throw a validation error for regex", () => {
    const validator = V.StringNotNull({ regex: /^[a-z]+$/ });
    expect(() => validator.check("abc123")).toThrow(VerificationError);
    expect(validator.check("abcdef")).toBe("abcdef");
  });

  it("should throw a validation error for notRegex", () => {
    const validator = V.StringNotNull({ notRegex: /^[0-9]+$/ });
    expect(() => validator.check("123")).toThrow(VerificationError);
    expect(validator.check("abc")).toBe("abc");
  });

  it("should throw a validation error for in", () => {
    const validator = V.StringNotNull({ in: ["apple", "banana", "cherry"] });
    expect(() => validator.check("orange")).toThrow(VerificationError);
    expect(validator.check("apple")).toBe("apple");
  });

  it("should throw a validation error for notIn", () => {
    const validator = V.StringNotNull({ notIn: ["apple", "banana", "cherry"] });
    expect(() => validator.check("apple")).toThrow(VerificationError);
    expect(validator.check("orange")).toBe("orange");
  });

  it("should validate string in strictMode", () => {
    const validator = V.StringNotNull({ strictMode: true });
    expect(() => validator.check(123)).toThrow(VerificationError);
    expect(validator.check("valid string")).toBe("valid string");
  });

  it("should validate string with ignoreCase in in condition", () => {
    const validator = V.StringNotNull({
      in: ["Apple", "Banana", "Cherry"],
      ignoreCase: true,
    });
    expect(validator.check("apple")).toBe("apple");
    expect(() => validator.check("orange")).toThrow(VerificationError);
  });

  it("should support fluent condition methods", () => {
    const validator = V.StringNotNull()
      .minLength(3)
      .maxLength(5)
      .regex(/^[a-z]+$/i)
      .notRegex(/\d/)
      .in(["abc", "def"])
      .notIn(["xyz"])
      .ignoreCase()
      .strictMode();

    expect(validator.check("ABC")).toBe("ABC");
    expect(() => validator.check("12")).toThrow(VerificationError);
  });

  it("should use custom fluent message for maxLength", () => {
    const validator = V.StringNotNull().maxLength(2, {
      val: 2,
      message: () => "too long",
    });
    expect(() => validator.check("abcd")).toThrow("too long");
  });
});
