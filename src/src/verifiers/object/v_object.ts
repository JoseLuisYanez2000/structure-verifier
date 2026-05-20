import { VerificationError } from "../../error/v_error";
import {
  messageResp,
  MessageType,
  VBadTypeMessage,
  VDefaultValue,
  VVCIsRequired,
} from "../../interfaces/types";
import { getMessage, IMessageLanguage } from "../../languages/message";
import { VAny } from "../any/v_any";
import { VArray, VArrayNotNull } from "../array/v_array";
import {
  normalizeRefineKeys,
  RefineMessage,
  resolveRefineMessage,
  Verifier,
} from "../verifier";

type ObjectKey<T> = Extract<keyof T, string>;

/**
 * Conjunto de claves aceptadas por `refine` en un verificador de objeto.
 * Puede ser una clave simple o una lista de claves del objeto esquema.
 */
export type VObjectRefineKeys<T extends Record<string, Verifier<any>>> =
  | ObjectKey<T>
  | ObjectKey<T>[];

/**
 * Configuracion aceptada por `VObject` (variante opcional).
 * @typeParam T Forma del objeto (mapa de claves a verificadores).
 * @property invalidPropertyMessage Mensaje al encontrar propiedades no declaradas cuando `strictMode` esta activo.
 * @property strictMode Prohibe propiedades no declaradas en el esquema.
 * @property ignoreCase Realiza coincidencias de keys ignorando mayusculas/minusculas.
 * @property takeAllValues Conserva en la salida las propiedades no declaradas en el esquema.
 * @property conds Verificacion personalizada posterior (puede lanzar VerificationError).
 */
export interface VObjectConditions<T extends Record<string, Verifier<any>>>
  extends
    VBadTypeMessage,
    VDefaultValue<{ [K in keyof T]: ReturnType<T[K]["check"]> }>,
    VVCIsRequired {
  invalidPropertyMessage?: MessageType<void, void>;
  strictMode?: boolean;
  ignoreCase?: boolean;
  takeAllValues?: boolean;
  conds?: (
    val:
      | { [K in keyof T]: ReturnType<T[K]["check"]> }
      | null
      | undefined,
  ) => void;
}

/**
 * Configuracion aceptada por `VObjectNotNull` (variante requerida).
 * Igual que `VObjectConditions` pero `conds` recibe el objeto ya verificado (no-null).
 * @typeParam T Forma del objeto (mapa de claves a verificadores).
 */
export interface VObjectConditionsNotNull<
  T extends Record<string, Verifier<any>>,
>
  extends
    VBadTypeMessage,
    VDefaultValue<{ [K in keyof T]: ReturnType<T[K]["check"]> }>,
    VVCIsRequired {
  invalidPropertyMessage?: MessageType<void, void>;
  strictMode?: boolean;
  ignoreCase?: boolean;
  takeAllValues?: boolean;
  conds?: (val: { [K in keyof T]: ReturnType<T[K]["check"]> }) => void;
}

/**
 * Claves consideradas inseguras porque pueden corromper el prototipo del objeto.
 * Cuando se escribe en ellas se usa `Object.defineProperty` para evitar prototype pollution.
 */
const UNSAFE_OBJECT_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Asigna un valor a una propiedad de forma segura para evitar prototype pollution.
 * @param target Objeto destino.
 * @param key Nombre de la propiedad.
 * @param value Valor a asignar.
 */
function setObjectValue(target: Record<string, any>, key: string, value: any) {
  if (UNSAFE_OBJECT_KEYS.has(key)) {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return;
  }

  target[key] = value;
}

/**
 * Obtiene un valor por su descriptor propio (evita heredar de prototype).
 * @param source Objeto fuente.
 * @param key Propiedad a leer.
 */
function getObjectValue(source: Record<string, any>, key: string) {
  const descriptor = Object.getOwnPropertyDescriptor(source, key);
  return descriptor ? descriptor.value : source[key];
}

/**
 * Indica si el verificador es anidado (objeto, array, any) para construir rutas de error.
 */
function isNestedVerifier(verifier: Verifier<any>) {
  return (
    verifier instanceof VObject ||
    verifier instanceof VObjectNotNull ||
    verifier instanceof VArray ||
    verifier instanceof VArrayNotNull ||
    verifier instanceof VAny
  );
}

