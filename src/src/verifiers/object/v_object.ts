import { VerificationError } from "../../error/v_error";
import { messageResp, MessageType, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, IMessageLanguage } from '../../languages/message';
import { VAny } from "../any/v_any";
import { VArray, VArrayNotNull } from "../array/v_array";
import { Verifier } from "../verifier";

interface VObjectConditions<T extends Record<string, Verifier<any>>> extends VBadTypeMessage, VDefaultValue<T>, VVCIsRequired {
    invalidPropertyMessage?: MessageType<void, void>;
    strictMode?: boolean;
    ignoreCase?: boolean;
    takeAllValues?: boolean;
    properties: T;
    conds?: (val: { [K in keyof T]: ReturnType<T[K]['check']> } | null) => void;
}

interface VObjectConditionsNotNull<T extends Record<string, Verifier<any>>> extends VBadTypeMessage, VDefaultValue<T>, VVCIsRequired {
    invalidPropertyMessage?: MessageType<void, void>;
    strictMode?: boolean;
    ignoreCase?: boolean;
    takeAllValues?: boolean;
    properties: T;
    conds?: (val: { [K in keyof T]: ReturnType<T[K]['check']> }) => void;
}

function vObject<T extends Record<string, Verifier<any>>>(data: any, badTypeMessage: IMessageLanguage<void>, conds: VObjectConditions<T> | VObjectConditionsNotNull<T>): { [K in keyof T]: ReturnType<T[K]['check']> } {
    if (typeof data !== 'object' || Array.isArray(data)) {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage != undefined ? conds?.badTypeMessage : undefined, undefined, badTypeMessage)
        }])
    }

    let keysData = Object.keys(data);
    let keysValidations = Object.keys(conds.properties);
    if (conds.strictMode) {
        let dif: string[] = []
        if (conds.ignoreCase) {
            let temp = keysValidations.map(v => v.toUpperCase())
            dif = keysData.filter(v => !temp.includes(v.toUpperCase()))
        }
        else
            dif = keysData.filter(v => !keysValidations.includes(v))
        if (dif.length > 0) {
            let error = new VerificationError(
                dif.map(v => {
                    return {
                        key: v, message: getMessage(conds.invalidPropertyMessage, undefined, {
                            es: () => "no es una propiedad válida",
                            en: () => "is not a valid property"
                        })
                    }
                })
            )
            if (error.errors.length > 0)
                throw error;
        }
    }
    let errors: messageResp[] = [];
    let value: any = {}
    let m: { keyV: string, keyD: string }[] = [];
    for (const key in conds.properties) {
        if (conds.ignoreCase) {
            let ketTemp = keysData.find(v => v.toLocaleUpperCase() == key.toUpperCase())
            if (ketTemp) {
                m.push({
                    keyV: key,
                    keyD: ketTemp
                })
            } else {
                m.push({
                    keyV: key,
                    keyD: key
                })
            }
        } else {
            m.push({
                keyV: key,
                keyD: key
            })
        }
    }
    if (conds.takeAllValues) {
        for (let k of keysData) {
            if (!m.find(v => v.keyD == k)) {
                value[k] = data[k];
            }
        }
    }
    for (let keys of m) {
        try {
            const result = conds.properties[keys.keyV].check(data[keys.keyD]);
            value[keys.keyV] = result;
        } catch (error: any) {
            if (error instanceof VerificationError) {
                errors.push(...error.errorsObj.map(v => {
                    let cond = conds.properties[keys.keyV];


                    if (cond instanceof VObject
                        || cond instanceof VObjectNotNull
                        || cond instanceof VArray
                        || cond instanceof VArrayNotNull
                        || cond instanceof VAny) {
                        v.key = keys.keyV + (v.key ? '.' + v.key : '');
                    } else {
                        v.key = keys.keyV
                    }

                    v.isEmpty = undefined
                    return v;
                }))
            } else {
                throw error;
            }

        }

    }
    if (errors.length > 0) {
        throw new VerificationError(errors)
    }
    if (conds.conds) {
        conds.conds(value);
    }
    return value;
}

export class VObjectNotNull<T extends Record<string, Verifier<any>>> extends Verifier<{ [K in keyof T]: ReturnType<T[K]['check']> }> {
    check(data: any): { [K in keyof T]: ReturnType<T[K]['check']> } {
        return vObject(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
    constructor(protected cond: VObjectConditionsNotNull<T>) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un objeto`,
            en: () => `must be a object`
        }
    }
}

export class VObject<T extends Record<string, Verifier<any>>> extends Verifier<{ [K in keyof T]: ReturnType<T[K]['check']> } | null> {
    check(data: any): { [K in keyof T]: ReturnType<T[K]['check']> } | null {
        let val = this.isRequired(data);
        if (val === null || val === undefined) {
            return null;
        }
        return vObject(val, this.badTypeMessage, this.cond);
    }
    constructor(protected cond: VObjectConditions<T>) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un objeto`,
            en: () => `must be a object`
        }
    }
}
