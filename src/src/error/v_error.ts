import { messageResp } from "../interfaces/types";

function normalizeMessage(message: messageResp): Readonly<messageResp> {
  return Object.freeze({
    ...message,
    key: typeof message.key === "string" ? message.key.trim() : message.key,
    message: message.message.trim(),
  });
}

function formatMessage(message: messageResp): string {
  const key = typeof message.key === "string" ? message.key.trim() : "";
  const text = message.message.trim();

  return key.length > 0 ? `${key} ${text}` : text;
}

export class VerificationError extends Error {
  private readonly _errors: readonly string[];
  private readonly _errorsObj: readonly Readonly<messageResp>[];

  constructor(messages: readonly messageResp[]) {
    const normalizedMessages = messages.map(normalizeMessage);

    super(normalizedMessages.map(formatMessage).join(";"));
    this.name = "VerificationError";
    this._errors = Object.freeze(normalizedMessages.map(formatMessage));
    this._errorsObj = Object.freeze(normalizedMessages);
  }

  get errors() {
    return [...this._errors];
  }

  get errorsObj() {
    return this._errorsObj.map((message) => ({ ...message }));
  }
}