/**
 * Verifica que el dato sea un objeto (no array, no null) y que sus propiedades
 * cumplan el esquema `properties`. Opcionalmente aplica modo estricto,
 * comparacion case-insensitive, propaga propiedades extra y/o ejecuta un
 * verificador cruzado `conds`.
 *
 * @typeParam T Forma del esquema (keys -> Verifier).
 * @param data Dato a verificar.
 * @param badTypeMessage Mensaje fallback si no es objeto.
 * @param properties Esquema de propiedades.
 * @param options Configuracion avanzada.
 * @returns Objeto con las propiedades verificadas y tipadas.
 */
function vObject<T extends Record<string, Verifier<any>>>(
  data: any,
  badTypeMessage: IMessageLanguage<void>,
  properties: T,
  options: VObjectConditions<T> | VObjectConditionsNotNull<T>,
): { [K in keyof T]: ReturnType<T[K]["check"]> } {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new VerificationError([
      {
        key: "",
        message: getMessage(
          options?.badTypeMessage != undefined
            ? options?.badTypeMessage
            : undefined,
          undefined,
          badTypeMessage,
        ),
      },
    ]);
  }

  const keysData = Object.keys(data);
  const keysValidations = Object.keys(properties);

  if (options.strictMode) {
    let dif: string[] = [];

    if (options.ignoreCase) {
      const temp = keysValidations.map((v) => v.toUpperCase());
      dif = keysData.filter((v) => !temp.includes(v.toUpperCase()));
    } else {
      dif = keysData.filter((v) => !keysValidations.includes(v));
    }

    if (dif.length > 0) {
      const error = new VerificationError(
        dif.map((v) => ({
          key: v,
          message: getMessage(options.invalidPropertyMessage, undefined, {
            es: () => "no es una propiedad válida",
            en: () => "is not a valid property",
          }),
        })),
      );

      if (error.errors.length > 0) throw error;
    }
  }

  const errors: messageResp[] = [];
  const value: Record<string, any> = {};
  const keyMap: { keyV: string; keyD: string }[] = [];

  const duplicateErrors: messageResp[] = [];

  for (const key in properties) {
    if (options.ignoreCase) {
      const matches = keysData.filter(
        (v) => v.toUpperCase() == key.toUpperCase(),
      );

      if (matches.length > 1) {
        duplicateErrors.push({
          key,
          message: getMessage(undefined, undefined, {
            es: () =>
              `propiedad duplicada en modo ignoreCase: ${matches.join(", ")}`,
            en: () =>
              `duplicate property under ignoreCase: ${matches.join(", ")}`,
          }),
        });
        continue;
      }

      const dataKey = matches[0];
      if (dataKey) {
        keyMap.push({
          keyV: key,
          keyD: dataKey,
        });
      } else {
        keyMap.push({
          keyV: key,
          keyD: key,
        });
      }
    } else {
      keyMap.push({
        keyV: key,
        keyD: key,
      });
    }
  }

  if (duplicateErrors.length > 0) {
    throw new VerificationError(duplicateErrors);
  }

  if (options.takeAllValues) {
    for (const dataKey of keysData) {
      if (!keyMap.find((v) => v.keyD == dataKey)) {
        setObjectValue(value, dataKey, getObjectValue(data, dataKey));
      }
    }
  }

  for (const keys of keyMap) {
    try {
      const result = properties[keys.keyV].check(
        getObjectValue(data, keys.keyD),
      );

      setObjectValue(value, keys.keyV, result);
    } catch (error: any) {
      if (error instanceof VerificationError) {
        const cond = properties[keys.keyV];
        errors.push(
          ...error.errorsObj.map((v) => {
            const newKey = isNestedVerifier(cond)
              ? keys.keyV + (v.key ? "." + v.key : "")
              : keys.keyV;

            return {
              ...v,
              key: newKey,
              isEmpty: undefined,
            };
          }),
        );
      } else {
        throw error;
      }
    }
  }

  if (errors.length > 0) {
    throw new VerificationError(errors);
  }

  const typedValue = value as { [K in keyof T]: ReturnType<T[K]["check"]> };

  if (options.conds) {
    try {
      options.conds(typedValue);
    } catch (error) {
      if (error instanceof VerificationError) {
        throw error;
      }
      throw new VerificationError([
        {
          key: "",
          message:
            error instanceof Error ? error.message : String(error),
        },
      ]);
    }
  }

  return typedValue;
}

