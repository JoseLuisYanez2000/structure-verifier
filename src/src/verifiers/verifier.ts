import { VerifierConfig } from "../config/verifierConfig";
import { VerificationError } from "../error/v_error";
import { VVCIsRequired } from "../interfaces/types";
import {
  getMessage,
  getValue,
  IMessageLanguage,
  MessageType,
} from "../languages/message";

/**
 * Tipo del mensaje aceptado por el metodo `refine`.
 * Puede ser un string literal o un objeto con traducciones `es`/`en`.
 */
export type RefineMessage = string | IMessageLanguage<void>;

/**
 * Resultado de una verificacion segura (`safeCheck`).
 * Discriminado por `success`: cuando es `true` expone `value` tipado;
 * cuando es `false` expone el `VerificationError` capturado.
 *
 * @typeParam T Tipo del valor verificado.
 */
export type SafeCheckResult<T> =
  | { success: true; value: T }
  | { success: false; error: VerificationError };

/**
 * Mensaje por defecto utilizado cuando `refine` no recibe mensaje personalizado.
 */
const defaultRefineMessage: IMessageLanguage<void> = {
  es: () => "valor inválido",
  en: () => "invalid value",
};

/**
 * Normaliza los keys entregados a `refine` a un arreglo de strings.
 * Si no se entregan keys, retorna `[""]` para aplicar el error al nivel raiz.
 * @param keys Key o lista de keys donde se adjuntara el error de `refine`.
 * @returns Arreglo de keys normalizado.
 */
export function normalizeRefineKeys(
  keys: string | string[] | undefined,
): string[] {
  if (keys === undefined) return [""];
  if (Array.isArray(keys)) return keys.length > 0 ? keys : [""];
  return [keys];
}

/**
 * Resuelve el texto final del mensaje de `refine`, aplicando el idioma
 * configurado en `VerifierConfig.lang` cuando corresponde.
 * @param message Mensaje provisto por el usuario (string o multilenguaje).
 * @returns Texto final a mostrar en el error.
 */
export function resolveRefineMessage(message?: RefineMessage): string {
  if (message === undefined) {
    return defaultRefineMessage[VerifierConfig.lang]();
  }
  if (typeof message === "string") {
    return message;
  }
  return message[VerifierConfig.lang]();
}

/**
 * Clase base abstracta para todos los verificadores de la libreria structure-verifier.
 * Define la interfaz comun (`check`), utilidades encadenables (`transform`, `refine`)
 * y la logica comun de `isRequired`.
 *
 * @typeParam T Tipo del valor retornado por `check` tras una verificacion exitosa.
 *
 * @example
 * ```ts
 * const v = Verifiers.StringNotNull().minLength(3);
 * const res = v.check("hola"); // "hola"
 * ```
 */
export abstract class Verifier<T> {
  /**
   * @param cond Configuracion base con `isRequired` y `emptyAsNull`.
   */
  constructor(protected cond?: VVCIsRequired) {}

  /**
   * Verifica el dato recibido y retorna el valor tipado o lanza `VerificationError`.
   * @param data Dato a verificar (cualquier tipo).
   * @returns Valor verificado y transformado al tipo `T`.
   */
  abstract check(data: any): T;

  /**
   * Verifica el dato recibido sin lanzar excepciones de validacion.
   * Ejecuta `check` y captura unicamente `VerificationError`; cualquier otro
   * error (de programacion) se propaga tal cual.
   *
   * @param data Dato a verificar (cualquier tipo).
   * @returns `{ success: true, value }` si la verificacion pasa,
   *          `{ success: false, error }` con el `VerificationError` si falla.
   *
   * @example
   * ```ts
   * const r = Verifiers.NumberNotNull().min(0).safeCheck("-1");
   * if (!r.success) console.log(r.error.errorsObj);
   * ```
   */
  safeCheck(data: any): SafeCheckResult<T> {
    try {
      return { success: true, value: this.check(data) };
    } catch (error) {
      if (error instanceof VerificationError) {
        return { success: false, error };
      }
      throw error;
    }
  }

  /**
   * Mensaje por defecto cuando el tipo de dato no es el esperado.
   * Cada subclase lo define en su constructor.
   */
  protected badTypeMessage: IMessageLanguage<void>;

  /**
   * Encadena una transformacion posterior a la verificacion.
   * El verificador resultante primero ejecuta el `check` original y luego
   * aplica `mapper` al resultado.
   *
   * NOTA: Al aplicar `transform` se rompe la cadena fluente de metodos especificos
   * (p.ej. `.min`, `.max`) ya que se retorna el `Verifier` generico.
   *
   * @typeParam R Tipo de salida tras la transformacion.
   * @param mapper Funcion que transforma el valor verificado.
   * @returns Un nuevo `Verifier<R>` que aplica la transformacion.
   *
   * @example
   * ```ts
   * Verifiers.StringNotNull().transform(s => s.length);
   * ```
   */
  transform<R>(mapper: (value: T) => R): Verifier<R> {
    const baseVerifier = this;

    return new (class extends Verifier<R> {
      check(data: any): R {
        return mapper(baseVerifier.check(data));
      }
    })();
  }

  /**
   * Anade una verificacion adicional basada en un predicado personalizado.
   * Si `predicate` devuelve `false`, se lanza `VerificationError` con el mensaje
   * indicado y asociado a los `keys` provistos.
   *
   * @param predicate Funcion que debe retornar `true` para considerar el valor valido.
   * @param message Mensaje de error (string o multilenguaje). Si no se provee, se usa el default.
   * @param keys Key o keys a los que se asociara el error (por defecto `""`).
   * @returns Un nuevo `Verifier<T>` con la restriccion aplicada.
   *
   * @example
   * ```ts
   * Verifiers.NumberNotNull().refine(n => n % 2 === 0, "debe ser par");
   * ```
   */
  refine(
    predicate: (value: T) => boolean,
    message?: RefineMessage,
    keys?: string | string[],
  ): Verifier<T> {
    const baseVerifier = this;
    const resolvedKeys = normalizeRefineKeys(keys);

    return new (class extends Verifier<T> {
      check(data: any): T {
        const value = baseVerifier.check(data);
        if (!predicate(value)) {
          const resolvedMessage = resolveRefineMessage(message);
          throw new VerificationError(
            resolvedKeys.map((k) => ({
              key: k,
              message: resolvedMessage,
            })),
          );
        }
        return value;
      }
    })();
  }

  /**
   * Evalua la regla "requerido" sobre el dato recibido.
   * - Aplica `defaultValue` cuando el dato es `undefined` o cuando es `null` y existe default.
   * - Si `emptyAsNull` esta habilitado, trata cadenas vacias como null.
   * - Si la regla de requerido esta activa y el valor sigue siendo null/undefined,
   *   lanza `VerificationError`.
   *
   * @param data Dato recibido.
   * @param isRequired Override puntual de la regla requerido por la subclase (ej. NotNull => true).
   * @param defaultValue Valor por defecto a asignar cuando el dato es ausente.
   * @returns El valor resuelto (listo para la verificacion especifica).
   */
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
          reqVal = { ...reqVal, val: isRequired };
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
