import { VerifierConfig } from "../config/verifierConfig";

/**
 * Estructura de un mensaje localizado en espanol (es) e ingles (en).
 * @typeParam K Tipo de los parametros que reciben las funciones de mensaje.
 */
export interface IMessageLanguage<K> {
  es: (values: K) => string;
  en: (values: K) => string;
}

/**
 * Tipo generico que permite definir un valor de condicion simple o con mensaje personalizado.
 * @typeParam T Tipo del valor de la condicion.
 * @typeParam K Tipo de los parametros inyectados al construir el mensaje.
 */
export type MessageType<T, K> = T | { val: T; message: (values: K) => string };

/**
 * Extrae el valor "crudo" de una condicion, sea que se haya entregado como valor simple
 * o como objeto { val, message }.
 * @param m Condicion a evaluar (valor o objeto valor+mensaje).
 * @returns El valor interno T de la condicion.
 */
export function getValue<T, K>(m: MessageType<T, K>): T {
  if (m instanceof RegExp) {
    return m as T;
  }
  if (typeof m === "object" && m !== null && "val" in m && "message" in m) {
    if ("val" in m) {
      return m.val;
    }
    throw new Error("Invalid object structure");
  }
  return m;
}

/**
 * Resuelve el texto final de un mensaje de error tomando en cuenta:
 * - Si se entrega un string literal, se usa tal cual.
 * - Si es un objeto con `message`, se invoca con los `values`.
 * - Caso contrario, se usa el mensaje por defecto segun el idioma en `VerifierConfig.lang`.
 * @param m Condicion/valor que puede traer su propio mensaje personalizado.
 * @param values Parametros que se pasaran a la funcion de mensaje.
 * @param message Mensaje por defecto multi-idioma (fallback).
 * @returns El mensaje final ya resuelto como string.
 */
export function getMessage<T, K>(
  m: MessageType<T, K> | string,
  values: K,
  message: IMessageLanguage<K>,
): string {
  if (m instanceof RegExp) {
    return message[VerifierConfig.lang](values);
  }
  if (typeof m === "string") {
    return m;
  }
  if (typeof m === "object" && m !== null && "val" in m && "message" in m) {
    if ("message" in m) {
      return m.message(values);
    }
    throw new Error("Invalid object structure");
  }
  return message[VerifierConfig.lang](values);
}
