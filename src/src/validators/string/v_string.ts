import { ValidationError } from "../../error/v_error";
import { MessageType, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, IMessageLanguage, getValue } from '../../languages/message';
import { Validation } from "../validator";

interface VStringConditions extends VBadTypeMessage, VDefaultValue<string>, VVCIsRequired {
    minLength?: MessageType<number, { minLength: number }>;
    maxLength?: MessageType<number, { maxLength: number }>;
    regex?: MessageType<RegExp, { regex: RegExp }>;
    notRegex?: MessageType<RegExp, { notRegex: RegExp }>;
    in?: MessageType<string[], { in: string[] }>;
    notIn?: MessageType<string[], { notIn: string[] }>;
    strictMode?: MessageType<boolean, void>;
    ignoreCase?: MessageType<boolean, void>;
}


function vString(data: any, badTypeMessage: IMessageLanguage<void>, conds?: VStringConditions): string {
    if (typeof data !== 'string' && conds?.strictMode === true) {
        throw new ValidationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
        }])
    }
    data = String(data);
    if (conds?.minLength !== undefined) {
        if (data.length < conds?.minLength) {
            throw new ValidationError([{
                key: "",
                message: getMessage(conds?.minLength, { minLength: getValue(conds?.minLength) }, {
                    es: (values: { minLength: number; }) => `debe tener una longitud mínima de ${values.minLength}`,
                    en: (values: { minLength: number; }) => `must have a minimum length of ${values.minLength}`
                })
            }])
        }
    }
    if (conds?.maxLength !== undefined) {
        if (data.length > conds?.maxLength) {
            throw new ValidationError([{
                key: "",
                message: getMessage(conds?.maxLength, { maxLength: getValue(conds?.maxLength) }, {
                    es: (values: { maxLength: number; }) => `debe tener una longitud máxima de ${values.maxLength}`,
                    en: (values: { maxLength: number; }) => `must have a maximum length of ${values.maxLength}`
                })
            }])
        }
    }
    if (conds?.regex !== undefined) {
        if (!getValue(conds?.regex).test(data)) {
            throw new ValidationError([{
                key: "",
                message: getMessage(conds?.regex, { regex: getValue(conds?.regex) }, {
                    es: (values: { regex: RegExp; }) => `debe cumplir con el patrón ${values.regex}`,
                    en: (values: { regex: RegExp; }) => `must match the pattern ${values.regex}`
                })
            }])
        }
    }
    if (conds?.notRegex !== undefined) {
        if (getValue(conds?.notRegex).test(data)) {
            throw new ValidationError([{
                key: "",
                message: getMessage(conds?.notRegex, { notRegex: getValue(conds?.notRegex) }, {
                    es: (values: { notRegex: RegExp; }) => `no debe cumplir con el patrón ${values.notRegex}`,
                    en: (values: { notRegex: RegExp; }) => `must not match the pattern ${values.notRegex}`
                })
            }])
        }
    }
    if (conds?.in !== undefined) {
        if (conds?.ignoreCase === true) {
            if (!getValue(conds?.in).map(x => x.toLowerCase()).includes(data.toLowerCase())) {
                throw new ValidationError([{
                    key: "",
                    message: getMessage(conds?.in, { in: getValue(conds?.in) }, {
                        es: (values: { in: string[]; }) => `debe ser uno de los siguientes valores ${values.in.join(", ")}`,
                        en: (values: { in: string[]; }) => `must be one of the following values ${values.in.join(", ")}`
                    })
                }])
            }
        } else {
            if (!getValue(conds?.in).includes(data)) {
                throw new ValidationError([{
                    key: "",
                    message: getMessage(conds?.in, { in: getValue(conds?.in) }, {
                        es: (values: { in: string[]; }) => `debe ser uno de los siguientes valores ${values.in.join(", ")}`,
                        en: (values: { in: string[]; }) => `must be one of the following values ${values.in.join(", ")}`
                    })
                }])
            }
        }
    }
    if (conds?.notIn !== undefined) {
        if (conds?.ignoreCase === true) {
            if (getValue(conds?.notIn).map(x => x.toLowerCase()).includes(data.toLowerCase())) {
                throw new ValidationError([{
                    key: "",
                    message: getMessage(conds?.notIn, { notIn: getValue(conds?.notIn) }, {
                        es: (values: { notIn: string[]; }) => `no debe ser uno de los siguientes valores ${values.notIn.join(", ")}`,
                        en: (values: { notIn: string[]; }) => `must not be one of the following values ${values.notIn.join(", ")}`
                    })
                }])
            }
        } else {
            if (getValue(conds?.notIn).includes(data)) {
                throw new ValidationError([{
                    key: "",
                    message: getMessage(conds?.notIn, { notIn: getValue(conds?.notIn) }, {
                        es: (values: { notIn: string[]; }) => `no debe ser uno de los siguientes valores ${values.notIn.join(", ")}`,
                        en: (values: { notIn: string[]; }) => `must not be one of the following values ${values.notIn.join(", ")}`
                    })
                }])
            }
        }
    }
    return data;

}

export class VStringNotNull extends Validation<string> {
    validate(data: any): string {
        return vString(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VStringConditions) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un texto`,
            en: () => `must be a string`
        }
    }
}

export class VString extends Validation<string | null> {
    validate(data: any): string | null {
        let val = this.isRequired(data);
        if (val === null || val === undefined) {
            return null;
        }
        return vString(val, this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VStringConditions) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un texto`,
            en: () => `must be a string`
        }
    }
}
