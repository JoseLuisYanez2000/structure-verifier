import { Verifier } from "./verifier";

export type InferType<V> = V extends Verifier<infer T> ? T : never;
export type InferFactoryType<F> = F extends (
  ...args: any[]
) => Verifier<infer T>
  ? T
  : never;
