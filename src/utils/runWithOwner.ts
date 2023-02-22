import { CONTEXT, ERRORHANDLERS_SYMBOL } from "~/context.ts";
import type { ErrorFunction } from "~/methods/onError.ts";
import type { Owner } from "~/objects/owner.ts";
import { castError } from "~/utils/castError.ts";

export function runWithOwner<T>(
  fn: () => T,
  owner: Owner,
  tracking: boolean,
): T | undefined {
  const PREV_OBSERVER = CONTEXT.OWNER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.OWNER = owner;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } catch (e) {
    const error = castError(e);

    const errorHandlers = CONTEXT.OWNER.get<ErrorFunction[]>(
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
    CONTEXT.OWNER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
