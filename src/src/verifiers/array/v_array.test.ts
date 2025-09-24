import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe('VArray', () => {
    it('should validate arrays with valid data', () => {
        const validator = new V.Array({
            verifier: new V.NumberNotNull()
        });
        expect(validator.check([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should throw a validation error for arrays with invalid data', () => {
        const validator = new V.Array({
            verifier: new V.NumberNotNull()
        });
        expect(() => validator.check([1, "2a", 3])).toThrow(VerificationError);
    });

    it('should return null for null or undefined values', () => {
        const validator = new V.Array({
            verifier: new V.NumberNotNull()
        });
        expect(validator.check(null)).toBeNull();
    });

    it('should throw a validation error for arrays that do not meet minLength condition', () => {
        const validator = new V.Array({
            verifier: new V.NumberNotNull(),
            minLength: 3
        });
        expect(() => validator.check([1, 2])).toThrow(VerificationError);
    });

    it('should throw a validation error for arrays that exceed maxLength condition', () => {
        const validator = new V.Array({
            maxLength: 2,
            verifier: new V.NumberNotNull()
        });
        expect(() => validator.check([1, 2, 3])).toThrow(VerificationError);
    });
});

describe('VArrayNotNull', () => {
    it('should validate arrays with valid data', () => {
        const validator = new V.ArrayNotNull({
            verifier: new V.NumberNotNull()
        });
        expect(validator.check([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should throw a validation error for arrays with invalid data', () => {
        const validator = new V.ArrayNotNull({
            verifier: new V.NumberNotNull()
        });
        expect(() => validator.check([1, "2a", 3])).toThrow(VerificationError);
    });

    it('should throw a validation error for null or undefined values', () => {
        const validator = new V.ArrayNotNull({
            verifier: new V.NumberNotNull()
        });
        expect(() => validator.check(null)).toThrow(VerificationError);
        expect(() => validator.check(undefined)).toThrow(VerificationError);
    });

    it('should throw a validation error for arrays that do not meet minLength condition', () => {
        const validator = new V.ArrayNotNull({
            verifier: new V.NumberNotNull()
            , minLength: 3
        });
        expect(() => validator.check([1, 2])).toThrow(VerificationError);
    });

    it('should throw a validation error for arrays that exceed maxLength condition', () => {
        const validator = new V.ArrayNotNull({
            verifier: new V.NumberNotNull(),
            maxLength: 2
        });
        expect(() => validator.check([1, 2, 3])).toThrow(VerificationError);
    });
});