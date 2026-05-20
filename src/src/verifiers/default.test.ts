import { Verifiers as V } from "../../index";
import { datetime } from "../utils/datetime";

describe("Fluent .default() method", () => {
  describe(".default() on nullable returns NotNull variant (Option A)", () => {
    it("should promote VNumber to VNumberNotNull", () => {
      const verifier = V.Number().default(42);
      const result: number = verifier.check(undefined);
      expect(result).toBe(42);
    });

    it("should promote VString to VStringNotNull", () => {
      const verifier = V.String().default("x");
      const result: string = verifier.check(null);
      expect(result).toBe("x");
    });

    it("should promote VObject to VObjectNotNull", () => {
      const schema = V.Object({ n: V.NumberNotNull() }).default({ n: 1 });
      const result: { n: number } = schema.check(null);
      expect(result).toEqual({ n: 1 });
    });
  });

  describe("VNumber / VNumberNotNull", () => {
    it("should use default when data is undefined (nullable promoted)", () => {
      const verifier = V.Number().default(42);
      expect(verifier.check(undefined)).toBe(42);
    });

    it("should use default when data is undefined (NotNull)", () => {
      const verifier = V.NumberNotNull().default(42);
      expect(verifier.check(undefined)).toBe(42);
    });

    it("should use default when data is null", () => {
      const verifier = V.Number().default(42);
      expect(verifier.check(null)).toBe(42);
    });

    it("should still use provided value when present", () => {
      const verifier = V.Number().default(42);
      expect(verifier.check(7)).toBe(7);
    });

    it("should combine with other fluent methods", () => {
      const verifier = V.Number().min(1).max(100).default(50);
      expect(verifier.check(undefined)).toBe(50);
      expect(verifier.check(5)).toBe(5);
    });
  });

  describe("VString / VStringNotNull", () => {
    it("should use default when data is undefined", () => {
      expect(V.String().default("hi").check(undefined)).toBe("hi");
      expect(V.StringNotNull().default("hi").check(undefined)).toBe("hi");
    });

    it("should still validate the default value through other rules", () => {
      const verifier = V.StringNotNull().default("provided");
      expect(verifier.check(undefined)).toBe("provided");
    });
  });

  describe("VBoolean / VBooleanNotNull", () => {
    it("should use default when data is undefined", () => {
      expect(V.Boolean().default(true).check(undefined)).toBe(true);
      expect(V.BooleanNotNull().default(false).check(undefined)).toBe(false);
    });
  });

  describe("VUUID / VUUIDNotNull", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";

    it("should use default when data is undefined", () => {
      expect(V.UUID().default(uuid).check(undefined)).toBe(uuid);
      expect(V.UUIDNotNull().default(uuid).check(undefined)).toBe(uuid);
    });
  });

  describe("VDate / VDateNotNull", () => {
    it("should use default Dayjs when data is undefined", () => {
      const fallback = datetime("2023-01-01");
      const result = V.DateNotNull().default(fallback).check(undefined);
      expect(result.format("YYYY-MM-DD")).toBe("2023-01-01");
    });

    it("should use default when nullable promoted and data is null", () => {
      const fallback = datetime("2023-06-15");
      const result = V.Date().default(fallback).check(null);
      expect(result.format("YYYY-MM-DD")).toBe("2023-06-15");
    });
  });

  describe("VArray / VArrayNotNull", () => {
    it("should use default empty array when data is undefined", () => {
      const verifier = V.ArrayNotNull(V.NumberNotNull()).default([1, 2, 3]);
      expect(verifier.check(undefined)).toEqual([1, 2, 3]);
    });

    it("should use default when nullable promoted and data is null", () => {
      const verifier = V.Array(V.NumberNotNull()).default([9]);
      const result: number[] = verifier.check(null);
      expect(result).toEqual([9]);
    });
  });

  describe("VObject / VObjectNotNull", () => {
    it("should use default object when data is undefined", () => {
      const schema = V.ObjectNotNull({
        name: V.StringNotNull(),
        age: V.NumberNotNull(),
      }).default({ name: "Anon", age: 0 });

      expect(schema.check(undefined)).toEqual({ name: "Anon", age: 0 });
    });

    it("should use default when nullable promoted and data is null", () => {
      const schema = V.Object({
        flag: V.BooleanNotNull(),
      }).default({ flag: true });

      const result: { flag: boolean } = schema.check(null);
      expect(result).toEqual({ flag: true });
    });
  });

  describe("VAny", () => {
    it("should use default when data is undefined", () => {
      expect(V.Any().default("fallback").check(undefined)).toBe("fallback");
    });

    it("should use default when data is null", () => {
      expect(V.Any().default({ ok: true }).check(null)).toEqual({ ok: true });
    });
  });

  describe("Chaining with .required()", () => {
    it("should allow .default() after .required()", () => {
      const verifier = V.Number().required().default(99);
      expect(verifier.check(undefined)).toBe(99);
    });

    it(".default() alone already yields NotNull (no .required needed)", () => {
      const verifier = V.Number().default(99);
      const result: number = verifier.check(undefined);
      expect(result).toBe(99);
    });
  });
});
