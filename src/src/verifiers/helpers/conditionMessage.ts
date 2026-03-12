import { MessageType } from "../../interfaces/types";

export type ConditionMessageInput<T, K> =
  | MessageType<T, K>
  | string
  | ((values: K) => string);

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
