import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe('VString', () => {
    it('should validate a string correctly', () => {
        const validator = new V.VString();
        expect(validator.check('valid string')).toBe('valid string');
        expect(validator.check(null)).toBeNull();
    });

    it('should throw a validation error for minLength', () => {
        const validator = new V.VString({ minLength: 5 });
        expect(() => validator.check('abc')).toThrow(VerificationError);
        expect(validator.check('abcde')).toBe('abcde');
    });

    it('should throw a validation error for maxLength', () => {
        const validator = new V.VString({ maxLength: 5 });
        expect(() => validator.check('abcdef')).toThrow(VerificationError);
        expect(validator.check('abc')).toBe('abc');
    });

    it('should throw a validation error for regex', () => {
        const validator = new V.VString({ regex: /^[a-z]+$/ });
        expect(() => validator.check('abc123')).toThrow(VerificationError);
        expect(validator.check('abcdef')).toBe('abcdef');
    });

    it('should throw a validation error for notRegex', () => {
        const validator = new V.VString({ notRegex: /^[0-9]+$/ });
        expect(() => validator.check('123')).toThrow(VerificationError);
        expect(validator.check('abc')).toBe('abc');
    });

    it('should throw a validation error for in', () => {
        const validator = new V.VString({ in: ['apple', 'banana', 'cherry'] });
        expect(() => validator.check('orange')).toThrow(VerificationError);
        expect(validator.check('apple')).toBe('apple');
    });

    it('should throw a validation error for notIn', () => {
        const validator = new V.VString({ notIn: ['apple', 'banana', 'cherry'] });
        expect(() => validator.check('apple')).toThrow(VerificationError);
        expect(validator.check('orange')).toBe('orange');
    });

    it('should validate string in strictMode', () => {
        const validator = new V.VString({ strictMode: true });
        expect(() => validator.check(123)).toThrow(VerificationError);
        expect(validator.check('valid string')).toBe('valid string');
    });

    it('should validate string with ignoreCase in in condition', () => {
        const validator = new V.VString({ in: ['Apple', 'Banana', 'Cherry'], ignoreCase: true });
        expect(validator.check('apple')).toBe('apple');
        expect(() => validator.check('orange')).toThrow(VerificationError);
    });
});

describe('VStringNotNull', () => {
    it('should validate a non-null string correctly', () => {
        const validator = new V.VStringNotNull();
        expect(validator.check('valid string')).toBe('valid string');
    });

    it('should throw a validation error for null or undefined', () => {
        const validator = new V.VStringNotNull();
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(undefined)).toThrow(VerificationError);
    });

    it('should throw a validation error for minLength', () => {
        const validator = new V.VStringNotNull({ minLength: 5 });
        expect(() => validator.check('abc')).toThrow(VerificationError);
        expect(validator.check('abcde')).toBe('abcde');
    });

    it('should throw a validation error for maxLength', () => {
        const validator = new V.VStringNotNull({ maxLength: 5 });
        expect(() => validator.check('abcdef')).toThrow(VerificationError);
        expect(validator.check('abc')).toBe('abc');
    });

    it('should throw a validation error for regex', () => {
        const validator = new V.VStringNotNull({ regex: /^[a-z]+$/ });
        expect(() => validator.check('abc123')).toThrow(VerificationError);
        expect(validator.check('abcdef')).toBe('abcdef');
    });

    it('should throw a validation error for notRegex', () => {
        const validator = new V.VStringNotNull({ notRegex: /^[0-9]+$/ });
        expect(() => validator.check('123')).toThrow(VerificationError);
        expect(validator.check('abc')).toBe('abc');
    });

    it('should throw a validation error for in', () => {
        const validator = new V.VStringNotNull({ in: ['apple', 'banana', 'cherry'] });
        expect(() => validator.check('orange')).toThrow(VerificationError);
        expect(validator.check('apple')).toBe('apple');
    });

    it('should throw a validation error for notIn', () => {
        const validator = new V.VStringNotNull({ notIn: ['apple', 'banana', 'cherry'] });
        expect(() => validator.check('apple')).toThrow(VerificationError);
        expect(validator.check('orange')).toBe('orange');
    });

    it('should validate string in strictMode', () => {
        const validator = new V.VStringNotNull({ strictMode: true });
        expect(() => validator.check(123)).toThrow(VerificationError);
        expect(validator.check('valid string')).toBe('valid string');
    });

    it('should validate string with ignoreCase in in condition', () => {
        const validator = new V.VStringNotNull({ in: ['Apple', 'Banana', 'Cherry'], ignoreCase: true });
        expect(validator.check('apple')).toBe('apple');
        expect(() => validator.check('orange')).toThrow(VerificationError);
    });
});
