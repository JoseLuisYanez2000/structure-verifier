import { Verifier } from "./verifier";

export type InferType<V> = V extends Verifier<infer T> ? T : never;