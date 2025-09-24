import { VerifierConfig } from "../config/verifierConfig";
import { VerificationError } from "../error/v_error";
import { VVCIsRequired } from "../interfaces/types";
import { getMessage, IMessageLanguage, MessageType } from "../languages/message";

export abstract class Verifier<T> {
    constructor(protected cond?: VVCIsRequired) { }
    abstract check(data: any): T;
    protected badTypeMessage: IMessageLanguage<void>
    protected isRequired(data: any, isRequired?: boolean): T {
        let mReq: IMessageLanguage<void> = {
            es: () => "es requerido y",
            en: () => "is required and"
        }
        if (typeof data === 'string' && this.cond?.emptyAsNull === true) {
            if (data.length === 0) {
                data = null;
            }
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
            throw new VerificationError([{
                key: "",
                message: `${getMessage(reqVal, undefined, mReq)} ${this.badTypeMessage[VerifierConfig.lang]()}`,
                isEmpty: true
            }])
        }
        return data as T;
    }
}