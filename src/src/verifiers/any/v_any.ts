import { IInfo, VBadTypeMessage, VDefaultValue, VVCIsRequired } from "../../interfaces/types";
import { IMessageLanguage } from '../../languages/message';
import { Verifier } from "../verifier";

interface VAnyConditions extends VBadTypeMessage, VDefaultValue<number>, VVCIsRequired, IInfo<any> {
}

interface VAnyDefaultMessages {
    badTypeMessage: IMessageLanguage<void>
}

const dMessages: VAnyDefaultMessages = {
    badTypeMessage: {
        es: () => `debe ser un dato`,
        en: () => `must be a data`
    }
}



export class VAny extends Verifier<any | null> {
    check(data: any): number | null {
        return data;
    }
    constructor(protected cond?: VAnyConditions) {
        super(cond);
        this.cond = cond;
        this.badTypeMessage = dMessages.badTypeMessage;
    }
}
