import { VerificationError } from "../../error/v_error";
import {
  MessageType,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import {
  getMessage,
  getValue,
  IMessageLanguage,
} from "../../languages/message";
import {
  ConditionMessageInput,
  conditionWithValue,
} from "../helpers/conditionMessage";
import { Verifier } from "../verifier";

/**
 * Configuracion aceptada por los verificadores booleanos.
 * @property strictMode Cuando es true, solo acepta `true` o `false` como tipo booleano nativo.
 */
export interface VBooleanConditions
  extends VBadTypeMessage, VDefaultValue<boolean>, VVCIsRequired {
  strictMode?: MessageType<boolean, void>;
}

const TRUE_VALUES = [true, 1, "1"] as const;
const FALSE_VALUES = [false, 0, "0"] as const;
const BOOLEAN_STRINGS = ["true", "false"] as const;

/**
 * Lanza `VerificationError` con un mensaje personalizado o el mensaje por defecto.
 * @param condition Condicion que aporta el mensaje personalizado (si existe).
 * @param badTypeMessage Mensaje multilenguaje fallback.
 */
function throwBooleanError(
  condition:
    | MessageType<boolean, void>
    | MessageType<void, void>
    | string
    | undefined,
  badTypeMessage: IMessageLanguage<void>,
): never {
  throw new VerificationError([
    {
      key: "",
      message: getMessage(condition, undefined, badTypeMessage),
    },
  ]);
}

/**
 * Convierte el dato recibido a booleano aplicando la politica segun `strictMode`.
 * En modo no estricto acepta `true/false`, `1/0` (numero o string), y los strings
 * `"true"/"false"` en cualquier capitalizacion.
 * @param data Dato a convertir.
 * @param badTypeMessage Mensaje por defecto si el tipo no es valido.
 * @param conds Configuracion del verificador.
 * @returns Valor booleano resultante.
 */
function vBoolean(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  conds?: VBooleanConditions,
): boolean {
  if (getValue(conds?.strictMode) === true) {
    if (typeof data !== "boolean") {
      throwBooleanError(
        conds?.strictMode ?? conds?.badTypeMessage,
        badTypeMessage,
      );
    }

    return data;
  }

  if (TRUE_VALUES.includes(data)) {
    return true;
  }

  if (FALSE_VALUES.includes(data)) {
    return false;
  }

  if (typeof data === "string") {
    const normalized = data.toLowerCase();
    if (
      BOOLEAN_STRINGS.includes(normalized as (typeof BOOLEAN_STRINGS)[number])
    ) {
      return normalized === "true";
    }
  }

  throwBooleanError(conds?.badTypeMessage, badTypeMessage);
}

/**
 * Verificador booleano que NO acepta null/undefined (siempre requerido).
 * @example
 * ```ts
 * Verifiers.BooleanNotNull().check("true"); // true
 * Verifiers.BooleanNotNull().strictMode().check("true"); // lanza error
 * ```
 */
export class VBooleanNotNull extends Verifier<boolean> {
  /**
   * Verifica y convierte el dato a booleano. Lanza si es null/undefined.
   * @param data Dato a verificar.
   * @returns Booleano resultante.
   */
  check(data: any): boolean {
    return vBoolean(
      this.isRequired(data, true, this.cond?.defaultValue),
      this.badTypeMessage,
      this.cond,
    );
  }

  /**
   * Habilita/deshabilita modo estricto (solo acepta booleanos nativos).
   * @param enabled Estado del modo estricto (default true).
   * @param message Mensaje de error personalizado.
   * @returns Nueva instancia con la configuracion aplicada.
   */
  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VBooleanNotNull {
    return new VBooleanNotNull({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  /**
   * Establece un valor por defecto cuando el dato esta ausente.
   * @param value Valor por defecto.
   * @returns Nueva instancia con el default configurado.
   */
  default(value: boolean): VBooleanNotNull {
    return new VBooleanNotNull({ ...this.cond, defaultValue: value });
  }

  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VBooleanConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un booleano`,
      en: () => `must be a boolean`,
    };
  }
}

/**
 * Verificador booleano que admite null/undefined (no requerido por defecto).
 * Llame a `.required()` o `.default()` para endurecer la regla.
 *
 * @example
 * ```ts
 * Verifiers.Boolean().check(null); // null
 * Verifiers.Boolean().required().check(null); // lanza error
 * ```
 */
export class VBoolean extends Verifier<boolean | null> {
  /**
   * Verifica el dato y devuelve booleano o null cuando esta ausente.
   * @param data Dato a verificar.
   * @returns Booleano o null.
   */
  check(data: any): boolean | null {
    let val = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (val === null || val === undefined) {
      return null;
    }
    return vBoolean(val, this.badTypeMessage, this.cond);
  }

  /**
   * Habilita el modo estricto (solo booleanos nativos son validos).
   * @param enabled Estado del modo (default true).
   * @param message Mensaje personalizado opcional.
   * @returns Nueva instancia de `VBoolean`.
   */
  strictMode(
    enabled = true,
    message?: ConditionMessageInput<boolean, void>,
  ): VBoolean {
    return new VBoolean({
      ...this.cond,
      strictMode: conditionWithValue<boolean, void>(enabled, message),
    });
  }

  /**
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VBooleanConditions) {
    super(cond);
    this.badTypeMessage = {
      es: () => `debe ser un booleano`,
      en: () => `must be a boolean`,
    };
  }

  /**
   * Convierte el verificador en su variante NotNull (valor requerido).
   * @returns Nueva instancia `VBooleanNotNull`.
   */
  required(): VBooleanNotNull {
    return new VBooleanNotNull(this.cond);
  }

  /**
   * Establece un valor por defecto. El resultado es `VBooleanNotNull`
   * porque siempre existira un valor.
   * @param value Valor a utilizar cuando no haya dato.
   */
  default(value: boolean): VBooleanNotNull {
    return new VBooleanNotNull({ ...this.cond, defaultValue: value });
  }
}
