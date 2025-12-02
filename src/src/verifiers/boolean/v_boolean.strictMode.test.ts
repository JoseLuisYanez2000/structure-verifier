import { VBoolean, VBooleanNotNull } from './v_boolean';
import { VerificationError } from '../../error/v_error';

describe('VBoolean - strictMode validation', () => {
    it('should accept boolean in strict mode', () => {
        const validator = new VBoolean({ strictMode: true });
        expect(validator.check(true)).toBe(true);
        expect(validator.check(false)).toBe(false);
    });

    it('should reject number in strict mode', () => {
        const validator = new VBoolean({ strictMode: true });
        expect(() => validator.check(1)).toThrow(VerificationError);
        expect(() => validator.check(0)).toThrow(VerificationError);
    });

    it('should reject string in strict mode', () => {
        const validator = new VBoolean({ strictMode: true });
        expect(() => validator.check('true')).toThrow(VerificationError);
        expect(() => validator.check('false')).toThrow(VerificationError);
        expect(() => validator.check('1')).toThrow(VerificationError);
    });

    it('should accept various formats in non-strict mode', () => {
        const validator = new VBoolean();
        expect(validator.check(true)).toBe(true);
        expect(validator.check(false)).toBe(false);
        expect(validator.check(1)).toBe(true);
        expect(validator.check(0)).toBe(false);
        expect(validator.check('1')).toBe(true);
        expect(validator.check('0')).toBe(false);
        expect(validator.check('true')).toBe(true);
        expect(validator.check('True')).toBe(true);
        expect(validator.check('TRUE')).toBe(true);
        expect(validator.check('false')).toBe(false);
        expect(validator.check('False')).toBe(false);
        expect(validator.check('FALSE')).toBe(false);
    });

    it('should reject invalid values in non-strict mode', () => {
        const validator = new VBoolean();
        expect(() => validator.check(2)).toThrow(VerificationError);
        expect(() => validator.check('yes')).toThrow(VerificationError);
        expect(() => validator.check('no')).toThrow(VerificationError);
        expect(() => validator.check([])).toThrow(VerificationError);
        expect(() => validator.check({})).toThrow(VerificationError);
    });

    it('should return null for null values when not required', () => {
        const validator = new VBoolean();
        expect(validator.check(null)).toBe(null);
        expect(validator.check(undefined)).toBe(null);
    });
});

describe('VBooleanNotNull - strictMode validation', () => {
    it('should enforce not null with strict mode', () => {
        const validator = new VBooleanNotNull({ strictMode: true });
        expect(validator.check(true)).toBe(true);
        expect(validator.check(false)).toBe(false);
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(1)).toThrow(VerificationError);
    });

    it('should work in non-strict mode', () => {
        const validator = new VBooleanNotNull();
        expect(validator.check(1)).toBe(true);
        expect(validator.check('true')).toBe(true);
        expect(() => validator.check(null)).toThrow(VerificationError);
    });
});
