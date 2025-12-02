import { VString, VStringNotNull } from './v_string';
import { VerificationError } from '../../error/v_error';

describe('VString - strictMode validation', () => {
    it('should accept string in strict mode', () => {
        const validator = new VString({ strictMode: true });
        expect(validator.check('hello')).toBe('hello');
        expect(validator.check('')).toBe('');
    });

    it('should reject number in strict mode', () => {
        const validator = new VString({ strictMode: true });
        expect(() => validator.check(42)).toThrow(VerificationError);
    });

    it('should reject boolean in strict mode', () => {
        const validator = new VString({ strictMode: true });
        expect(() => validator.check(true)).toThrow(VerificationError);
    });

    it('should accept number conversion in non-strict mode', () => {
        const validator = new VString();
        expect(validator.check(42)).toBe('42');
        expect(validator.check(true)).toBe('true');
    });

    it('should work with ignoreCase using getValue', () => {
        const validator = new VString({ 
            in: ['hello', 'world'],
            ignoreCase: true 
        });
        expect(validator.check('HELLO')).toBe('HELLO');
        expect(validator.check('World')).toBe('World');
    });

    it('should work with notIn using getValue', () => {
        const validator = new VString({ 
            notIn: ['bad', 'wrong'],
            ignoreCase: true 
        });
        expect(validator.check('good')).toBe('good');
        expect(() => validator.check('BAD')).toThrow(VerificationError);
    });

    it('should combine strictMode with other validations', () => {
        const validator = new VString({ 
            strictMode: true,
            minLength: 3,
            maxLength: 10
        });
        expect(validator.check('hello')).toBe('hello');
        expect(() => validator.check('hi')).toThrow(VerificationError);
        expect(() => validator.check('verylongstring')).toThrow(VerificationError);
        expect(() => validator.check(123)).toThrow(VerificationError);
    });
});

describe('VStringNotNull - strictMode validation', () => {
    it('should enforce not null with strict mode', () => {
        const validator = new VStringNotNull({ strictMode: true });
        expect(validator.check('hello')).toBe('hello');
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(42)).toThrow(VerificationError);
    });
});
