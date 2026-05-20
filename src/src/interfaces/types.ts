/**
 * Estructura inmutable de un mensaje de error de verificacion.
 * @property key Nombre del campo/propiedad asociado al error (opcional).
 * @property message Texto descriptivo del error ya formateado.
 * @property isEmpty Indica si el error se genero por un valor vacio/nulo requerido.
 * @property isItem Indica si el error pertenece a un elemento dentro de una coleccion.
 */
export type messageResp = Readonly<{
  key?: string;
  message: string;
  isEmpty?: boolean;
  isItem?: boolean;
}>;

/**
 * Tipo generico que permite definir una condicion como un valor simple (T)
 * o como un objeto con valor + mensaje personalizado dependiente de parametros (K).
 * @typeParam T Tipo del valor de la condicion (p.ej. number, string, boolean).
 * @typeParam K Tipo de los parametros que recibira la funcion de mensaje.
 */
export type MessageType<T, K> = T | { val: T; message: (values: K) => string };

/**
 * Configuracion comun para indicar si un valor es requerido y como tratar cadenas vacias.
 * @property isRequired Define si el valor debe existir (no null/undefined).
 * @property emptyAsNull Si es true, trata una cadena vacia ("") como null.
 */
export interface VVCIsRequired {
  isRequired?: MessageType<boolean, void>;
  emptyAsNull?: boolean;
}

/**
 * Configuracion que expone un mensaje personalizado cuando un valor requerido esta ausente.
 * @property isRequiredMessage Mensaje que se mostrara cuando el campo sea requerido y no haya valor.
 */
export interface VVCIsRequiredMessage {
  isRequiredMessage?: string;
}

/**
 * Configuracion para el mensaje de error al fallar la verificacion de tipo de dato.
 * @property badTypeMessage Mensaje personalizado mostrado cuando el tipo no es valido.
 */
export interface VBadTypeMessage {
  badTypeMessage?: MessageType<void, void> | string;
}

/**
 * Configuracion que permite establecer un valor por defecto cuando el dato recibido es null/undefined.
 * @typeParam T Tipo del valor por defecto.
 * @property defaultValue Valor a utilizar cuando el dato original esta ausente.
 */
export interface VDefaultValue<T> {
  defaultValue?: T;
}

/**
 * Configuracion informativa (documentacion / ejemplos) para un verificador.
 * @typeParam T Tipo del valor que se esta verificando.
 * @property info.description Descripcion legible del campo.
 * @property info.examples Lista de ejemplos validos del valor.
 */
export interface IInfo<T> {
  info?: {
    description?: string;
    examples?: T[];
  };
}