/**
 * Verificador de objetos que NO acepta null/undefined (siempre requerido).
 * Recibe un esquema `properties` donde cada clave define un verificador.
 *
 * @typeParam T Forma del esquema (keys -> Verifier).
 * @example
 * ```ts
 * Verifiers.ObjectNotNull({
 *   id: Verifiers.UUIDNotNull(),
 *   name: Verifiers.StringNotNull(),
 * }).check({ id: "...", name: "Luis" });
 * ```
 */
export class VObjectNotNull<
  T extends Record<string, Verifier<any>>,
> extends Verifier<{ [K in keyof T]: ReturnType<T[K]["check"]> }> {
  /**
   * @param properties Esquema de verificacion por propiedad.
   * @param conditions Configuracion opcional del verificador de objeto.
   */
  constructor(
    protected properties: T,
    protected conditions: VObjectConditionsNotNull<T> = {} as any,
  ) {
    super(conditions);
    this.badTypeMessage = {
      es: () => `debe ser un objeto`,
      en: () => `must be an object`,
    };
  }

  /**
   * Verifica el objeto contra el esquema. Lanza si es null/undefined.
   * @param data Dato a verificar.
   * @returns Objeto con las propiedades verificadas.
   */
  check(data: any): { [K in keyof T]: ReturnType<T[K]["check"]> } {
    return vObject(
      this.isRequired(data, true, this.conditions?.defaultValue),
      this.badTypeMessage,
      this.properties,
      this.conditions,
    );
  }

  /**
   * Activa/desactiva el modo estricto (no admite propiedades fuera del esquema).
   * @param enabled Estado (default true).
   */
  strictMode(enabled = true): VObjectNotNull<T> {
    return new VObjectNotNull<T>(this.properties, {
      ...this.conditions,
      strictMode: enabled,
    });
  }

  /**
   * Activa/desactiva la coincidencia case-insensitive de keys.
   * @param enabled Estado (default true).
   */
  ignoreCase(enabled = true): VObjectNotNull<T> {
    return new VObjectNotNull<T>(this.properties, {
      ...this.conditions,
      ignoreCase: enabled,
    });
  }

  /**
   * Conserva en la salida las propiedades no declaradas en el esquema.
   * @param enabled Estado (default true).
   */
  takeAllValues(enabled = true): VObjectNotNull<T> {
    return new VObjectNotNull<T>(this.properties, {
      ...this.conditions,
      takeAllValues: enabled,
    });
  }

  /**
   * Establece un valor por defecto.
   * @param value Objeto por defecto.
   */
  default(
    value: { [K in keyof T]: ReturnType<T[K]["check"]> },
  ): VObjectNotNull<T> {
    return new VObjectNotNull<T>(this.properties, {
      ...this.conditions,
      defaultValue: value,
    });
  }

  /**
   * Anade un predicado de verificacion cruzada sobre el objeto ya verificado.
   * Si `predicate` devuelve false, se lanza `VerificationError` con los `keys` indicados.
   *
   * @param predicate Predicado que debe devolver true para aprobar.
   * @param message Mensaje personalizado del error (opcional).
   * @param keys Clave(s) del esquema a las que se asocia el error.
   * @returns Nueva instancia con la restriccion aplicada.
   */
  refine(
    predicate: (
      value: { [K in keyof T]: ReturnType<T[K]["check"]> },
    ) => boolean,
    message?: RefineMessage,
    keys?: VObjectRefineKeys<T>,
  ): VObjectNotNull<T> {
    const baseCheck = this.check.bind(this);
    const properties = this.properties;
    const conditions = this.conditions;
    const resolvedKeys = normalizeRefineKeys(keys);

    const refined = new VObjectNotNull<T>(properties, conditions);
    refined.check = ((data: any) => {
      const value = baseCheck(data);
      if (!predicate(value)) {
        const resolvedMessage = resolveRefineMessage(message);
        throw new VerificationError(
          resolvedKeys.map((k) => ({ key: k, message: resolvedMessage })),
        );
      }
      return value;
    }) as typeof refined.check;
    return refined;
  }
}

/**
 * Verificador de objetos que acepta null/undefined (opcional por defecto).
 * Use `.required()` o `.default()` para convertirlo en `VObjectNotNull`.
 *
 * @typeParam T Forma del esquema (keys -> Verifier).
 */
