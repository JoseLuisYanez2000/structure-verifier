import { messageResp } from "../interfaces/types";

export class VerificationError extends Error {
    private _errors: string[] = []
    private _errorsObj: messageResp[] = []
    constructor(messages: messageResp[]) {
        super(messages.map(v => `${v.parent ? v.parent + '.' : ''}${v.key} ${v.message}`).join(';'));
        this.name = "VerificationError";
        this._errors = messages.map(v => `${v.parent ? v.parent + '.' : ''}${v.key ? v.key + ' ' : ''}${v.message}`)
        this._errorsObj = messages
    }
    get errors() {
        return this._errors
    }
    get errorsObj() {
        return this._errorsObj
    }

}