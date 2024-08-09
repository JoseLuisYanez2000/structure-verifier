import { ValidationError } from "../../error/v_error";
import { VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, IMessageLanguage } from '../../languages/message';
import { Validation } from "../validator";

interface VBooleanConditions extends VBadTypeMessage, VDefaultValue<boolean>, VVCIsRequired {
}


function vBoolean(data: any, badTypeMessage: IMessageLanguage<void>, conds?: VBooleanConditions): boolean {
    if (data !== '1' && data !== '0' && data !== 1 && data !== 0 && data !== true && data !== false && (typeof data !== 'string' || data.toLowerCase() !== 'true' && data.toLowerCase() !== 'false'))
        throw new ValidationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
        }])
    return data === '1' || data === 1 || data === true || (typeof data === 'string' && data.toLowerCase() === 'true');
}

export class VBooleanNotNull extends Validation<boolean> {
    validate(data: any): boolean {
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

export class VBoolean extends Validation<boolean | null> {
    validate(data: any): boolean | null {
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
