import { CURRENTOWNER, ERRORHANDLER_SYMBOL } from "~/context.ts";
import { castError } from "~/utils/castError.ts";

/**
 * @typedef {import('../methods/catchError.ts').catchError} catchError
 */

/**
 * Tries to handle an error thrown during an observer's execution by searching the context for an error handler.
 * The handler can be provided by using {@linkcode catchError}
 * @param thrown The thrown error
 */
export function handleError(thrown: unknown) {
  const error = castError(thrown);

  const errorHandler = CURRENTOWNER?.get(ERRORHANDLER_SYMBOL);

  if (errorHandler) {
    errorHandler(error);
  } else {
    throw error;
  }
}
