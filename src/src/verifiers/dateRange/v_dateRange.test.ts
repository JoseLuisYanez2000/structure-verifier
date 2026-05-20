import { VerificationError } from "../../error/v_error";
import { Verifiers as V } from "../../../index";
import { datetime } from "../../utils/datetime";
import { VerifierConfig } from "../../config/verifierConfig";

describe("VDateRange", () => {
  it("parses a range with the default separator `|`", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(
      "2024-01-01|2024-12-31",
    );
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("trims whitespace around each side", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(
      "  2024-01-01 | 2024-12-31  ",
    );
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("returns null for null input when not required", () => {
    expect(V.DateRange({ format: "YYYY-MM-DD" }).check(null)).toBeNull();
  });

  it("throws when the separator is missing", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
    expect(() => v.check("2024-01-01")).toThrow(VerificationError);
  });

  it("throws when there are more than two parts", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
    expect(() => v.check("2024-01-01|2024-06-01|2024-12-31")).toThrow(
      VerificationError,
    );
  });

  it("allows the `from` side to be empty (open-start range)", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(
      "|2026-06-06",
    );
    expect(r.from).toBeNull();
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2026-06-06");
  });

  it("allows the `to` side to be empty (open-end range)", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(
      "2026-06-06|",
    );
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2026-06-06");
    expect(r.to).toBeNull();
  });

  it("throws when both sides are empty and tags key=range", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
    try {
      v.check("|");
      fail("expected VerificationError");
    } catch (err) {
      expect(err).toBeInstanceOf(VerificationError);
      expect((err as VerificationError).errorsObj[0].key).toEqual("range");
    }
  });

  it("supports a custom separator", () => {
    const r = V.DateRangeNotNull({
      format: "YYYY-MM-DD",
      separator: "..",
    }).check("2024-01-01..2024-12-31");
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("throws a clear Error when separator is configured as empty string", () => {
    expect(() =>
      V.DateRangeNotNull({ format: "YYYY-MM-DD" }).separator(""),
    ).toThrow(/non-empty/);
  });

  it("throws when the format does not match on the `from` side and tags the error with key=from", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
    try {
      v.check("01/01/2024|2024-12-31");
      fail("expected VerificationError");
    } catch (err) {
      expect(err).toBeInstanceOf(VerificationError);
      const e = err as VerificationError;
      expect(e.errorsObj[0].key).toEqual("from");
    }
  });

  it("throws when the format does not match on the `to` side and tags the error with key=to", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
    try {
      v.check("2024-01-01|31/12/2024");
      fail("expected VerificationError");
    } catch (err) {
      expect(err).toBeInstanceOf(VerificationError);
      const e = err as VerificationError;
      expect(e.errorsObj[0].key).toEqual("to");
    }
  });

  it("uses side-aware format message in es (inicial/final)", () => {
    const prev = VerifierConfig.lang;
    VerifierConfig.lang = "es";
    try {
      const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
      try {
        v.check("01/01/2024|2024-12-31");
        fail("expected VerificationError");
      } catch (err) {
        const e = err as VerificationError;
        expect(e.errorsObj[0].message).toContain("inicial");
        expect(e.errorsObj[0].message).toContain("YYYY-MM-DD");
      }
      try {
        v.check("2024-01-01|31/12/2024");
        fail("expected VerificationError");
      } catch (err) {
        const e = err as VerificationError;
        expect(e.errorsObj[0].message).toContain("final");
      }
    } finally {
      VerifierConfig.lang = prev;
    }
  });

  it("uses side-aware format message in en (start/end)", () => {
    const prev = VerifierConfig.lang;
    VerifierConfig.lang = "en";
    try {
      const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
      try {
        v.check("01/01/2024|2024-12-31");
        fail("expected VerificationError");
      } catch (err) {
        const e = err as VerificationError;
        expect(e.errorsObj[0].message).toContain("start");
      }
      try {
        v.check("2024-01-01|31/12/2024");
        fail("expected VerificationError");
      } catch (err) {
        const e = err as VerificationError;
        expect(e.errorsObj[0].message).toContain("end");
      }
    } finally {
      VerifierConfig.lang = prev;
    }
  });

  it("respects a user-provided format message and still tags the side key", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" })
      .format("YYYY-MM-DD", "formato invalido");
    try {
      v.check("01/01/2024|2024-12-31");
      fail("expected VerificationError");
    } catch (err) {
      const e = err as VerificationError;
      expect(e.errorsObj[0].message).toEqual("formato invalido");
      expect(e.errorsObj[0].key).toEqual("from");
    }
  });

  it("throws when `from` is after `to` and tags key=range", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" });
    try {
      v.check("2024-12-31|2024-01-01");
      fail("expected VerificationError");
    } catch (err) {
      expect((err as VerificationError).errorsObj[0].key).toEqual("range");
    }
  });

  it("allows from equal to to", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(
      "2024-05-10|2024-05-10",
    );
    expect(r.from?.isSame(r.to ?? undefined)).toBe(true);
  });

  it("enforces maxSpan in days only when both sides are present", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD",
      maxSpan: { value: 30, unit: "day" },
    });
    expect(() => v.check("2024-01-01|2024-03-01")).toThrow(VerificationError);
    expect(() => v.check("2024-01-01|2024-01-31")).not.toThrow();
    expect(() => v.check("2024-01-01|")).not.toThrow();
    expect(() => v.check("|2024-03-01")).not.toThrow();
  });

  it("maxSpan uses fractional precision (no truncation toward zero)", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD HH:mm",
      maxSpan: { value: 1, unit: "day" },
    });
    expect(() => v.check("2024-01-01 00:00|2024-01-02 23:59")).toThrow(
      VerificationError,
    );
    expect(() => v.check("2024-01-01 00:00|2024-01-02 00:00")).not.toThrow();
  });

  it("enforces maxSpan using hour unit", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD HH:mm",
      maxSpan: { value: 2, unit: "hour" },
    });
    expect(() => v.check("2024-01-01 10:00|2024-01-01 13:00")).toThrow(
      VerificationError,
    );
    expect(() => v.check("2024-01-01 10:00|2024-01-01 12:00")).not.toThrow();
  });

  it("enforces maxSpan using minute unit", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD HH:mm",
      maxSpan: { value: 30, unit: "minute" },
    });
    expect(() => v.check("2024-01-01 10:00|2024-01-01 11:00")).toThrow(
      VerificationError,
    );
    expect(() => v.check("2024-01-01 10:00|2024-01-01 10:30")).not.toThrow();
  });

  it("enforces maxSpan using week unit", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD",
      maxSpan: { value: 2, unit: "week" },
    });
    expect(() => v.check("2024-01-01|2024-01-22")).toThrow(VerificationError);
    expect(() => v.check("2024-01-01|2024-01-15")).not.toThrow();
  });

  it("enforces maxSpan using month unit", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD",
      maxSpan: { value: 3, unit: "month" },
    });
    expect(() => v.check("2024-01-01|2024-05-01")).toThrow(VerificationError);
    expect(() => v.check("2024-01-01|2024-04-01")).not.toThrow();
  });

  it("enforces maxSpan using year unit", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD",
      maxSpan: { value: 1, unit: "year" },
    });
    expect(() => v.check("2024-01-01|2025-06-01")).toThrow(VerificationError);
    expect(() => v.check("2024-01-01|2025-01-01")).not.toThrow();
  });

  it("exclusiveEnd makes maxSpan strict on equality", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" })
      .maxSpan({ value: 30, unit: "day" })
      .exclusiveEnd();
    expect(() => v.check("2024-01-01|2024-01-31")).toThrow(VerificationError);
    expect(() => v.check("2024-01-01|2024-01-30")).not.toThrow();
  });

  it("enforces minDate/maxDate on the present sides", () => {
    const v = V.DateRangeNotNull({
      format: "YYYY-MM-DD",
      minDate: datetime("2024-01-01"),
      maxDate: datetime("2024-12-31"),
    });
    expect(() => v.check("2023-12-01|2024-06-01")).toThrow(VerificationError);
    expect(() => v.check("2024-06-01|2025-01-01")).toThrow(VerificationError);
    expect(() => v.check("2024-06-01|2024-12-31")).not.toThrow();
    expect(() => v.check("2023-12-01|")).toThrow(VerificationError);
    expect(() => v.check("|2025-01-01")).toThrow(VerificationError);
  });

  it("supports fluent condition methods", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" })
      .separator("..")
      .maxSpan({ value: 366, unit: "day" });

    const r = v.check("2024-01-01..2024-12-31");
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("supports custom messages", () => {
    expect(() =>
      V.DateRangeNotNull({ format: "YYYY-MM-DD" })
        .maxSpan({ value: 30, unit: "day" }, "rango demasiado largo")
        .check("2024-01-01|2024-06-01"),
    ).toThrow("rango demasiado largo");

    expect(() =>
      V.DateRangeNotNull({ format: "YYYY-MM-DD" })
        .separator("..", "separador invalido")
        .check("2024-01-01|2024-06-01"),
    ).toThrow("separador invalido");
  });

  it("honors timezone on parsed sides", () => {
    const r = V.DateRangeNotNull({
      format: "YYYY-MM-DD HH:mm",
      timeZone: "America/New_York",
    }).check("2024-01-01 10:00|2024-01-01 12:00");
    expect(r.from?.tz("America/New_York").format()).toEqual(
      "2024-01-01T10:00:00-05:00",
    );
    expect(r.to?.tz("America/New_York").format()).toEqual(
      "2024-01-01T12:00:00-05:00",
    );
  });

  it("accepts a DateRange object as input", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check({
      from: datetime("2024-01-01"),
      to: datetime("2024-12-31"),
    });
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("accepts a tuple [from, to] as input", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check([
      "2024-01-01",
      "2024-12-31",
    ]);
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("accepts a tuple with one side null/empty", () => {
    const r = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check([
      null,
      "2024-12-31",
    ]);
    expect(r.from).toBeNull();
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("DateRange object input enforces requireFrom", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).requireFrom();
    expect(() =>
      v.check({ from: null, to: datetime("2024-12-31") }),
    ).toThrow(VerificationError);
  });

  it("DateRange object input enforces requireTo", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).requireTo();
    expect(() =>
      v.check({ from: datetime("2024-01-01"), to: null }),
    ).toThrow(VerificationError);
  });

  it("autoSwap swaps from/to when reversed instead of throwing", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).autoSwap();
    const r = v.check("2024-12-31|2024-01-01");
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("autoSwap(false) restores throwing behavior", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" })
      .autoSwap(true)
      .autoSwap(false);
    expect(() => v.check("2024-12-31|2024-01-01")).toThrow(VerificationError);
  });

  it("requireFrom throws when from is empty", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).requireFrom();
    try {
      v.check("|2024-12-31");
      fail("expected VerificationError");
    } catch (err) {
      const e = err as VerificationError;
      expect(e.errorsObj[0].key).toEqual("from");
    }
  });

  it("requireTo throws when to is empty", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).requireTo();
    try {
      v.check("2024-01-01|");
      fail("expected VerificationError");
    } catch (err) {
      const e = err as VerificationError;
      expect(e.errorsObj[0].key).toEqual("to");
    }
  });

  it("requireFrom accepts a custom message", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" })
      .requireFrom("inicio requerido");
    expect(() => v.check("|2024-12-31")).toThrow("inicio requerido");
  });

  it("enforces maxInputLength", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).maxInputLength(10);
    try {
      v.check("2024-01-01|2024-12-31");
      fail("expected VerificationError");
    } catch (err) {
      const e = err as VerificationError;
      expect(e.errorsObj[0].key).toEqual("range");
    }
  });

  it("has a default cap on input length", () => {
    const huge = "2024-01-01" + "x".repeat(2000) + "|2024-12-31";
    expect(() =>
      V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(huge),
    ).toThrow(VerificationError);
  });

  it("throws for empty string input", () => {
    expect(() =>
      V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(""),
    ).toThrow(VerificationError);
  });

  it("exposes conditions via getter", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" })
      .separator("..")
      .maxSpan({ value: 30, unit: "day" });
    expect(v.conditions.format).toBeDefined();
    expect(v.conditions.separator).toBeDefined();
    expect(v.conditions.maxSpan).toBeDefined();
  });

  it("strict() returns a verifier producing non-null from/to", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).strict();
    const r = v.check("2024-01-01|2024-12-31");
    expect(r.from.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });

  it("strict() rejects open ranges", () => {
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).strict();
    expect(() => v.check("|2024-12-31")).toThrow(VerificationError);
    expect(() => v.check("2024-01-01|")).toThrow(VerificationError);
  });
});

