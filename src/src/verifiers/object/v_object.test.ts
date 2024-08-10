import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";


describe('VObject', () => {
    const properties = {
        name: new V.VString({ minLength: 3 }),
        age: new V.VNumber({ min: 18, max: 99 })
    };

    it('should validate an object correctly', () => {
        const validator = new V.VObject({ properties });
        expect(validator.check({ name: 'John', age: 25 })).toEqual({ name: 'John', age: 25 });
        expect(validator.check(null)).toBeNull();
    });

    it('should throw a validation error for invalid properties', () => {
        const validator = new V.VObject({ properties, strictMode: true });
        expect(() => validator.check({ name: 'John', age: 25, extra: 'invalid' })).toThrow(VerificationError);
    });

    it('should throw a validation error for invalid property values', () => {
        const validator = new V.VObject({ properties });
        expect(() => validator.check({ name: 'Jo', age: 25 })).toThrow(VerificationError);
        expect(() => validator.check({ name: 'John', age: 17 })).toThrow(VerificationError);
    });

    it('should validate with ignoreCase for property names', () => {
        const validator = new V.VObject({ properties, ignoreCase: true });
        expect(validator.check({ NAME: 'John', AGE: 25 })).toEqual({ name: 'John', age: 25 });
    });

    it('should throw a validation error for invalidPropertyMessage', () => {
        const validator = new V.VObject({
            properties,
            strictMode: true,
            invalidPropertyMessage: { val: undefined, message: () => "invalid property" }
        });
        expect(() => validator.check({ name: 'John', age: 25, extra: 'invalid' })).toThrow(VerificationError);
    });
});

describe('VObjectNotNull', () => {
    const properties = {
        name: new V.VStringNotNull({ minLength: 3 }),
        age: new V.VNumberNotNull({ min: 18, max: 99 })
    };

    it('should validate a non-null object correctly', () => {
        const validator = new V.VObjectNotNull({ properties });
        expect(validator.check({ name: 'Jane', age: 30 })).toEqual({ name: 'Jane', age: 30 });
    });

    it('should throw a validation error for null or undefined', () => {
        const validator = new V.VObjectNotNull({ properties });
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(undefined)).toThrow(VerificationError);
    });

    it('should throw a validation error for invalid properties', () => {
        const validator = new V.VObjectNotNull({ properties, strictMode: true });
        expect(() => validator.check({ name: 'Jane', age: 30, extra: 'invalid' })).toThrow(VerificationError);
    });

    it('should throw a validation error for invalid property values', () => {
        const validator = new V.VObjectNotNull({ properties });
        expect(() => validator.check({ name: 'Ja', age: 30 })).toThrow(VerificationError);
        expect(() => validator.check({ name: 'Jane', age: 17 })).toThrow(VerificationError);
    });

    it('should validate with ignoreCase for property names', () => {
        const validator = new V.VObjectNotNull({ properties, ignoreCase: true });
        expect(validator.check({ NAME: 'Jane', AGE: 30 })).toEqual({ name: 'Jane', age: 30 });
    });

    it('should throw a validation error for invalidPropertyMessage', () => {
        const validator = new V.VObjectNotNull({
            properties,
            strictMode: true,
            invalidPropertyMessage: { val: undefined, message: () => "invalid property" }
        });
        expect(() => validator.check({ name: 'Jane', age: 30, extra: 'invalid' })).toThrow(VerificationError);
    });
});
