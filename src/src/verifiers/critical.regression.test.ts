import { Verifiers as V, Verifier } from "../../index";
import { VerificationError } from "../error/v_error";

describe("Critical regression fixes", () => {
  describe("NCR-01: VArray must propagate non-VerificationError exceptions", () => {
    class ThrowingVerifier extends Verifier<number> {
      check(data: any): number {
        if (data === 2) throw new TypeError("boom at 2");
        return data;
      }
    }

    it("should not swallow TypeError thrown by inner verifier", () => {
      const verifier = V.Array(new ThrowingVerifier());
      expect(() => verifier.check([1, 2, 3])).toThrow(TypeError);
      expect(() => verifier.check([1, 2, 3])).toThrow("boom at 2");
    });

    it("should not return partial array when inner verifier throws non-VE", () => {
      const verifier = V.ArrayNotNull(new ThrowingVerifier());
      expect(() => verifier.check([1, 2, 3])).toThrow(TypeError);
    });

    it("should still collect VerificationError items without swallowing", () => {
      const verifier = V.Array(V.NumberNotNull());
      expect(() => verifier.check([1, "abc", 3])).toThrow(VerificationError);
    });
  });

  describe("NCR-02: isRequired must not mutate shared cond.isRequired objects", () => {
    it("should not leak required-state between sibling instances sharing cond", () => {
      const sharedCond = {
        isRequired: { val: false, message: () => "REQ" },
      };
      const vA = V.Number(sharedCond);
      const vB = V.Number(sharedCond).required();

      try {
        vB.check(null);
      } catch {
      }

      expect(sharedCond.isRequired.val).toBe(false);
      expect(vA.check(null)).toBeNull();
    });

    it("should not mutate cond.isRequired across multiple check() calls", () => {
      const cond = {
        isRequired: { val: false, message: () => "REQ" },
      };
      const nullable = V.Number(cond);

      expect(nullable.check(null)).toBeNull();
      expect(cond.isRequired.val).toBe(false);
      expect(nullable.check(null)).toBeNull();
    });
  });

  describe("NCR-03: VObject.conds must wrap non-VE errors into VerificationError", () => {
    it("should wrap a TypeError thrown inside conds as VerificationError", () => {
      const schema = V.ObjectNotNull(
        { foo: V.NumberNotNull() },
        {
          conds: () => {
            throw new TypeError("boom");
          },
        },
      );

      expect(() => schema.check({ foo: 1 })).toThrow(VerificationError);
      try {
        schema.check({ foo: 1 });
      } catch (e) {
        expect(e).toBeInstanceOf(VerificationError);
        expect((e as VerificationError).errors[0]).toContain("boom");
      }
    });

    it("should propagate VerificationError from conds as-is", () => {
      const schema = V.ObjectNotNull(
        { foo: V.NumberNotNull() },
        {
          conds: () => {
            throw new VerificationError([
              { key: "foo", message: "no permitido" },
            ]);
          },
        },
      );

      try {
        schema.check({ foo: 1 });
        fail("expected throw");
      } catch (e) {
        expect(e).toBeInstanceOf(VerificationError);
        expect((e as VerificationError).errors).toContain("foo no permitido");
      }
    });

    it("should wrap non-VE errors from conds(null) in nullable VObject", () => {
      const schema = V.Object(
        { foo: V.Number() },
        {
          conds: () => {
            throw new TypeError("null-boom");
          },
        },
      );

      expect(() => schema.check(null)).toThrow(VerificationError);
    });
  });

  describe("NCR-04: VNumber must reject whitespace-only strings", () => {
    it("should reject a string of spaces", () => {
      expect(() => V.Number().check("   ")).toThrow(VerificationError);
      expect(() => V.NumberNotNull().check("   ")).toThrow(VerificationError);
    });

    it("should reject tabs and newlines", () => {
      expect(() => V.Number().check("\t")).toThrow(VerificationError);
      expect(() => V.Number().check("\n")).toThrow(VerificationError);
      expect(() => V.Number().check("\t\n  ")).toThrow(VerificationError);
    });

    it("should still accept valid numeric strings after the guard", () => {
      expect(V.Number().check("42")).toBe(42);
      expect(V.Number().check("3.14")).toBe(3.14);
    });

    it("should still reject boolean and array inputs (CR-01 unchanged)", () => {
      expect(() => V.Number().check(true)).toThrow(VerificationError);
      expect(() => V.Number().check(false)).toThrow(VerificationError);
      expect(() => V.Number().check([])).toThrow(VerificationError);
    });
  });
});
