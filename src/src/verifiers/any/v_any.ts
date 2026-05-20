import {
  IInfo,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import { IMessageLanguage } from "../../languages/message";
import { Verifier } from "../verifier";

/**
 * Configuracion para el verificador `VAny`.
 * Soporta mensaje de tipo invalido, valor por defecto, requerido e info documental.
 */
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

/**
 * Verificador que acepta cualquier tipo de dato sin restricciones de tipo.
 * Util cuando solo se necesita aplicar la regla de requerido o un valor por defecto.
 *
 * @example
 * ```ts
 * Verifiers.Any().check(123);           // 123
 * Verifiers.Any().default("x").check(undefined); // "x"
 * ```
 */
export class VAny extends Verifier<any | null> {
  /**
   * Verifica el dato. Devuelve `null` si el valor es null/undefined (sin default),
   * en otro caso lo devuelve tal cual.
   * @param data Dato a verificar.
   * @returns El dato original o null.
   */
  check(data: any): any | null {
    const value = this.isRequired(data, undefined, this.cond?.defaultValue);
    if (value === null || value === undefined) {
      return null;
    }
    return value;
  }

  /**
   * Crea una nueva instancia de `VAny`.
   * @param cond Configuracion opcional.
   */
  constructor(protected cond?: VAnyConditions) {
    super(cond);
    this.badTypeMessage = dMessages.badTypeMessage;
  }

  /**
   * Retorna una nueva instancia con el valor por defecto indicado.
   * @param value Valor a utilizar cuando el dato sea null/undefined.
   * @returns Nueva instancia de `VAny`.
   */
  default(value: any): VAny {
    return new VAny({ ...this.cond, defaultValue: value });
  }
}
