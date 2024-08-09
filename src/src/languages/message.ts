import { ValConfig } from "../config/validatorConfig";

export interface IMessageLanguage<K> {
    es: (values: K) => string,
    en: (values: K) => string,
}
export type MessageType<T, K> = T | { val: T, message: (values: K) => string };

export function getValue<T, K>(m: MessageType<T, K>): T {
    if (m instanceof RegExp) {
        return m as T;
    }
    if (typeof m === 'object' && m !== null && 'val' in m && 'message' in m) {
        if ('val' in m) {
            return m.val;
        }
        throw new Error("Invalid object structure");
    }
    return m;
}

export function getMessage<T, K>(m: MessageType<T, K>, values: K, message: IMessageLanguage<K>): string {
    if (m instanceof RegExp) {
        return message[ValConfig.lang](values);
    }
    if (typeof m === 'object' && m !== null && 'val' in m && 'message' in m) {
        if ('message' in m) {
            return m.message(values);
        }
        throw new Error("Invalid object structure");
    }
    return message[ValConfig.lang](values);
}