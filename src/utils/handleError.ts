import { CONTEXT, ERRORHANDLER_SYMBOL } from "../context.ts";
import { ErrorFunction } from "../methods/catchError.ts";
import { castError } from "./castError.ts";

export function handleError(thrown: unknown) {
  const error = castError(thrown);

  const errorHandler = CONTEXT.CURRENTSCOPE?.get<ErrorFunction>(
    ERRORHANDLER_SYMBOL,
  );

  if (errorHandler) {
    errorHandler(error);
  } else {
    throw error;
  }
}
