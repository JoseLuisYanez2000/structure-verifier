import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe('VNumber', () => {
    it('should validate a number correctly', () => {
        const validator = V.Number();
        expect(validator.check(123)).toBe(123);
        expect(validator.check(null)).toBeNull();
    });

    it('should throw a validation error for min', () => {
        const validator = V.Number({ min: 10 });
        expect(() => validator.check(5)).toThrow(VerificationError);
        expect(validator.check(10)).toBe(10);
    });

    it('should throw a validation error for max', () => {
        const validator = V.Number({ max: 10 });
        expect(() => validator.check(15)).toThrow(VerificationError);
        expect(validator.check(5)).toBe(5);
    });

    it('should throw a validation error for in', () => {
        const validator = V.Number({ in: [1, 2, 3] });
        expect(() => validator.check(4)).toThrow(VerificationError);
        expect(validator.check(2)).toBe(2);
    });

    it('should throw a validation error for notIn', () => {
        const validator = V.Number({ notIn: [1, 2, 3] });
        expect(() => validator.check(2)).toThrow(VerificationError);
        expect(validator.check(4)).toBe(4);
    });

    it('should throw a validation error for maxDecimalPlaces', () => {
        const validator = V.Number({ maxDecimalPlaces: 2 });
        expect(() => validator.check(1.234)).toThrow(VerificationError);
        expect(validator.check(1.23)).toBe(1.23);
    });

    it('should throw a validation error for minDecimalPlaces', () => {
        const validator = V.Number({ minDecimalPlaces: 2 });
        expect(() => validator.check(1.2)).toThrow(VerificationError);
        expect(validator.check(1.23)).toBe(1.23);
    });

    it('should throw a validation error for invalid type', () => {
        const validator = V.Number();
        expect(() => validator.check('string')).toThrow(VerificationError);
    });
});

describe('VNumberNotNull', () => {
    it('should validate a non-null number correctly', () => {
        const validator = V.NumberNotNull();
        expect(validator.check(123)).toBe(123);
    });

    it('should throw a validation error for null or undefined', () => {
        const validator = V.NumberNotNull();
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(undefined)).toThrow(VerificationError);
    });

    it('should throw a validation error for min', () => {
        const validator = V.NumberNotNull({ min: 10 });
        expect(() => validator.check(5)).toThrow(VerificationError);
        expect(validator.check(10)).toBe(10);
    });

    it('should throw a validation error for max', () => {
        const validator = V.NumberNotNull({ max: 10 });
        expect(() => validator.check(15)).toThrow(VerificationError);
        expect(validator.check(5)).toBe(5);
    });

    it('should throw a validation error for in', () => {
        const validator = V.NumberNotNull({ in: [1, 2, 3] });
        expect(() => validator.check(4)).toThrow(VerificationError);
        expect(validator.check(2)).toBe(2);
    });

    it('should throw a validation error for notIn', () => {
        const validator = V.NumberNotNull({ notIn: [1, 2, 3] });
        expect(() => validator.check(2)).toThrow(VerificationError);
        expect(validator.check(4)).toBe(4);
    });

    it('should throw a validation error for maxDecimalPlaces', () => {
        const validator = V.NumberNotNull({ maxDecimalPlaces: 2 });
        expect(() => validator.check(1.234)).toThrow(VerificationError);
        expect(validator.check(1.23)).toBe(1.23);
    });

    it('should throw a validation error for minDecimalPlaces', () => {
        const validator = V.NumberNotNull({ minDecimalPlaces: 2 });
        expect(() => validator.check(1.2)).toThrow(VerificationError);
        expect(validator.check(1.23)).toBe(1.23);
    });

    it('should throw a validation error for invalid type', () => {
        const validator = V.NumberNotNull();
        expect(() => validator.check('string')).toThrow(VerificationError);
    });
});

