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

/**
 * Configuracion aceptada por los verificadores de UUID.
 * @property version Restringe la verificacion a una version especifica de UUID (1..5).
 * @property allowNoHyphens Permite aceptar UUIDs sin guiones (formato compacto de 32 chars).
 * @property strictMode Cuando es true, exige que el dato ya sea string (no se convierte).
 */
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

const UUID_REGEX_CACHE = new Map<string, RegExp>();

/**
 * Lanza `VerificationError` con el mensaje personalizado o el mensaje por defecto.
 */
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

/**
 * Verifica que el dato sea un string. En modo estricto usa el mensaje asociado a `strictMode`.
 */
function ensureUUIDType(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VUUIDConditions,
) {
  if (typeof data !== "string") {
    const isStrict = getValue(conds?.strictMode) === true;
    throwUUIDError(
      isStrict
        ? (conds?.strictMode ?? conds?.badTypeMessage)
        : conds?.badTypeMessage,
      badTypeMessage,
    );
  }
}

/**
 * Aplica la politica de guiones segun `allowNoHyphens`.
 * Si no se permiten guiones opcionales, exige el formato 8-4-4-4-12.
 */
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

/**
 * Quita los guiones para obtener la forma compacta de 32 caracteres.
 */
function normalizeUUID(uuid: string) {
  return uuid.replace(/-/g, "");
}

/**
 * Verifica que el UUID normalizado tenga exactamente 32 caracteres.
 */
function ensureUUIDLength(normalizedUuid: string) {
  if (normalizedUuid.length !== 32) {
    throwUUIDError(undefined, UUID_MESSAGES.invalidLength);
  }
}

/**
 * Obtiene (y cachea) la expresion regular para validar la version del UUID.
 * Si `version` es undefined, acepta cualquier version entre 1 y 5.
 */
function getUUIDRegex(version?: VUUIDConditions["version"]) {
  const cacheKey = version === undefined ? "any" : String(version);
  const cached = UUID_REGEX_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const versionPattern = version ?? "[1-5]";
  const created = new RegExp(
    `^[0-9a-f]{8}[0-9a-f]{4}${versionPattern}[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$`,
    "i",
  );
  UUID_REGEX_CACHE.set(cacheKey, created);
  return created;
}

/**
 * Valida que el UUID cumpla el patron de version esperado (1..5 o "cualquiera").
 */
function ensureUUIDVersion(normalizedUuid: string, conds?: VUUIDConditions) {
  const regex = getUUIDRegex(conds?.version);
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

/**
 * Re-inserta los guiones en un UUID compacto siguiendo el formato 8-4-4-4-12.
 */
function formatUUID(normalizedUuid: string) {
  return [
    normalizedUuid.slice(0, 8),
    normalizedUuid.slice(8, 12),
    normalizedUuid.slice(12, 16),
    normalizedUuid.slice(16, 20),
    normalizedUuid.slice(20, 32),
  ].join("-");
}

/**
 * Verifica y normaliza un UUID. La salida siempre es el UUID con guiones en minusculas.
 * @param data Dato a verificar.
 * @param badTypeMessage Mensaje multilenguaje de tipo invalido.
 * @param conds Configuracion del verificador.
 * @returns UUID normalizado (formato 8-4-4-4-12 en minusculas).
 */
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

/**
 * Verificador de UUID que NO acepta null/undefined (siempre requerido).
 *
 * @example
 * ```ts
 * Verifiers.UUIDNotNull().version(4).check("3f0b..."); // UUID v4 normalizado
 * ```
 */
export class VUUIDNotNull extends Verifier<string> {
  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VUUIDConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un UUID`,
      en: () => `must be a UUID`,
    };
  }

  /**
   * Verifica y normaliza el UUID. Lanza si es null/undefined o invalido.
   * @param data Dato a verificar.
   * @returns UUID normalizado en minusculas con guiones.
   */
  check(data: any): string {
    return vUUID(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  /**
   * Restringe la verificacion a una version especifica del UUID.
   * @param v Version permitida (1..5).
   */
  version(v: 1 | 2 | 3 | 4 | 5): VUUIDNotNull {
    return new VUUIDNotNull({ ...this.cond, version: v });
  }

  /**
   * Permite aceptar UUIDs sin guiones (32 chars hexadecimales).
   */
  allowNoHyphens(enabled = true): VUUIDNotNull {
    return new VUUIDNotNull({ ...this.cond, allowNoHyphens: enabled });
  }

  /**
   * Activa el modo estricto (exige que el dato sea string).
   */
  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VUUIDNotNull {
    return new VUUIDNotNull({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  /**
   * Establece un UUID por defecto.
   */
  default(value: string): VUUIDNotNull {
    return new VUUIDNotNull({ ...this.cond, defaultValue: value });
  }
}

/**
 * Verificador de UUID que acepta null/undefined (opcional por defecto).
 * Use `.required()` o `.default()` para obtener la variante requerida.
 */
export class VUUID extends Verifier<string | null> {
  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VUUIDConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un UUID`,
      en: () => `must be a UUID`,
    };
  }

  /**
   * Verifica y normaliza el UUID o retorna null si el dato esta ausente.
   * @param data Dato a verificar.
   * @returns UUID normalizado o null.
   */
  check(data: any): string | null {
    const val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) return null;
    return vUUID(val, this.badTypeMessage, this.cond);
  }

  /**
   * Restringe la verificacion a una version especifica (1..5).
   */
  version(v: 1 | 2 | 3 | 4 | 5): VUUID {
    return new VUUID({ ...this.cond, version: v });
  }

  /**
   * Permite aceptar UUIDs sin guiones (32 chars hexadecimales).
   */
  allowNoHyphens(enabled = true): VUUID {
    return new VUUID({ ...this.cond, allowNoHyphens: enabled });
  }

  /**
   * Activa el modo estricto (exige que el dato sea string).
   */
  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VUUID {
    return new VUUID({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  /**
   * Convierte el verificador en su variante `VUUIDNotNull` (requerido).
   */
  required(): VUUIDNotNull {
    return new VUUIDNotNull(this.cond);
  }

  /**
   * Establece un UUID por defecto. Resultado: `VUUIDNotNull`.
   */
  default(value: string): VUUIDNotNull {
    return new VUUIDNotNull({ ...this.cond, defaultValue: value });
  }
}
