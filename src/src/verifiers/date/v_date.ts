
import { IInfo, MessageType, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, getValue, IMessageLanguage } from "../../languages/message";
import { VerificationError } from "../../error/v_error";
import { Verifier } from "../verifier";
import { datetime } from "../../utils/datetime";


interface VDateConditions extends VBadTypeMessage, VDefaultValue<datetime.Dayjs>, VVCIsRequired, IInfo<number | string | Date | datetime.Dayjs> {
    format?: MessageType<string, { format: string }>;
    timeZone?: MessageType<string, { timeZone: string }>;
    maxDate?: MessageType<datetime.Dayjs, { maxDate: datetime.Dayjs }>;
    minDate?: MessageType<datetime.Dayjs, { minDate: datetime.Dayjs }>;
    default?: MessageType<datetime.Dayjs, { default: datetime.Dayjs }>;
}

interface VDateDefaultMessages {
    format: IMessageLanguage<{ format: string }>;
    timeZone: IMessageLanguage<{ timeZone: string }>;
    maxDate: IMessageLanguage<{ maxDate: datetime.Dayjs }>;
    minDate: IMessageLanguage<{ minDate: datetime.Dayjs }>;
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
        es: (values: { maxDate: datetime.Dayjs }) => `debe ser menor o igual a ${values.maxDate.format()}`,
        en: (values: { maxDate: datetime.Dayjs }) => `must be less or equal to ${values.maxDate.format()}`
    },
    minDate: {
        es: (values: { minDate: datetime.Dayjs }) => `debe ser mayor o igual a ${values.minDate.format()}`,
        en: (values: { minDate: datetime.Dayjs }) => `must be greater or equal to ${values.minDate.format()}`
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

function vDate(data: any, badTypeMessage: IMessageLanguage<void>, conds?: VDateConditions): datetime.Dayjs {
    let timeZone = getValue(conds?.timeZone) || "UTC"
    if (data === '' || !(typeof data === 'number' || typeof data === 'string' || data instanceof Date || datetime.isDayjs(data))) {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
        }]);
    }

    let date: datetime.Dayjs = datetime();

    if (conds?.format) {
        let format = getValue(conds.format);
        date = datetime(data, format, true);
        if (!date.isValid()) {
            throw new VerificationError([{
                key: "",
                message: getMessage(conds.format, { format: format }, dMessages.format)
            }]);
        }
        if (!formatWithTimeZone(format)) {
            date = datetime.tz(date.format('YYYY-MM-DD HH:mm:ss'), timeZone)
        }
    } else {
        date = datetime(data);
        if (typeof data === 'string' && !haveTimezone(data)) {
            date = datetime.tz(date.format('YYYY-MM-DD HH:mm:ss'), timeZone)
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


export class VDateNotNull extends Verifier<datetime.Dayjs> {
    check(data: any): datetime.Dayjs {
        return vDate(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
    constructor(protected cond?: VDateConditions) {
        super(cond);
        this.badTypeMessage = dMessages.badTypeMessage;
    }
}

export class VDate extends Verifier<datetime.Dayjs | null> {
    check(data: any): datetime.Dayjs | null {
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
