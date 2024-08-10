import { Verifiers as V } from "../../../index";
import { VerificationError } from "../../error/v_error";

describe('VAny', () => {
    it('should validate data as any', () => {
        const validator = new V.VAny();
        expect(validator.check([1, 2, 3])).toEqual([1, 2, 3]);
        expect(validator.check(null)).toBeNull();
        expect(validator.check(1)).toEqual(1);
        expect(validator.check("TEST")).toEqual("TEST");

    });
});