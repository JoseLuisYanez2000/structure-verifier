import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe('VUUID', () => {
    it('should validate a correct UUID with hyphens', () => {
        const validator = new V.UUID();
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        expect(validator.check(uuid)).toBe(uuid.toLowerCase());
    });

    it('should validate a correct UUID without hyphens if allowNoHyphens is true', () => {
        const validator = new V.UUID({ allowNoHyphens: true });
        const uuidNoHyphen = '123e4567e89b12d3a456426614174000';
        expect(validator.check(uuidNoHyphen)).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error for UUID without hyphens if allowNoHyphens is false', () => {
        const validator = new V.UUID({ allowNoHyphens: false });
        const uuidNoHyphen = '123e4567e89b12d3a456426614174000';
        expect(() => validator.check(uuidNoHyphen)).toThrow(VerificationError);
    });

    it('should throw error for invalid UUID format', () => {
        const validator = new V.UUID();
        const invalidUuid = '123e4567-e89b-12d3-a456-426614174zzz';
        expect(() => validator.check(invalidUuid)).toThrow(VerificationError);
    });

    it('should return null for null or undefined values', () => {
        const validator = new V.UUID();
        expect(validator.check(null)).toBeNull();
        expect(validator.check(undefined)).toBeNull();
    });

    it('should validate UUID for a specific version', () => {
        const validator = new V.UUID({ version: 4, allowNoHyphens: true });
        const uuidV4 = '550e8400-e29b-41d4-a716-446655440000';
        expect(validator.check(uuidV4)).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should throw error if UUID version does not match', () => {
        const validator = new V.UUID({ version: 4 });
        const uuidV1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // v1
        expect(() => validator.check(uuidV1)).toThrow(VerificationError);
    });
});

describe('VUUIDNotNull', () => {
    it('should validate a non-null UUID correctly', () => {
        const validator = new V.UUIDNotNull();
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        expect(validator.check(uuid)).toBe(uuid.toLowerCase());
    });

    it('should throw error for null or undefined', () => {
        const validator = new V.UUIDNotNull();
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(undefined)).toThrow(VerificationError);
    });

    it('should validate UUID without hyphens if allowNoHyphens is true', () => {
        const validator = new V.UUIDNotNull({ allowNoHyphens: true });
        const uuidNoHyphen = '123e4567e89b12d3a456426614174000';
        expect(validator.check(uuidNoHyphen)).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error for invalid UUID', () => {
        const validator = new V.UUIDNotNull();
        const invalidUuid = 'invalid-uuid-0000-0000-0000-000000000000';
        expect(() => validator.check(invalidUuid)).toThrow(VerificationError);
    });

    it('should validate UUID for a specific version', () => {
        const validator = new V.UUIDNotNull({ version: 4, allowNoHyphens: true });
        const uuidV4 = '550e8400e29b41d4a716446655440000';
        expect(validator.check(uuidV4)).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
});
