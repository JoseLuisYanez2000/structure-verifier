import { Validation } from "./validator";

export type InferType<V> = V extends Validation<infer T> ? T : never;