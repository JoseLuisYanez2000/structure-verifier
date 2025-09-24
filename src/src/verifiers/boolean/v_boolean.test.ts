import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe('VBoolean', () => {
    it('should validate true for various true values', () => {
        const validator = new V.Boolean();
        expect(validator.check('1')).toBe(true);
        expect(validator.check(1)).toBe(true);
        expect(validator.check(true)).toBe(true);
        expect(validator.check('TRUE')).toBe(true);
        expect(validator.check('true')).toBe(true);
    });

    it('should validate false for various false values', () => {
        const validator = new V.Boolean();
        expect(validator.check('0')).toBe(false);
        expect(validator.check(0)).toBe(false);
        expect(validator.check(false)).toBe(false);
        expect(validator.check('FALSE')).toBe(false);
        expect(validator.check('false')).toBe(false);
    });

    it('should throw a validation error for invalid boolean values', () => {
        const validator = new V.Boolean();
        expect(() => validator.check('string')).toThrow(VerificationError);
        expect(() => validator.check(123)).toThrow(VerificationError);
    });

    it('should return null for null or undefined values', () => {
        const validator = new V.Boolean();
        expect(validator.check(null)).toBeNull();
        expect(validator.check(undefined)).toBeNull();
    });
});

describe('VBooleanNotNull', () => {
    it('should validate true for various true values', () => {
        const validator = new V.BooleanNotNull();
        expect(validator.check('1')).toBe(true);
        expect(validator.check(1)).toBe(true);
        expect(validator.check(true)).toBe(true);
        expect(validator.check('TRUE')).toBe(true);
        expect(validator.check('true')).toBe(true);
    });

    it('should validate false for various false values', () => {
        const validator = new V.BooleanNotNull();
        expect(validator.check('0')).toBe(false);
        expect(validator.check(0)).toBe(false);
        expect(validator.check(false)).toBe(false);
        expect(validator.check('FALSE')).toBe(false);
        expect(validator.check('false')).toBe(false);
    });

    it('should throw a validation error for invalid boolean values', () => {
        const validator = new V.BooleanNotNull();
        expect(() => validator.check('string')).toThrow(VerificationError);
        expect(() => validator.check(123)).toThrow(VerificationError);
    });

    it('should throw a validation error for null or undefined values', () => {
        const validator = new V.BooleanNotNull();
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(undefined)).toThrow(VerificationError);
    });
});
