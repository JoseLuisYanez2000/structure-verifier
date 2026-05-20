import { Verifier } from "./verifier";

/**
 * Infiere el tipo verificado (salida del `check`) a partir de una instancia de verificador.
 * @typeParam V Instancia de `Verifier<T>`.
 * @example
 * ```ts
 * type S = InferType<ReturnType<typeof Verifiers.String>>; // string | null
 * ```
 */
export type InferType<V> = V extends Verifier<infer T> ? T : never;

/**
 * Infiere el tipo verificado a partir de una factory/funcion que retorna un verificador.
 * Util cuando se declara un esquema como funcion.
 * @typeParam F Factory del tipo `(...args) => Verifier<T>`.
 * @example
 * ```ts
 * const makeUser = () => Verifiers.ObjectNotNull({ name: Verifiers.StringNotNull() });
 * type User = InferFactoryType<typeof makeUser>; // { name: string }
 * ```
 */
export type InferFactoryType<F> = F extends (
  ...args: any[]
) => Verifier<infer T>
  ? T
  : never;
