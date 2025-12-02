import { Verifier } from "../verifier";
import { VerificationError } from "../../error/v_error";
import { getMessage, getValue, IMessageLanguage } from '../../languages/message';
import { VBadTypeMessage, VDefaultValue, VVCIsRequired, MessageType } from "../../interfaces/types";

interface VUUIDConditions extends VBadTypeMessage, VDefaultValue<string>, VVCIsRequired {
    version?: 1 | 2 | 3 | 4 | 5;
    allowNoHyphens?: boolean;
    strictMode?: MessageType<boolean, void>;
}

function vUUID(data: any, badTypeMessage: IMessageLanguage<void>, conds?: VUUIDConditions): string {
    if (getValue(conds?.strictMode) === true && typeof data !== 'string') {
        throw new VerificationError([{
            key: "",
            message: getMessage(conds?.badTypeMessage, undefined, badTypeMessage)
        }]);
    }

    let uuid = String(data);

    const hasHyphens = uuid.includes('-');

    if (!conds?.allowNoHyphens && !hasHyphens) {
        throw new VerificationError([{
            key: "",
            message: getMessage(undefined, undefined, {
                es: () => `UUID debe incluir guiones`,
                en: () => `UUID must include hyphens`
            })
        }]);
    }

    const normalized = uuid.replace(/-/g, "");

    if (normalized.length !== 32) {
        throw new VerificationError([{
            key: "",
            message: getMessage(undefined, undefined, {
                es: () => `UUID inválido, longitud incorrecta`,
                en: () => `Invalid UUID, wrong length`
            })
        }]);
    }

    const versionPattern = conds?.version ?? "[1-5]";
    const regex = new RegExp(`^[0-9a-f]{8}[0-9a-f]{4}${versionPattern}[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$`, "i");
    if (!regex.test(normalized)) {
        throw new VerificationError([{
            key: "",
            message: getMessage(undefined, undefined, {
                es: (values?: any) => `UUID inválido${conds?.version ? ` para versión ${conds.version}` : ""}`,
                en: (values?: any) => `Invalid UUID${conds?.version ? ` for version ${conds.version}` : ""}`
            })
        }]);
    }
    const formatted = [
        normalized.slice(0, 8),
        normalized.slice(8, 12),
        normalized.slice(12, 16),
        normalized.slice(16, 20),
        normalized.slice(20, 32)
    ].join('-');

    return formatted.toLowerCase();
}

export class VUUIDNotNull extends Verifier<string> {
    constructor(protected cond?: VUUIDConditions) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un UUID`,
            en: () => `must be a UUID`
        };
    }

    check(data: any): string {
        return vUUID(this.isRequired(data, true), this.badTypeMessage, this.cond);
    }
}

export class VUUID extends Verifier<string | null> {
    constructor(protected cond?: VUUIDConditions) {
        super(cond);
        this.badTypeMessage = {
            es: () => `debe ser un UUID`,
            en: () => `must be a UUID`
        };
    }

    check(data: any): string | null {
        const val = this.isRequired(data);
        if (val === null || val === undefined) return null;
        return vUUID(val, this.badTypeMessage, this.cond);
    }
}
