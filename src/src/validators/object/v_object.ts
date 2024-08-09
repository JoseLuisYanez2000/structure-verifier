import { ValidationError } from "../../error/v_error";
import { messageResp, MessageType, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { getMessage, IMessageLanguage, getValue } from '../../languages/message';
import { VAnyNotNull } from "../any/v_any";
import { VArray, VArrayNotNull } from "../array/v_array";
import { Validation } from "../validator";

interface VObjectConditions<T> extends VBadTypeMessage, VDefaultValue<T>, VVCIsRequired {
    invalidPropertyMessage?: MessageType<void, void>;
    strictMode?: boolean;
    ignoreCase?: boolean;
    takeAllValues?: boolean;
    properties: T;
}


function vObject<T extends Record<string, Validation<any>>>(data: any, badTypeMessage: IMessageLanguage<void>, conds: VObjectConditions<T>): { [K in keyof T]: ReturnType<T[K]['validate']> } {
    if (typeof data !== 'object' || Array.isArray(data)) {
        throw new ValidationError([{
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
            let error = new ValidationError(
                dif.map(v => {
                    return {
                        key: v, message: getMessage(conds.invalidPropertyMessage, undefined, {
                            es: () => "propiedad no válida",
                            en: () => "invalid property"
                        })
                    }
                })
            )
            if (error.errors.length > 0)
                throw error;
        }
    }
    let errors: messageResp[] = [];
    let value:any={}
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
            const result = conds.properties[keys.keyV].validate(data[keys.keyD]);
            value[keys.keyV] = result;
        } catch (error: any) {
            if (error instanceof ValidationError) {
                errors.push(...error.errorsObj.map(v => {
                    if (!v.key) v.key = keys.keyV
                    if (conds.properties[keys.keyV] instanceof VObject || conds.properties[keys.keyV] instanceof VObjectNotNull || conds.properties[keys.keyV] instanceof VArray || conds.properties[keys.keyV] instanceof VArrayNotNull || conds.properties[keys.keyV] instanceof VAnyNotNull)
                        v.parent = keys.keyV + (v.parent ? '.' + v.parent : '')
                    v.isEmpty = undefined
                    return v;
                }))
            } else {
                throw error;
            }

        }

    }
    if (errors.length > 0) {
        throw new ValidationError(errors)
    }
    return value;
}

export class VObjectNotNull<T extends Record<string, Validation<any>>> extends Validation<{ [K in keyof T]: ReturnType<T[K]['validate']> }> {
    validate(data: any): { [K in keyof T]: ReturnType<T[K]['validate']> } {
        return vObject(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
    constructor(protected cond: VObjectConditions<T>) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un objeto`,
            en: () => `must be a object`
        }
    }
}

export class VObject<T extends Record<string, Validation<any>>> extends Validation<{ [K in keyof T]: ReturnType<T[K]['validate']> } | null> {
    validate(data: any): { [K in keyof T]: ReturnType<T[K]['validate']> } | null {
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
