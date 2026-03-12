import {
  IInfo,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import { IMessageLanguage } from "../../languages/message";
import { Verifier } from "../verifier";

export interface VAnyConditions
  extends VBadTypeMessage, VDefaultValue<any>, VVCIsRequired, IInfo<any> {}

interface VAnyDefaultMessages {
  badTypeMessage: IMessageLanguage<void>;
}

const dMessages: VAnyDefaultMessages = {
  badTypeMessage: {
    es: () => `debe ser un dato`,
    en: () => `must be a value`,
  },
};

export class VAny extends Verifier<any | null> {
  check(data: any): any | null {
    const value = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (value === null || value === undefined) {
      return null;
    }
    return value;
  }
  constructor(protected cond?: VAnyConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }
}
