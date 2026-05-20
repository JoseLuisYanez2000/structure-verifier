import { Verifiers as V } from "../../index";
import { VerificationError } from "../error/v_error";
import { datetime } from "../utils/datetime";

describe("HIGH regression fixes", () => {
  describe("NHI-01: VDate must wrap dayjs RangeError as VerificationError", () => {
    it("should throw VerificationError (not RangeError) for invalid date strings", () => {
      expect(() => V.Date().check("invalid")).toThrow(VerificationError);
      expect(() => V.DateNotNull().check("not a date")).toThrow(
        VerificationError,
      );
    });

    it("should throw VerificationError for invalid timezone identifier", () => {
      expect(() =>
        V.Date({ timeZone: "Invalid/Zone" }).check("2023-01-01"),
      ).toThrow(VerificationError);
    });

    it("should still parse valid dates normally", () => {
      const result = V.DateNotNull().check("2023-01-01");
      expect(result.isValid()).toBe(true);
    });
  });

  describe("NHI-02: VDate.timeZone must apply to Dayjs and Date inputs", () => {
    it("should apply timeZone to Dayjs input that already has a zone", () => {
      const dj = datetime.tz("2023-01-01 00:00:00", "Asia/Tokyo");
      const result = V.DateNotNull({ timeZone: "UTC" }).check(dj);
      expect(result.format("Z")).toBe("+00:00");
    });

    it("should apply timeZone to Date instance input", () => {
      const d = new Date("2023-01-01T00:00:00Z");
      const result = V.DateNotNull({ timeZone: "UTC" }).check(d);
      expect(result.format("Z")).toBe("+00:00");
    });

    it("should preserve instant when string already has timezone", () => {
      const result = V.DateNotNull({ timeZone: "UTC" }).check(
        "2023-01-01T00:00:00+09:00",
      );
      expect(result.toISOString()).toBe("2022-12-31T15:00:00.000Z");
    });
  });

  describe("NHI-03: VObject.ignoreCase must reject duplicate case-insensitive keys", () => {
    it("should throw when input has both foo and FOO under ignoreCase", () => {
      const schema = V.ObjectNotNull(
        { foo: V.NumberNotNull() },
        { ignoreCase: true },
      );
      expect(() => schema.check({ foo: 1, FOO: 2 })).toThrow(VerificationError);
    });

    it("should include both duplicate names in the error message", () => {
      const schema = V.ObjectNotNull(
        { foo: V.NumberNotNull() },
        { ignoreCase: true },
      );
      try {
        schema.check({ foo: 1, FOO: 2 });
        fail("expected throw");
      } catch (e) {
        expect(e).toBeInstanceOf(VerificationError);
        const msg = (e as VerificationError).errors[0];
        expect(msg).toContain("foo");
        expect(msg).toContain("FOO");
      }
    });

    it("should still accept a single case-insensitive match", () => {
      const schema = V.ObjectNotNull(
        { foo: V.NumberNotNull() },
        { ignoreCase: true },
      );
      expect(schema.check({ FOO: 5 })).toEqual({ foo: 5 });
    });

    it("should not trigger duplicate check when ignoreCase is disabled", () => {
      const schema = V.ObjectNotNull({ foo: V.NumberNotNull() });
      expect(schema.check({ foo: 1, FOO: 2 })).toEqual({ foo: 1 });
    });
  });

  describe("NHI-04: VObject.check must pass real undefined/null to conds", () => {
    it("should pass undefined to conds when input is undefined", () => {
      let received: any = "NOT_CALLED";
      const schema = V.Object(
        { foo: V.Number() },
        {
          conds: (v) => {
            received = v;
          },
        },
      );
      schema.check(undefined);
      expect(received).toBeUndefined();
    });

    it("should pass null to conds when input is null", () => {
      let received: any = "NOT_CALLED";
      const schema = V.Object(
        { foo: V.Number() },
        {
          conds: (v) => {
            received = v;
          },
        },
      );
      schema.check(null);
      expect(received).toBeNull();
    });

    it("should still return null for both undefined and null inputs", () => {
      const schema = V.Object({ foo: V.Number() });
      expect(schema.check(undefined)).toBeNull();
      expect(schema.check(null)).toBeNull();
    });
  });

  describe("NHI-05: VNumber must reject Infinity and -Infinity", () => {
    it("should reject Infinity", () => {
      expect(() => V.Number().check(Infinity)).toThrow(VerificationError);
      expect(() => V.NumberNotNull().check(Infinity)).toThrow(
        VerificationError,
      );
    });

    it("should reject -Infinity", () => {
      expect(() => V.Number().check(-Infinity)).toThrow(VerificationError);
    });

    it("should reject numeric strings that parse to Infinity", () => {
      expect(() => V.Number().check("Infinity")).toThrow(VerificationError);
      expect(() => V.Number().check("-Infinity")).toThrow(VerificationError);
    });

    it("should still accept large but finite numbers", () => {
      expect(V.Number().check(1e308)).toBe(1e308);
      expect(V.Number().check(Number.MAX_SAFE_INTEGER)).toBe(
        Number.MAX_SAFE_INTEGER,
      );
    });
  });

  describe("NHI-06: VUUID must reject non-string inputs as VerificationError", () => {
    it("should reject Symbol without leaking TypeError", () => {
      expect(() => V.UUID().check(Symbol("x") as any)).toThrow(
        VerificationError,
      );
      expect(() => V.UUIDNotNull().check(Symbol("x") as any)).toThrow(
        VerificationError,
      );
    });

    it("should reject number input without attempting string coercion", () => {
      expect(() => V.UUID().check(12345 as any)).toThrow(VerificationError);
    });

    it("should reject plain object input", () => {
      expect(() => V.UUID().check({} as any)).toThrow(VerificationError);
    });

    it("should still accept a valid UUID string", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      expect(V.UUIDNotNull().check(id)).toBe(id);
    });
  });
});
