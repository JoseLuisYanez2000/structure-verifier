import moment from "moment-timezone";
import { VerificationError } from "../../error/v_error";
import { Verifiers as V } from "../../../index";

describe("VDate", () => {
    it("should validate a date string with default settings", () => {
        const vdate = new V.VDate();
        expect(vdate.check("2023-08-09")?.format("YYYY-MM-DD")).toEqual("2023-08-09");
    });

    it("should return null for null input when not required", () => {
        const vdate = new V.VDate();
        expect(vdate.check(null)).toBeNull();
    });

    it("should throw an error for invalid date format", () => {
        const vdate = new V.VDate({ format: "DD/MM/YYYY" });
        expect(() => vdate.check("2023-08-09")).toThrow(VerificationError);
    });

    it("should validate a date with timezone", () => {
        const vdate = new V.VDate({ timeZone: "America/New_York" });
        const result = vdate.check("2023-08-09T10:00:00");
        expect(result?.tz("America/New_York").format()).toEqual("2023-08-09T10:00:00-04:00");
    });

    it("should validate a date within a min and max range", () => {
        const vdate = new V.VDate({
            minDate: moment("2023-01-01"),
            maxDate: moment("2023-12-31")
        });
        expect(vdate.check("2023-08-09")?.format("YYYY-MM-DD")).toEqual("2023-08-09");
    });

    it("should throw an error if date is before minDate", () => {
        const vdate = new V.VDate({ minDate: moment("2023-01-01") });
        expect(() => vdate.check("2022-12-31")).toThrow(VerificationError);
    });

    it("should throw an error if date is after maxDate", () => {
        const vdate = new V.VDate({ maxDate: moment("2023-12-31") });
        expect(() => vdate.check("2024-01-01")).toThrow(VerificationError);
    });

    it("should validate a date without timezone in default UTC", () => {
        const vdate = new V.VDate();
        const result = vdate.check("2023-08-09T10:00:00");
        expect(result?.tz("UTC").format('YYYY-MM-DDTHH:mm:ssZ')).toEqual("2023-08-09T10:00:00+00:00");
    });
});

describe("VDateNotNull", () => {
    it("should validate a non-null date", () => {
        const vdateNotNull = new V.VDateNotNull();
        expect(vdateNotNull.check("2023-08-09").format("YYYY-MM-DD")).toEqual("2023-08-09");
    });

    it("should throw an error for null input", () => {
        const vdateNotNull = new V.VDateNotNull();
        expect(() => vdateNotNull.check(null)).toThrow(VerificationError);
    });

    it("should validate a date with a specific format", () => {
        const vdateNotNull = new V.VDateNotNull({ format: "DD/MM/YYYY" });
        expect(vdateNotNull.check("09/08/2023").format("DD/MM/YYYY")).toEqual("09/08/2023");
        expect(() => vdateNotNull.check("09-08-2023")).toThrow(VerificationError);
    });
});
