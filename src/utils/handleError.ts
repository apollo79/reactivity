import { CONTEXT, ERRORHANDLERS_SYMBOL } from "../context.ts";
import { ErrorFunction } from "../methods/onError.ts";
import { castError } from "./castError.ts";

export function handleError(thrown: unknown) {
  const error = castError(thrown);

  const errorHandlers = CONTEXT.CURRENTSCOPE?.get<ErrorFunction[]>(
    ERRORHANDLERS_SYMBOL,
  );

  if (errorHandlers !== undefined) {
    errorHandlers.forEach((errorHandler) => {
      errorHandler(error);
    });
  } else {
    throw error;
  }
}
