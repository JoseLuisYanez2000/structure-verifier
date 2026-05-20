import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/**
 * Instancia de dayjs pre-configurada con los plugins utc, timezone y customParseFormat.
 * Se exporta como `datetime` para usarse internamente por los verificadores de fecha
 * y tambien de forma publica por los consumidores de la libreria.
 */
export { dayjs as datetime };
