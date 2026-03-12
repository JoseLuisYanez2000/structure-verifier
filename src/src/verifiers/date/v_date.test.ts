import { VerificationError } from "../../error/v_error";
import { Verifiers as V } from "../../../index";
import { datetime } from "../../utils/datetime";

describe("VDate", () => {
  it("should validate a date string with default settings", () => {
    const vdate = V.Date();
    expect(vdate.check("2023-08-09")?.format("YYYY-MM-DD")).toEqual(
      "2023-08-09",
    );
  });

  it("should return null for null input when not required", () => {
    const vdate = V.Date();
    expect(vdate.check(null)).toBeNull();
  });

  it("should throw an error for invalid date format", () => {
    const vdate = V.Date({ format: "DD/MM/YYYY" });
    expect(() => vdate.check("2023-08-09")).toThrow(VerificationError);
  });

  it("should validate a date with timezone", () => {
    const vdate = V.Date({ timeZone: "America/New_York" });
    const result = vdate.check("2023-08-09T10:00:00");
    expect(result?.tz("America/New_York").format()).toEqual(
      "2023-08-09T10:00:00-04:00",
    );
  });

  it("should validate a date within a min and max range", () => {
    const vdate = V.Date({
      minDate: datetime("2023-01-01"),
      maxDate: datetime("2023-12-31"),
    });
    expect(vdate.check("2023-08-09")?.format("YYYY-MM-DD")).toEqual(
      "2023-08-09",
    );
  });

  it("should throw an error if date is before minDate", () => {
    const vdate = V.Date({ minDate: datetime("2023-01-01") });
    expect(() => vdate.check("2022-12-31")).toThrow(VerificationError);
  });

  it("should throw an error if date is after maxDate", () => {
    const vdate = V.Date({ maxDate: datetime("2023-12-31") });
    expect(() => vdate.check("2024-01-01")).toThrow(VerificationError);
  });

  it("should validate a date without timezone in default UTC", () => {
    const vdate = V.Date();
    const result = vdate.check("2023-08-09T10:00:00");
    expect(result?.tz("UTC").format("YYYY-MM-DDTHH:mm:ssZ")).toEqual(
      "2023-08-09T10:00:00+00:00",
    );
  });

  it("should support fluent condition methods", () => {
    const vdate = V.Date()
      .format("YYYY-MM-DD")
      .minDate(datetime("2023-01-01"))
      .maxDate(datetime("2023-12-31"));

    expect(vdate.check("2023-08-09")?.format("YYYY-MM-DD")).toEqual(
      "2023-08-09",
    );
    expect(() => vdate.check("2024-01-01")).toThrow(VerificationError);
  });

  it("should support fluent timezone method", () => {
    const vdate = V.Date().timeZone("America/New_York");
    const result = vdate.check("2023-08-09T10:00:00");
    expect(result?.tz("America/New_York").format()).toEqual(
      "2023-08-09T10:00:00-04:00",
    );
  });

  it("should support custom messages for all fluent date conditions", () => {
    expect(() =>
      V.Date().format("DD/MM/YYYY", "formato invalido").check("2023-08-09"),
    ).toThrow("formato invalido");

    expect(() =>
      V.Date()
        .maxDate(
          datetime("2023-12-31"),
          (v) => `max ${v.maxDate.format("YYYY-MM-DD")}`,
        )
        .check("2024-01-01"),
    ).toThrow("max 2023-12-31");

    expect(() =>
      V.Date()
        .minDate(datetime("2023-01-01"), "fecha minima")
        .check("2022-12-31"),
    ).toThrow("fecha minima");
  });
});

describe("VDateNotNull", () => {
  it("should validate a non-null date", () => {
    const vdateNotNull = V.DateNotNull();
    expect(vdateNotNull.check("2023-08-09").format("YYYY-MM-DD")).toEqual(
      "2023-08-09",
    );
  });

  it("should throw an error for null input", () => {
    const vdateNotNull = V.DateNotNull();
    expect(() => vdateNotNull.check(null)).toThrow(VerificationError);
  });

  it("should validate a date with a specific format", () => {
    const vdateNotNull = V.DateNotNull({ format: "DD/MM/YYYY" });
    expect(vdateNotNull.check("09/08/2023").format("DD/MM/YYYY")).toEqual(
      "09/08/2023",
    );
    expect(() => vdateNotNull.check("09-08-2023")).toThrow(VerificationError);
  });

  it("should support fluent condition methods", () => {
    const vdateNotNull = V.DateNotNull()
      .format("YYYY-MM-DD")
      .minDate(datetime("2023-01-01"))
      .maxDate(datetime("2023-12-31"));

    expect(vdateNotNull.check("2023-08-09").format("YYYY-MM-DD")).toEqual(
      "2023-08-09",
    );
    expect(() => vdateNotNull.check("2022-12-31")).toThrow(VerificationError);
  });
});
