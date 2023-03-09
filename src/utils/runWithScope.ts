import { CONTEXT, ERRORHANDLERS_SYMBOL } from "~/context.ts";
import type { ErrorFunction } from "~/methods/onError.ts";
import { lookup, Scope } from "~/objects/scope.ts";
import { castError } from "~/utils/castError.ts";

export function runWithScope<T>(
  fn: () => T,
  scope: Scope | null,
  tracking = true,
): T | undefined {
  const PREV_OBSERVER = CONTEXT.CURRENTSCOPE;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.CURRENTSCOPE = scope;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } catch (e) {
    const error = castError(e);

    if (scope !== null) {
      const errorHandlers = lookup(
        scope,
        ERRORHANDLERS_SYMBOL,
      ) as ErrorFunction[];

      // const errorHandlers = CONTEXT.CURRENTSCOPE?.get<ErrorFunction[]>(
      //   ERRORHANDLERS_SYMBOL,
      // );

      if (errorHandlers !== undefined) {
        errorHandlers.forEach((errorHandler) => {
          errorHandler(error);
        });
      } else {
        throw error;
      }
    }
  } finally {
    CONTEXT.CURRENTSCOPE = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