export class VObject<T extends Record<string, Verifier<any>>> extends Verifier<
  { [K in keyof T]: ReturnType<T[K]["check"]> } | null
> {
  /**
   * @param properties Esquema de verificacion por propiedad.
   * @param conditions Configuracion opcional del verificador.
   */
  constructor(
    protected properties: T,
    protected conditions: VObjectConditions<T> = {} as any,
  ) {
    super(conditions);
    this.badTypeMessage = {
      es: () => `debe ser un objeto`,
      en: () => `must be an object`,
    };
  }

  /**
   * Verifica el objeto contra el esquema o retorna null cuando el dato esta ausente.
   * Si se configuro `conds`, este se ejecuta incluso cuando el valor es null/undefined.
   * @param data Dato a verificar.
   * @returns Objeto verificado o null.
   */
  check(data: any): { [K in keyof T]: ReturnType<T[K]["check"]> } | null {
    let val = this.isRequired(data, undefined, this.conditions?.defaultValue);

    if (val === null || val === undefined) {
      if (this.conditions.conds) {
        try {
          this.conditions.conds(val);
        } catch (error) {
          if (error instanceof VerificationError) {
            throw error;
          }
          throw new VerificationError([
            {
              key: "",
              message:
                error instanceof Error ? error.message : String(error),
            },
          ]);
        }
      }
      return null;
    }

    return vObject(val, this.badTypeMessage, this.properties, this.conditions);
  }

  /**
   * Activa/desactiva el modo estricto (no admite propiedades fuera del esquema).
   */
  strictMode(enabled = true): VObject<T> {
    return new VObject<T>(this.properties, {
      ...this.conditions,
      strictMode: enabled,
    });
  }

  /**
   * Activa/desactiva la coincidencia case-insensitive de keys.
   */
  ignoreCase(enabled = true): VObject<T> {
    return new VObject<T>(this.properties, {
      ...this.conditions,
      ignoreCase: enabled,
    });
  }

  /**
   * Conserva en la salida las propiedades no declaradas en el esquema.
   */
  takeAllValues(enabled = true): VObject<T> {
    return new VObject<T>(this.properties, {
      ...this.conditions,
      takeAllValues: enabled,
    });
  }

  /**
   * Convierte el verificador en su variante `VObjectNotNull` (requerido).
   */
  required(): VObjectNotNull<T> {
    return new VObjectNotNull<T>(
      this.properties,
      this.conditions as unknown as VObjectConditionsNotNull<T>,
    );
  }

  /**
   * Establece un objeto por defecto. Resultado: `VObjectNotNull`.
   * @param value Objeto por defecto.
   */
  default(
    value: { [K in keyof T]: ReturnType<T[K]["check"]> },
  ): VObjectNotNull<T> {
    return new VObjectNotNull<T>(
      this.properties,
      {
        ...this.conditions,
        defaultValue: value,
      } as unknown as VObjectConditionsNotNull<T>,
    );
  }

  /**
   * Anade un predicado de verificacion cruzada sobre el objeto ya verificado.
   * Acepta `null` como posible valor porque `VObject` puede propagar ausencia.
   *
   * @param predicate Predicado que debe devolver true para aprobar.
   * @param message Mensaje personalizado del error (opcional).
   * @param keys Clave(s) del esquema a las que se asocia el error.
   * @returns Nueva instancia con la restriccion aplicada.
   */
  refine(
    predicate: (
      value: { [K in keyof T]: ReturnType<T[K]["check"]> } | null,
    ) => boolean,
    message?: RefineMessage,
    keys?: VObjectRefineKeys<T>,
  ): VObject<T> {
    const baseCheck = this.check.bind(this);
    const properties = this.properties;
    const conditions = this.conditions;
    const resolvedKeys = normalizeRefineKeys(keys);

    const refined = new VObject<T>(properties, conditions);
    refined.check = ((data: any) => {
      const value = baseCheck(data);
      if (!predicate(value)) {
        const resolvedMessage = resolveRefineMessage(message);
        throw new VerificationError(
          resolvedKeys.map((k) => ({ key: k, message: resolvedMessage })),
        );
      }
      return value;
    }) as typeof refined.check;
    return refined;
  }
}
