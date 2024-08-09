import { Validators as V } from "../../../index";
import { ValidationError } from "../../error/v_error";

describe('VString', () => {
    it('should validate a string correctly', () => {
        const validator = new V.VString();
        expect(validator.validate('valid string')).toBe('valid string');
        expect(validator.validate(null)).toBeNull();
    });

    it('should throw a validation error for minLength', () => {
        const validator = new V.VString({ minLength: 5 });
        expect(() => validator.validate('abc')).toThrow(ValidationError);
        expect(validator.validate('abcde')).toBe('abcde');
    });

    it('should throw a validation error for maxLength', () => {
        const validator = new V.VString({ maxLength: 5 });
        expect(() => validator.validate('abcdef')).toThrow(ValidationError);
        expect(validator.validate('abc')).toBe('abc');
    });

    it('should throw a validation error for regex', () => {
        const validator = new V.VString({ regex: /^[a-z]+$/ });
        expect(() => validator.validate('abc123')).toThrow(ValidationError);
        expect(validator.validate('abcdef')).toBe('abcdef');
    });

    it('should throw a validation error for notRegex', () => {
        const validator = new V.VString({ notRegex: /^[0-9]+$/ });
        expect(() => validator.validate('123')).toThrow(ValidationError);
        expect(validator.validate('abc')).toBe('abc');
    });

    it('should throw a validation error for in', () => {
        const validator = new V.VString({ in: ['apple', 'banana', 'cherry'] });
        expect(() => validator.validate('orange')).toThrow(ValidationError);
        expect(validator.validate('apple')).toBe('apple');
    });

    it('should throw a validation error for notIn', () => {
        const validator = new V.VString({ notIn: ['apple', 'banana', 'cherry'] });
        expect(() => validator.validate('apple')).toThrow(ValidationError);
        expect(validator.validate('orange')).toBe('orange');
    });

    it('should validate string in strictMode', () => {
        const validator = new V.VString({ strictMode: true });
        expect(() => validator.validate(123)).toThrow(ValidationError);
        expect(validator.validate('valid string')).toBe('valid string');
    });

    it('should validate string with ignoreCase in in condition', () => {
        const validator = new V.VString({ in: ['Apple', 'Banana', 'Cherry'], ignoreCase: true });
        expect(validator.validate('apple')).toBe('apple');
        expect(() => validator.validate('orange')).toThrow(ValidationError);
    });
});

describe('VStringNotNull', () => {
    it('should validate a non-null string correctly', () => {
        const validator = new V.VStringNotNull();
        expect(validator.validate('valid string')).toBe('valid string');
    });

    it('should throw a validation error for null or undefined', () => {
        const validator = new V.VStringNotNull();
        expect(() => validator.validate(null)).toThrow(ValidationError);
        expect(() => validator.validate(undefined)).toThrow(ValidationError);
    });

    it('should throw a validation error for minLength', () => {
        const validator = new V.VStringNotNull({ minLength: 5 });
        expect(() => validator.validate('abc')).toThrow(ValidationError);
        expect(validator.validate('abcde')).toBe('abcde');
    });

    it('should throw a validation error for maxLength', () => {
        const validator = new V.VStringNotNull({ maxLength: 5 });
        expect(() => validator.validate('abcdef')).toThrow(ValidationError);
        expect(validator.validate('abc')).toBe('abc');
    });

    it('should throw a validation error for regex', () => {
        const validator = new V.VStringNotNull({ regex: /^[a-z]+$/ });
        expect(() => validator.validate('abc123')).toThrow(ValidationError);
        expect(validator.validate('abcdef')).toBe('abcdef');
    });

    it('should throw a validation error for notRegex', () => {
        const validator = new V.VStringNotNull({ notRegex: /^[0-9]+$/ });
        expect(() => validator.validate('123')).toThrow(ValidationError);
        expect(validator.validate('abc')).toBe('abc');
    });

    it('should throw a validation error for in', () => {
        const validator = new V.VStringNotNull({ in: ['apple', 'banana', 'cherry'] });
        expect(() => validator.validate('orange')).toThrow(ValidationError);
        expect(validator.validate('apple')).toBe('apple');
    });

    it('should throw a validation error for notIn', () => {
        const validator = new V.VStringNotNull({ notIn: ['apple', 'banana', 'cherry'] });
        expect(() => validator.validate('apple')).toThrow(ValidationError);
        expect(validator.validate('orange')).toBe('orange');
    });

    it('should validate string in strictMode', () => {
        const validator = new V.VStringNotNull({ strictMode: true });
        expect(() => validator.validate(123)).toThrow(ValidationError);
        expect(validator.validate('valid string')).toBe('valid string');
    });

    it('should validate string with ignoreCase in in condition', () => {
        const validator = new V.VStringNotNull({ in: ['Apple', 'Banana', 'Cherry'], ignoreCase: true });
        expect(validator.validate('apple')).toBe('apple');
        expect(() => validator.validate('orange')).toThrow(ValidationError);
    });
});
