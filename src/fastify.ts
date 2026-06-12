import type {
  FastifySchemaCompiler,
  FastifyTypeProvider,
} from "fastify";
import type { FastifySerializerCompiler } from "fastify/types/schema";

import { VerificationError } from "./src/error/v_error";
import { Verifier } from "./src/verifiers/verifier";
import type { InferType } from "./src/verifiers/type";

/**
 * Error de validacion en el formato que Fastify expone en `error.validation`
 * (compatible con la forma de los errores de Ajv).
 *
 * @property instancePath Ruta del campo con formato JSON pointer (ej. `/items/0/id`).
 * @property message Texto descriptivo del error.
 * @property isEmpty Indica si el error se genero por un valor requerido ausente.
 * @property isItem Indica si el error pertenece a un elemento de una coleccion.
 */
export interface StructureVerifierValidationErrorItem {
  instancePath: string;
  message: string;
  isEmpty?: boolean;
  isItem?: boolean;
}

/**
 * `VerificationError` enriquecido con las propiedades que Fastify adjunta a los
 * errores de validacion (`validation` y `validationContext`).
 */
export type StructureVerifierValidationError = VerificationError & {
  validation: StructureVerifierValidationErrorItem[];
  validationContext?: string;
  statusCode?: number;
};

/**
 * Convierte un key de structure-verifier (`items[0].id`, `parent.child`)
 * a un JSON pointer al estilo Ajv (`/items/0/id`, `/parent/child`).
 * @param key Key reportado por la libreria (puede ser vacio para el nivel raiz).
 * @returns instancePath equivalente.
 */
function keyToInstancePath(key?: string): string {
  if (!key) return "";
  const segments = key
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter((segment) => segment.length > 0);
  return segments.length > 0 ? `/${segments.join("/")}` : "";
}

/**
 * Type provider de Fastify para structure-verifier.
 * Permite que `request.body`, `request.query`, etc. se tipen automaticamente
 * a partir del `Verifier` declarado en el schema de la ruta.
 *
 * @example
 * ```ts
 * const app = fastify().withTypeProvider<StructureVerifierTypeProvider>();
 * app.post("/users", { schema: { body: userVerifier } }, async (req) => {
 *   req.body; // tipado por inferencia del verificador
 * });
 * ```
 */
export interface StructureVerifierTypeProvider extends FastifyTypeProvider {
  validator: this["schema"] extends Verifier<any>
    ? InferType<this["schema"]>
    : unknown;
  serializer: this["schema"] extends Verifier<any>
    ? InferType<this["schema"]>
    : unknown;
}

/**
 * Validator compiler para Fastify.
 * Acepta instancias de `Verifier` en `schema.body/querystring/params/headers`
 * y ejecuta `safeCheck` sobre el dato entrante. En caso de fallo retorna el
 * `VerificationError` enriquecido con `validation` (formato Ajv-like), por lo
 * que Fastify responde 400 con codigo `FST_ERR_VALIDATION`.
 *
 * @example
 * ```ts
 * app.setValidatorCompiler(validatorCompiler);
 * ```
 */
export const validatorCompiler: FastifySchemaCompiler<Verifier<any>> =
  ({ schema, httpPart }) =>
  (data) => {
    const result = schema.safeCheck(data);
    if (result.success) {
      return { value: result.value };
    }

    const error = result.error as StructureVerifierValidationError;
    error.validation = result.error.errorsObj.map((item) => ({
      instancePath: keyToInstancePath(item.key),
      message: item.message,
      isEmpty: item.isEmpty,
      isItem: item.isItem,
    }));
    error.validationContext = httpPart;
    return { error };
  };

/**
 * Serializer compiler para Fastify.
 * Si el schema de `response` es un `Verifier`, valida/transforma la salida con
 * `check` antes de serializar (un fallo aqui produce un 500, igual que con
 * fast-json-stringify). Para cualquier otro schema hace `JSON.stringify` directo.
 *
 * @example
 * ```ts
 * app.setSerializerCompiler(serializerCompiler);
 * ```
 */
export const serializerCompiler: FastifySerializerCompiler<
  Verifier<any> | unknown
> =
  ({ schema }) =>
  (data) => {
    if (schema instanceof Verifier) {
      return JSON.stringify(schema.check(data));
    }
    return JSON.stringify(data);
  };

/**
 * Type guard para detectar en un error handler de Fastify los errores
 * producidos por `validatorCompiler`.
 *
 * @example
 * ```ts
 * app.setErrorHandler((err, req, reply) => {
 *   if (hasStructureVerifierValidationErrors(err)) {
 *     return reply.status(400).send({ errors: err.validation });
 *   }
 *   reply.send(err);
 * });
 * ```
 */
export function hasStructureVerifierValidationErrors(
  error: unknown,
): error is StructureVerifierValidationError {
  return (
    error instanceof VerificationError &&
    Array.isArray((error as StructureVerifierValidationError).validation)
  );
}
