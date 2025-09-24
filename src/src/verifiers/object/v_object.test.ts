import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";


describe('VObject', () => {
    const properties = {
        name: new V.String({ minLength: 3 }),
        age: new V.Number({ min: 18, max: 99 })
    };

    it('should validate an object correctly', () => {
        const validator = new V.Object({ properties });
        expect(validator.check({ name: 'John', age: 25 })).toEqual({ name: 'John', age: 25 });
        expect(validator.check(null)).toBeNull();
    });

    it('should throw a validation error for invalid properties', () => {
        const validator = new V.Object({ properties, strictMode: true });
        expect(() => validator.check({ name: 'John', age: 25, extra: 'invalid' })).toThrow(VerificationError);
    });

    it('should throw a validation error for invalid property values', () => {
        const validator = new V.Object({ properties });
        expect(() => validator.check({ name: 'Jo', age: 25 })).toThrow(VerificationError);
        expect(() => validator.check({ name: 'John', age: 17 })).toThrow(VerificationError);
    });

    it('should validate with ignoreCase for property names', () => {
        const validator = new V.Object({ properties, ignoreCase: true });
        expect(validator.check({ NAME: 'John', AGE: 25 })).toEqual({ name: 'John', age: 25 });
    });

    it('should throw a validation error for invalidPropertyMessage', () => {
        const validator = new V.Object({
            properties,
            strictMode: true,
            invalidPropertyMessage: { val: undefined, message: () => "invalid property" }
        });
        expect(() => validator.check({ name: 'John', age: 25, extra: 'invalid' })).toThrow(VerificationError);
    });
});

describe('VObjectNotNull', () => {
    const properties = {
        name: new V.StringNotNull({ minLength: 3 }),
        age: new V.NumberNotNull({ min: 18, max: 99 })
    };

    it('should validate a non-null object correctly', () => {
        const validator = new V.ObjectNotNull({ properties });
        expect(validator.check({ name: 'Jane', age: 30 })).toEqual({ name: 'Jane', age: 30 });
    });

    it('should throw a validation error for null or undefined', () => {
        const validator = new V.ObjectNotNull({ properties });
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(undefined)).toThrow(VerificationError);
    });

    it('should throw a validation error for invalid properties', () => {
        const validator = new V.ObjectNotNull({ properties, strictMode: true });
        expect(() => validator.check({ name: 'Jane', age: 30, extra: 'invalid' })).toThrow(VerificationError);
    });

    it('should throw a validation error for invalid property values', () => {
        const validator = new V.ObjectNotNull({ properties });
        expect(() => validator.check({ name: 'Ja', age: 30 })).toThrow(VerificationError);
        expect(() => validator.check({ name: 'Jane', age: 17 })).toThrow(VerificationError);
    });

    it('should validate with ignoreCase for property names', () => {
        const validator = new V.ObjectNotNull({ properties, ignoreCase: true });
        expect(validator.check({ NAME: 'Jane', AGE: 30 })).toEqual({ name: 'Jane', age: 30 });
    });

    it('should throw a validation error for invalidPropertyMessage', () => {
        const validator = new V.ObjectNotNull({
            properties,
            strictMode: true,
            invalidPropertyMessage: { val: undefined, message: () => "invalid property" }
        });
        expect(() => validator.check({ name: 'Jane', age: 30, extra: 'invalid' })).toThrow(VerificationError);
    });
});
