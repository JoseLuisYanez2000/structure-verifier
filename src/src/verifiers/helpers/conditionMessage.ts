import { MessageType } from "../../interfaces/types";

/**
 * Tipos admitidos como entrada de mensaje al configurar una condicion.
 * Puede ser:
 * - Un `MessageType<T, K>` (valor + mensaje).
 * - Un string literal con el texto final del mensaje.
 * - Una funcion que recibe los parametros `K` y retorna el string del mensaje.
 * @typeParam T Tipo del valor de la condicion.
 * @typeParam K Tipo de los parametros enviados a la funcion de mensaje.
 */
export type ConditionMessageInput<T, K> =
  | MessageType<T, K>
  | string
  | ((values: K) => string);

/**
 * Construye un `MessageType<T, K>` combinando un valor de condicion y un mensaje opcional.
 * Si no se recibe mensaje, devuelve solo el valor; en caso contrario retorna el objeto
 * `{ val, message }` normalizado segun el tipo de entrada (string, funcion u objeto).
 *
 * @param value Valor asociado a la condicion (p. ej. min=5, max=100).
 * @param message Mensaje personalizado (string, funcion u objeto con `message`).
 * @returns Condicion lista para ser interpretada por `getValue` / `getMessage`.
 *
 * @example
 * ```ts
 * conditionWithValue(5, "Debe ser >= 5");
 * conditionWithValue(5, (v) => `Valor mayor a ${v.min}`);
 * ```
 */
export function conditionWithValue<T, K>(
  value: T,
  message?: ConditionMessageInput<T, K>,
): MessageType<T, K> {
  if (message === undefined) {
    return value;
  }

  if (typeof message === "string") {
    return { val: value, message: () => message };
  }

  if (typeof message === "function") {
    return { val: value, message: message as (values: K) => string };
  }

  if (message !== null && typeof message === "object" && "message" in message) {
    return { val: value, message: message.message };
  }

  return value;
}
