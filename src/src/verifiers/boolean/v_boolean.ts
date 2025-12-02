import { VerificationError } from "../../error/v_error";
import { MessageType, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, getValue, IMessageLanguage } from '../../languages/message';
import { Verifier } from "../verifier";

interface VBooleanConditions extends VBadTypeMessage, VDefaultValue<boolean>, VVCIsRequired {
    strictMode?: MessageType<boolean, void>;
}


function vBoolean(data: any, badTypeMessage: IMessageLanguage<void>, conds?: VBooleanConditions): boolean {
    // Strict mode: only accept boolean type
    if (getValue(conds?.strictMode) === true) {
        if (typeof data !== 'boolean') {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
            }])
        }
        return data;
    }
    
    // Non-strict mode: accept boolean, number (1/0), or string representations
    const acceptedValues = [true, false, 1, 0, '1', '0'];
    const acceptedStrings = ['true', 'false'];
    
    if (acceptedValues.includes(data)) {
        return data === true || data === 1 || data === '1';
    }
    
    if (typeof data === 'string' && acceptedStrings.includes(data.toLowerCase())) {
        return data.toLowerCase() === 'true';
    }
    
    throw new VerificationError([{
        key: "",
        message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
    }])
}

export class VBooleanNotNull extends Verifier<boolean> {
    check(data: any): boolean {
        return vBoolean(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VBooleanConditions) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un booleano`,
            en: () => `must be a boolean`
        }
    }
}

export class VBoolean extends Verifier<boolean | null> {
    check(data: any): boolean | null {
        let val = this.isRequired(data);
        if (val === null || val === undefined) {
            return null;
        }
        return vBoolean(val, this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VBooleanConditions) {
        super(cond);
        this.cond = cond;
        this.badTypeMessage = {
            es: () => `debe ser un booleano`,
            en: () => `must be a boolean`
        }
    }
}
