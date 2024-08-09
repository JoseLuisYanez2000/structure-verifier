import { messageResp } from "../interfaces/types";

export class ValidationError extends Error {
    private _errors: string[] = []
    private _errorsObj: messageResp[] = []
    constructor(messages: messageResp[]) {
        super(messages.map(v => `${v.parent ? v.parent + '.' : ''}${v.key} ${v.message}`).join(';'));
        this.name = "ValidationError";
        this._errors = messages.map(v => `${v.parent ? v.parent + '.' : ''}${v.key ? v.key + ' ' : ''}${v.message}`)
        this._errorsObj = messages
    }
    get errors() {
        return this._errors.map(v => {
            return {
                message: v
            }
        })
    }

    get errorsOnlyString() {
        return this._errors
    }
    get errorsObj() {
        return this._errorsObj
    }

}