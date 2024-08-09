import { ValConfig } from "../config/validatorConfig";
import { ValidationError } from "../error/v_error";
import { VVCIsRequired } from "../interfaces/types";
import { getMessage, getValue, IMessageLanguage, MessageType } from "../languages/message";

export abstract class Validation<T> {
    constructor(protected cond?: VVCIsRequired) { }
    abstract validate(data: any): T;
    protected badTypeMessage: IMessageLanguage<void>
    protected isRequired(data: any, isRequired?: boolean): T {
        let mReq: IMessageLanguage<void> = {
            es: () => "es requerido y",
            en: () => "is required and"
        }
        let reqVal: MessageType<boolean, void> = false;
        if (this.cond?.isRequired !== undefined) {
            reqVal = this.cond.isRequired;
            if (isRequired !== undefined) {
                if (typeof reqVal === 'boolean') {
                    reqVal = isRequired;
                } else {
                    reqVal.val = isRequired;
                }
            }
        } else {
            if (isRequired !== undefined) {
                reqVal = isRequired;
            }
        }
        if (isRequired && (data === null || data === undefined)) {
            throw new ValidationError([{
                key: "",
                message: `${getMessage(reqVal, undefined, mReq)} ${this.badTypeMessage[ValConfig.lang]()}`
            }])
        }
        return data as T;
    }
}