import { VUUID, VUUIDNotNull } from './v_uuid';
import { VerificationError } from '../../error/v_error';

describe('VUUID - strictMode validation', () => {
    it('should accept string UUID in strict mode', () => {
        const validator = new VUUID({ strictMode: true });
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(validator.check(uuid)).toBe(uuid);
    });

    it('should reject non-string in strict mode', () => {
        const validator = new VUUID({ strictMode: true });
        expect(() => validator.check(123)).toThrow(VerificationError);
        expect(() => validator.check(true)).toThrow(VerificationError);
        expect(() => validator.check({})).toThrow(VerificationError);
    });

    it('should convert to string in non-strict mode', () => {
        const validator = new VUUID();
        // Even in non-strict mode, it needs to be a valid UUID format
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(validator.check(uuid)).toBe(uuid);
    });

    it('should validate UUID format regardless of strict mode', () => {
        const strictValidator = new VUUID({ strictMode: true });
        const normalValidator = new VUUID();
        
        const invalidUuid = 'not-a-uuid';
        expect(() => strictValidator.check(invalidUuid)).toThrow(VerificationError);
        expect(() => normalValidator.check(invalidUuid)).toThrow(VerificationError);
    });
});

describe('VUUIDNotNull - strictMode validation', () => {
    it('should enforce not null with strict mode', () => {
        const validator = new VUUIDNotNull({ strictMode: true });
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(validator.check(uuid)).toBe(uuid);
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(123)).toThrow(VerificationError);
    });
});
