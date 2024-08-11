import moment, { Moment } from "moment-timezone";
import { IInfo, MessageType, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, getValue, IMessageLanguage } from "../../languages/message";
import { VerificationError } from "../../error/v_error";
import { Verifier } from "../verifier";
moment.suppressDeprecationWarnings = true;

interface VDateConditions extends VBadTypeMessage, VDefaultValue<Moment>, VVCIsRequired, IInfo<number | string | Date | moment.Moment> {
    format?: MessageType<string, { format: string }>;
    timeZone?: MessageType<string, { timeZone: string }>;
    maxDate?: MessageType<moment.Moment, { maxDate: moment.Moment }>;
    minDate?: MessageType<moment.Moment, { minDate: moment.Moment }>;
    default?: MessageType<moment.Moment, { default: moment.Moment }>;
}

interface VDateDefaultMessages {
    format: IMessageLanguage<{ format: string }>;
    timeZone: IMessageLanguage<{ timeZone: string }>;
    maxDate: IMessageLanguage<{ maxDate: moment.Moment }>;
    minDate: IMessageLanguage<{ minDate: moment.Moment }>;
    badTypeMessage: IMessageLanguage<void>
}

const dMessages: VDateDefaultMessages = {
    format: {
        es: (values: { format: string }) => `debe tener el formato ${values.format}`,
        en: (values: { format: string }) => `must have the format ${values.format}`
    },
    timeZone: {
        es: (values: { timeZone: string }) => `debe tener la zona horaria ${values.timeZone}`,
        en: (values: { timeZone: string }) => `must have the time zone ${values.timeZone}`
    },
    maxDate: {
        es: (values: { maxDate: moment.Moment }) => `debe ser menor o igual a ${values.maxDate.format()}`,
        en: (values: { maxDate: moment.Moment }) => `must be less or equal to ${values.maxDate.format()}`
    },
    minDate: {
        es: (values: { minDate: moment.Moment }) => `debe ser mayor o igual a ${values.minDate.format()}`,
        en: (values: { minDate: moment.Moment }) => `must be greater or equal to ${values.minDate.format()}`
    },
    badTypeMessage: {
        es: () => `debe ser una fecha`,
        en: () => `must be a date`
    }
}

function haveTimezone(input: any) {
    const regexDesplazamiento = /(?:UTC|GMT|[+-]\d{2}:?\d{2})$/;
    const regexIdentificadorZona = /(?:Europe\/|America\/|Asia\/|Africa\/|Australia\/|Antarctica\/|Atlantic\/|Indian\/|Pacific\/)[A-Za-z_]+/;
    return regexDesplazamiento.test(input) || regexIdentificadorZona.test(input);
}

function formatWithTimeZone(format: string) {
    return /Z{1,2}|z{1,2}/.test(format)
}

function vDate(data: any, badTypeMessage: IMessageLanguage<void>, conds?: VDateConditions): moment.Moment {
    let timeZone = getValue(conds?.timeZone) || "UTC"
    console.log(timeZone)
    if (data === '' || !(typeof data === 'number' || typeof data === 'string' || data instanceof Date || moment.isMoment(data))) {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
        }]);
    }

    let date: moment.Moment = moment();

    if (conds?.format) {
        let format = getValue(conds.format);
        date = moment(data, format, true);
        if (!date.isValid()) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds.format, { format: format }, dMessages.format)
            }]);
        }
        if (!formatWithTimeZone(format)) {
            date = moment.tz(date.format('YYYY-MM-DD HH:mm:ss'), timeZone)
        }
    } else {
        date = moment(data);
        if (typeof data === 'string' && !haveTimezone(data)) {
            date = moment.tz(date.format('YYYY-MM-DD HH:mm:ss'), timeZone)
        }

    }

    if (!date.isValid()) {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
        }]);
    }

    if (conds?.maxDate && date.isAfter(getValue(conds.maxDate))) {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds.maxDate, { maxDate: getValue(conds.maxDate) }, dMessages.maxDate)
        }]);
    }

    if (conds?.minDate && date.isBefore(getValue(conds.minDate))) {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds.minDate, { minDate: getValue(conds.minDate) }, dMessages.minDate)
        }]);
    }

    return date;
}


export class VDateNotNull extends Verifier<moment.Moment> {
    check(data: any): moment.Moment {
        return vDate(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VDateConditions) {
        super(cond);
        this.badTypeMessage = dMessages.badTypeMessage;
    }
}

export class VDate extends Verifier<moment.Moment | null> {
    check(data: any): moment.Moment | null {
        let val = this.isRequired(data);
        if (val === null || val === undefined) {
            return null;
        }
        return vDate(val, this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VDateConditions) {
        super(cond);
        this.cond = cond;
        this.badTypeMessage = dMessages.badTypeMessage;
    }
}
