import { VerificationError } from "../../error/v_error";
import { IInfo, MessageType, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, IMessageLanguage, getValue } from '../../languages/message';
import { Verifier } from "../verifier";

interface VNumberConditions extends VBadTypeMessage, VDefaultValue<number>, VVCIsRequired, IInfo<number> {
    min?: MessageType<number, { min: number }>;
    max?: MessageType<number, { max: number }>;
    in?: MessageType<number[], { in: number[] }>;
    notIn?: MessageType<number[], { notIn: number[] }>;
    maxDecimalPlaces?: MessageType<number, { maxDecimalPlaces: number }>;
    minDecimalPlaces?: MessageType<number, { minDecimalPlaces: number }>;
}

interface VNumberDefaultMessages {
    min: IMessageLanguage<{ min: number }>
    max: IMessageLanguage<{ max: number }>
    in: IMessageLanguage<{ in: number[] }>
    notIn: IMessageLanguage<{ notIn: number[] }>
    maxDecimalPlaces: IMessageLanguage<{ maxDecimalPlaces: number }>
    minDecimalPlaces: IMessageLanguage<{ minDecimalPlaces: number }>
    badTypeMessage: IMessageLanguage<void>
}

const dMessages: VNumberDefaultMessages = {
    min: {
        es: (values: { min: number; }) => `debe ser mayor o igual a ${values.min}`,
        en: (values: { min: number; }) => `must be greater or equal to ${values.min}`
    },
    max: {
        es: (values: { max: number; }) => `debe ser menor o igual a ${values.max}`,
        en: (values: { max: number; }) => `must be less or equal to ${values.max}`
    },
    in: {
        es: (values: { in: number[]; }) => `debe ser uno de los siguientes valores ${values.in.join(", ")}`,
        en: (values: { in: number[]; }) => `must be one of the following values ${values.in.join(", ")}`
    },
    notIn: {
        es: (values: { notIn: number[]; }) => `no debe ser uno de los siguientes valores ${values.notIn.join(", ")}`,
        en: (values: { notIn: number[]; }) => `must not be one of the following values ${values.notIn.join(", ")}`
    },
    maxDecimalPlaces: {
        es: (values: { maxDecimalPlaces: number; }) => `debe tener como máximo ${values.maxDecimalPlaces} decimales`,
        en: (values: { maxDecimalPlaces: number; }) => `must have at most ${values.maxDecimalPlaces} decimal places`
    },
    minDecimalPlaces: {
        es: (values: { minDecimalPlaces: number; }) => `debe tener como mínimo ${values.minDecimalPlaces} decimales`,
        en: (values: { minDecimalPlaces: number; }) => `must have at least ${values.minDecimalPlaces} decimal places`
    },
    badTypeMessage: {
        es: () => `debe ser un número`,
        en: () => `must be a number`
    }
}



function vNumber(data: any, badTypeMessage: IMessageLanguage<void>, conds?: VNumberConditions): number {
    if (data === '' || isNaN(data)) {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
        }])
    }
    if (conds?.min !== undefined) {
        if (data < conds?.min) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds?.min, { min: getValue(conds?.min) }, dMessages.min)
            }])
        }
    }
    if (conds?.max !== undefined) {
        if (data > conds?.max) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds?.max, { max: getValue(conds?.max) }, dMessages.max)
            }])
        }
    }
    if (conds?.in !== undefined) {
        if (!getValue(conds?.in).includes(data)) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds?.in, { in: getValue(conds?.in) }, dMessages.in)
            }])
        }
    }
    if (conds?.notIn !== undefined) {
        if (getValue(conds?.notIn).includes(data)) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds?.notIn, { notIn: getValue(conds?.notIn) }, dMessages.notIn)
            }])
        }
    }
    const decimalPart = data.toString().split(".")[1] || '';
    if (conds?.maxDecimalPlaces !== undefined) {
        if (decimalPart.length > getValue(conds?.maxDecimalPlaces)) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds?.maxDecimalPlaces, { maxDecimalPlaces: getValue(conds?.maxDecimalPlaces) }, dMessages.maxDecimalPlaces)
            }])
        }
    }
    if (conds?.minDecimalPlaces !== undefined) {
        if (decimalPart.length < getValue(conds?.minDecimalPlaces)) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds?.minDecimalPlaces, { minDecimalPlaces: getValue(conds?.minDecimalPlaces) }, dMessages.minDecimalPlaces)
            }])
        }
    }
    return Number(data);
}

export class VNumberNotNull extends Verifier<number> {
    check(data: any): number {
        return vNumber(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VNumberConditions) {
        super(cond);
        this.badTypeMessage = dMessages.badTypeMessage;
    }
}

export class VNumber extends Verifier<number | null> {
    check(data: any): number | null {
        let val = this.isRequired(data);
        if (val === null || val === undefined) {
            return null;
        }
        return vNumber(val, this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VNumberConditions) {
        super(cond);
        this.cond = cond;
        this.badTypeMessage = dMessages.badTypeMessage;
    }
}
