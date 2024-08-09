import { Validators as V } from "../../../index";
import { ValidationError } from "../../error/v_error";

describe('VNumber', () => {
    it('should validate a number correctly', () => {
        const validator = new V.VNumber();
        expect(validator.validate(123)).toBe(123);
        expect(validator.validate(null)).toBeNull();
    });

    it('should throw a validation error for min', () => {
        const validator = new V.VNumber({ min: 10 });
        expect(() => validator.validate(5)).toThrow(ValidationError);
        expect(validator.validate(10)).toBe(10);
    });

    it('should throw a validation error for max', () => {
        const validator = new V.VNumber({ max: 10 });
        expect(() => validator.validate(15)).toThrow(ValidationError);
        expect(validator.validate(5)).toBe(5);
    });

    it('should throw a validation error for in', () => {
        const validator = new V.VNumber({ in: [1, 2, 3] });
        expect(() => validator.validate(4)).toThrow(ValidationError);
        expect(validator.validate(2)).toBe(2);
    });

    it('should throw a validation error for notIn', () => {
        const validator = new V.VNumber({ notIn: [1, 2, 3] });
        expect(() => validator.validate(2)).toThrow(ValidationError);
        expect(validator.validate(4)).toBe(4);
    });

    it('should throw a validation error for maxDecimalPlaces', () => {
        const validator = new V.VNumber({ maxDecimalPlaces: 2 });
        expect(() => validator.validate(1.234)).toThrow(ValidationError);
        expect(validator.validate(1.23)).toBe(1.23);
    });

    it('should throw a validation error for minDecimalPlaces', () => {
        const validator = new V.VNumber({ minDecimalPlaces: 2 });
        expect(() => validator.validate(1.2)).toThrow(ValidationError);
        expect(validator.validate(1.23)).toBe(1.23);
    });

    it('should throw a validation error for invalid type', () => {
        const validator = new V.VNumber();
        expect(() => validator.validate('string')).toThrow(ValidationError);
    });
});

describe('VNumberNotNull', () => {
    it('should validate a non-null number correctly', () => {
        const validator = new V.VNumberNotNull();
        expect(validator.validate(123)).toBe(123);
    });

    it('should throw a validation error for null or undefined', () => {
        const validator = new V.VNumberNotNull();
        expect(() => validator.validate(null)).toThrow(ValidationError);
        expect(() => validator.validate(undefined)).toThrow(ValidationError);
    });

    it('should throw a validation error for min', () => {
        const validator = new V.VNumberNotNull({ min: 10 });
        expect(() => validator.validate(5)).toThrow(ValidationError);
        expect(validator.validate(10)).toBe(10);
    });

    it('should throw a validation error for max', () => {
        const validator = new V.VNumberNotNull({ max: 10 });
        expect(() => validator.validate(15)).toThrow(ValidationError);
        expect(validator.validate(5)).toBe(5);
    });

    it('should throw a validation error for in', () => {
        const validator = new V.VNumberNotNull({ in: [1, 2, 3] });
        expect(() => validator.validate(4)).toThrow(ValidationError);
        expect(validator.validate(2)).toBe(2);
    });

    it('should throw a validation error for notIn', () => {
        const validator = new V.VNumberNotNull({ notIn: [1, 2, 3] });
        expect(() => validator.validate(2)).toThrow(ValidationError);
        expect(validator.validate(4)).toBe(4);
    });

    it('should throw a validation error for maxDecimalPlaces', () => {
        const validator = new V.VNumberNotNull({ maxDecimalPlaces: 2 });
        expect(() => validator.validate(1.234)).toThrow(ValidationError);
        expect(validator.validate(1.23)).toBe(1.23);
    });

    it('should throw a validation error for minDecimalPlaces', () => {
        const validator = new V.VNumberNotNull({ minDecimalPlaces: 2 });
        expect(() => validator.validate(1.2)).toThrow(ValidationError);
        expect(validator.validate(1.23)).toBe(1.23);
    });

    it('should throw a validation error for invalid type', () => {
        const validator = new V.VNumberNotNull();
        expect(() => validator.validate('string')).toThrow(ValidationError);
    });
});
