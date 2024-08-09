import { Validators as V } from "../../../index";
import { ValidationError } from "../../error/v_error";


describe('VObject', () => {
    const properties = {
        name: new V.VString({ minLength: 3 }),
        age: new V.VNumber({ min: 18, max: 99 })
    };

    it('should validate an object correctly', () => {
        const validator = new V.VObject({ properties });
        expect(validator.validate({ name: 'John', age: 25 })).toEqual({ name: 'John', age: 25 });
        expect(validator.validate(null)).toBeNull();
    });

    it('should throw a validation error for invalid properties', () => {
        const validator = new V.VObject({ properties, strictMode: true });
        expect(() => validator.validate({ name: 'John', age: 25, extra: 'invalid' })).toThrow(ValidationError);
    });

    it('should throw a validation error for invalid property values', () => {
        const validator = new V.VObject({ properties });
        expect(() => validator.validate({ name: 'Jo', age: 25 })).toThrow(ValidationError);
        expect(() => validator.validate({ name: 'John', age: 17 })).toThrow(ValidationError);
    });

    it('should validate with ignoreCase for property names', () => {
        const validator = new V.VObject({ properties, ignoreCase: true });
        expect(validator.validate({ NAME: 'John', AGE: 25 })).toEqual({ name: 'John', age: 25 });
    });

    it('should throw a validation error for invalidPropertyMessage', () => {
        const validator = new V.VObject({
            properties,
            strictMode: true,
            invalidPropertyMessage: {val:undefined, message: ()=>"invalid property"}
        });
        expect(() => validator.validate({ name: 'John', age: 25, extra: 'invalid' })).toThrow(ValidationError);
    });
});

describe('VObjectNotNull', () => {
    const properties = {
        name: new V.VStringNotNull({ minLength: 3 }),
        age: new V.VNumberNotNull({ min: 18, max: 99 })
    };

    it('should validate a non-null object correctly', () => {
        const validator = new V.VObjectNotNull({ properties });
        expect(validator.validate({ name: 'Jane', age: 30 })).toEqual({ name: 'Jane', age: 30 });
    });

    it('should throw a validation error for null or undefined', () => {
        const validator = new V.VObjectNotNull({ properties });
        expect(() => validator.validate(null)).toThrow(ValidationError);
        expect(() => validator.validate(undefined)).toThrow(ValidationError);
    });

    it('should throw a validation error for invalid properties', () => {
        const validator = new V.VObjectNotNull({ properties, strictMode: true });
        expect(() => validator.validate({ name: 'Jane', age: 30, extra: 'invalid' })).toThrow(ValidationError);
    });

    it('should throw a validation error for invalid property values', () => {
        const validator = new V.VObjectNotNull({ properties });
        expect(() => validator.validate({ name: 'Ja', age: 30 })).toThrow(ValidationError);
        expect(() => validator.validate({ name: 'Jane', age: 17 })).toThrow(ValidationError);
    });

    it('should validate with ignoreCase for property names', () => {
        const validator = new V.VObjectNotNull({ properties, ignoreCase: true });
        expect(validator.validate({ NAME: 'Jane', AGE: 30 })).toEqual({ name: 'Jane', age: 30 });
    });

    it('should throw a validation error for invalidPropertyMessage', () => {
        const validator = new V.VObjectNotNull({
            properties,
            strictMode: true,
            invalidPropertyMessage: {val:undefined, message: ()=>"invalid property"}
        });
        expect(() => validator.validate({ name: 'Jane', age: 30, extra: 'invalid' })).toThrow(ValidationError);
    });
});
