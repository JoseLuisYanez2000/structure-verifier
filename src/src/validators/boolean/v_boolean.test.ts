import { Validators as V } from "../../../index";
import { ValidationError } from "../../error/v_error";

describe('VBoolean', () => {
    it('should validate true for various true values', () => {
        const validator = new V.VBoolean();
        expect(validator.validate('1')).toBe(true);
        expect(validator.validate(1)).toBe(true);
        expect(validator.validate(true)).toBe(true);
        expect(validator.validate('TRUE')).toBe(true);
        expect(validator.validate('true')).toBe(true);
    });

    it('should validate false for various false values', () => {
        const validator = new V.VBoolean();
        expect(validator.validate('0')).toBe(false);
        expect(validator.validate(0)).toBe(false);
        expect(validator.validate(false)).toBe(false);
        expect(validator.validate('FALSE')).toBe(false);
        expect(validator.validate('false')).toBe(false);
    });

    it('should throw a validation error for invalid boolean values', () => {
        const validator = new V.VBoolean();
        expect(() => validator.validate('string')).toThrow(ValidationError);
        expect(() => validator.validate(123)).toThrow(ValidationError);
    });

    it('should return null for null or undefined values', () => {
        const validator = new V.VBoolean();
        expect(validator.validate(null)).toBeNull();
        expect(validator.validate(undefined)).toBeNull();
    });
});

describe('VBooleanNotNull', () => {
    it('should validate true for various true values', () => {
        const validator = new V.VBooleanNotNull();
        expect(validator.validate('1')).toBe(true);
        expect(validator.validate(1)).toBe(true);
        expect(validator.validate(true)).toBe(true);
        expect(validator.validate('TRUE')).toBe(true);
        expect(validator.validate('true')).toBe(true);
    });

    it('should validate false for various false values', () => {
        const validator = new V.VBooleanNotNull();
        expect(validator.validate('0')).toBe(false);
        expect(validator.validate(0)).toBe(false);
        expect(validator.validate(false)).toBe(false);
        expect(validator.validate('FALSE')).toBe(false);
        expect(validator.validate('false')).toBe(false);
    });

    it('should throw a validation error for invalid boolean values', () => {
        const validator = new V.VBooleanNotNull();
        expect(() => validator.validate('string')).toThrow(ValidationError);
        expect(() => validator.validate(123)).toThrow(ValidationError);
    });

    it('should throw a validation error for null or undefined values', () => {
        const validator = new V.VBooleanNotNull();
        expect(() => validator.validate(null)).toThrow(ValidationError);
        expect(() => validator.validate(undefined)).toThrow(ValidationError);
    });
});
