import { CONTEXT, ERRORHANDLERS_SYMBOL } from "~/context.ts";
import type { ErrorFunction } from "~/methods/onError.ts";
import type { Scope } from "~/objects/scope.ts";
import { castError } from "~/utils/castError.ts";

export function runWithScope<T>(
  fn: () => T,
  owner: Scope | null,
  tracking = true,
): T | undefined {
  const PREV_OBSERVER = CONTEXT.CURRENTSCOPE;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.CURRENTSCOPE = owner;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } catch (e) {
    const error = castError(e);

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
  } finally {
    CONTEXT.CURRENTSCOPE = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