describe("VDateRange (nullable)", () => {
  it("throws for null when chained with required()", () => {
    const v = V.DateRange({ format: "YYYY-MM-DD" }).required();
    expect(() => v.check(null)).toThrow(VerificationError);
  });

  it("returns null for undefined", () => {
    expect(V.DateRange({ format: "YYYY-MM-DD" }).check(undefined)).toBeNull();
  });

  it("default() returns the configured DateRange object when input is null", () => {
    const def = {
      from: datetime("2024-01-01"),
      to: datetime("2024-12-31"),
    };
    const v = V.DateRange({ format: "YYYY-MM-DD" }).default(def);
    const r = v.check(null);
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
    expect(r.to?.format("YYYY-MM-DD")).toEqual("2024-12-31");
  });
});

describe("VDateRangeNotNull", () => {
  it("throws when null is passed", () => {
    expect(() => V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(null))
      .toThrow(VerificationError);
  });

  it("throws when a non-string is passed", () => {
    expect(() => V.DateRangeNotNull({ format: "YYYY-MM-DD" }).check(123))
      .toThrow(VerificationError);
  });

  it("default() still yields a VDateRangeNotNull", () => {
    const def = {
      from: datetime("2024-01-01"),
      to: datetime("2024-12-31"),
    };
    const v = V.DateRangeNotNull({ format: "YYYY-MM-DD" }).default(def);
    const r = v.check(null);
    expect(r.from?.format("YYYY-MM-DD")).toEqual("2024-01-01");
  });
});
