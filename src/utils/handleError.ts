import { CURRENTOWNER, ERRORHANDLER_SYMBOL } from "~/context.ts";
import { castError } from "~/utils/castError.ts";

export function handleError(thrown: unknown) {
  const error = castError(thrown);

  const errorHandler = CURRENTOWNER?.get(ERRORHANDLER_SYMBOL);

  if (errorHandler) {
    errorHandler(error);
  } else {
    throw error;
  }
}
