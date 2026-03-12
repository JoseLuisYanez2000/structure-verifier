import { Verifier } from "../verifier";
import { VerificationError } from "../../error/v_error";
import {
  getMessage,
  getValue,
  IMessageLanguage,
} from "../../languages/message";
import {
  ConditionMessageInput,
  conditionWithValue,
} from "../helpers/conditionMessage";
import {
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
  MessageType,
} from "../../interfaces/types";

export interface VUUIDConditions
  extends VBadTypeMessage, VDefaultValue<string>, VVCIsRequired {
  version?: 1 | 2 | 3 | 4 | 5;
  allowNoHyphens?: boolean;
  strictMode?: MessageType<boolean, void>;
}

const UUID_MESSAGES = {
  missingHyphens: {
    es: () => `UUID debe incluir guiones`,
    en: () => `UUID must include hyphens`,
  },
  invalidHyphenFormat: {
    es: () => `UUID debe tener formato 8-4-4-4-12`,
    en: () => `UUID must follow 8-4-4-4-12 format`,
  },
  invalidLength: {
    es: () => `UUID inválido, longitud incorrecta`,
    en: () => `Invalid UUID, wrong length`,
  },
};

function throwUUIDError(
  condition: MessageType<any, any> | string | undefined,
  badTypeMessage: IMessageLanguage<void>,
) {
  throw new VerificationError([
    {
      key: "",
      message: getMessage(condition, undefined, badTypeMessage),
    },
  ]);
}

function ensureUUIDType(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VUUIDConditions,
) {
  if (getValue(conds?.strictMode) === true && typeof data !== "string") {
    throwUUIDError(conds?.strictMode ?? conds?.badTypeMessage, badTypeMessage);
  }
}

function ensureUUIDHyphenPolicy(uuid: string, conds?: VUUIDConditions) {
  const hasHyphens = uuid.includes("-");

  if (conds?.allowNoHyphens) {
    return;
  }

  if (!hasHyphens) {
    throwUUIDError(undefined, UUID_MESSAGES.missingHyphens);
  }

  const hyphenatedFormat =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!hyphenatedFormat.test(uuid)) {
    throwUUIDError(undefined, UUID_MESSAGES.invalidHyphenFormat);
  }
}

function normalizeUUID(uuid: string) {
  return uuid.replace(/-/g, "");
}

function ensureUUIDLength(normalizedUuid: string) {
  if (normalizedUuid.length !== 32) {
    throwUUIDError(undefined, UUID_MESSAGES.invalidLength);
  }
}

function buildUUIDRegex(version?: VUUIDConditions["version"]) {
  const versionPattern = version ?? "[1-5]";
  return new RegExp(
    `^[0-9a-f]{8}[0-9a-f]{4}${versionPattern}[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$`,
    "i",
  );
}

function ensureUUIDVersion(normalizedUuid: string, conds?: VUUIDConditions) {
  const regex = buildUUIDRegex(conds?.version);
  if (!regex.test(normalizedUuid)) {
    throw new VerificationError([
      {
        key: "",
        message: getMessage(undefined, undefined, {
          es: () =>
            `UUID inválido${conds?.version ? ` para versión ${conds.version}` : ""}`,
          en: () =>
            `Invalid UUID${conds?.version ? ` for version ${conds.version}` : ""}`,
        }),
      },
    ]);
  }
}

function formatUUID(normalizedUuid: string) {
  return [
    normalizedUuid.slice(0, 8),
    normalizedUuid.slice(8, 12),
    normalizedUuid.slice(12, 16),
    normalizedUuid.slice(16, 20),
    normalizedUuid.slice(20, 32),
  ].join("-");
}

function vUUID(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VUUIDConditions,
): string {
  ensureUUIDType(data, badTypeMessage, conds);

  const uuid = String(data);
  ensureUUIDHyphenPolicy(uuid, conds);

  const normalizedUuid = normalizeUUID(uuid);
  ensureUUIDLength(normalizedUuid);
  ensureUUIDVersion(normalizedUuid, conds);

  return formatUUID(normalizedUuid).toLowerCase();
}

export class VUUIDNotNull extends Verifier<string> {
  constructor(protected cond?: VUUIDConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un UUID`,
      en: () => `must be a UUID`,
    };
  }

  check(data: any): string {
    return vUUID(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  version(v: 1 | 2 | 3 | 4 | 5): VUUIDNotNull {
    return new VUUIDNotNull({ ...this.cond, version: v });
  }

  allowNoHyphens(enabled = true): VUUIDNotNull {
    return new VUUIDNotNull({ ...this.cond, allowNoHyphens: enabled });
  }

  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VUUIDNotNull {
    return new VUUIDNotNull({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }
}

export class VUUID extends Verifier<string | null> {
  constructor(protected cond?: VUUIDConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un UUID`,
      en: () => `must be a UUID`,
    };
  }

  check(data: any): string | null {
    const val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) return null;
    return vUUID(val, this.badTypeMessage, this.cond);
  }

  version(v: 1 | 2 | 3 | 4 | 5): VUUID {
    return new VUUID({ ...this.cond, version: v });
  }

  allowNoHyphens(enabled = true): VUUID {
    return new VUUID({ ...this.cond, allowNoHyphens: enabled });
  }

  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VUUID {
    return new VUUID({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  required(): VUUIDNotNull {
    return new VUUIDNotNull(this.cond);
  }
}
