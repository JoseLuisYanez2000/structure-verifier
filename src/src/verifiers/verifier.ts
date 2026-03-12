import { VerifierConfig } from "../config/verifierConfig";
import { VerificationError } from "../error/v_error";
import { VVCIsRequired } from "../interfaces/types";
import {
  getMessage,
  getValue,
  IMessageLanguage,
  MessageType,
} from "../languages/message";

export abstract class Verifier<T> {
  constructor(protected cond?: VVCIsRequired) {}
  abstract check(data: any): T;
  protected badTypeMessage: IMessageLanguage<void>;

  transform<R>(mapper: (value: T) => R): Verifier<R> {
    const baseVerifier = this;

    return new (class extends Verifier<R> {
      check(data: any): R {
        return mapper(baseVerifier.check(data));
      }
    })();
  }

  protected isRequired(data: any, isRequired?: boolean, defaultValue?: T): T {
    let mReq: IMessageLanguage<void> = {
      es: () => "es requerido y",
      en: () => "is required and",
    };
    if (data === undefined || (data === null && defaultValue !== undefined)) {
      data = defaultValue;
    }
    if (typeof data === "string" && this.cond?.emptyAsNull === true) {
      if (data.length === 0) {
        data = null;
      }
    }
    let reqVal: MessageType<boolean, void> = false;
    if (this.cond?.isRequired !== undefined) {
      reqVal = this.cond.isRequired;
      if (isRequired !== undefined) {
        if (typeof reqVal === "boolean") {
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
    if (getValue(reqVal) === true && (data === null || data === undefined)) {
      throw new VerificationError([
        {
          key: "",
          message: `${getMessage(reqVal, undefined, mReq)} ${this.badTypeMessage[VerifierConfig.lang]()}`,
          isEmpty: true,
        },
      ]);
    }
    return data as T;
  }
}
