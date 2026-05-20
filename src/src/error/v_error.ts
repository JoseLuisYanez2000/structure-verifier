import { messageResp } from "../interfaces/types";

/**
 * Normaliza un mensaje de error haciendo trim al key y al mensaje.
 * @param message Mensaje original.
 * @returns Mensaje normalizado (inmutable).
 */
function normalizeMessage(message: messageResp): Readonly<messageResp> {
  return {
    ...message,
    key: typeof message.key === "string" ? message.key.trim() : message.key,
    message: message.message.trim(),
  };
}

/**
 * Formatea un mensaje de error para su representacion como string.
 * Cuando existe un `key`, se antepone al texto del mensaje.
 * @param message Mensaje de error a formatear.
 * @returns Texto combinando key + mensaje.
 */
function formatMessage(message: messageResp): string {
  const key = typeof message.key === "string" ? message.key.trim() : "";
  const text = message.message.trim();

  return key.length > 0 ? `${key} ${text}` : text;
}

/**
 * Error especializado que se lanza cuando la verificacion de un dato falla.
 * Encapsula una lista de mensajes con informacion de key/mensaje y permite
 * obtenerlos ya sea como texto plano o como objetos estructurados.
 *
 * @example
 * ```ts
 * try {
 *   Verifiers.String().required().check(null);
 * } catch (e) {
 *   if (e instanceof VerificationError) {
 *     console.log(e.errors);     // string[]
 *     console.log(e.errorsObj);  // messageResp[]
 *   }
 * }
 * ```
 */
export class VerificationError extends Error {
  private readonly _errors: readonly string[];
  private readonly _errorsObj: readonly Readonly<messageResp>[];

  /**
   * Crea una nueva instancia de VerificationError.
   * @param messages Lista de mensajes de error resultantes de la verificacion.
   */
  constructor(messages: readonly messageResp[]) {
    const normalizedMessages = messages.map(normalizeMessage);
    const formattedMessages = normalizedMessages.map(formatMessage);

    super(formattedMessages.join(";"));
    this.name = "VerificationError";
    this._errors = Object.freeze(formattedMessages);
    this._errorsObj = Object.freeze(normalizedMessages);
  }

  /**
   * Lista de mensajes ya formateados como texto (string[]).
   * @returns Copia del arreglo de mensajes.
   */
  get errors() {
    return [...this._errors];
  }

  /**
   * Lista de mensajes estructurados (messageResp[]) con key, mensaje y metadata.
   * @returns Copia de los objetos de error.
   */
  get errorsObj() {
    return this._errorsObj.map((message) => ({ ...message }));
  }
}
