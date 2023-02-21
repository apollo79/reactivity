import { CONTEXT, ERRORHANDLERS_SYMBOL } from "../context";
import { ErrorFunction } from "../methods/onError";
import { Owner } from "../objects/owner";
import { castError } from "./castError";

export function runWithOwner<T>(
  fn: () => T,
  owner: Owner,
  tracking: boolean
): T | undefined {
  const PREV_OBSERVER = CONTEXT.OWNER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.OWNER = owner;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } catch (e) {
    const error = castError(e);

    const errorHandlers =
      CONTEXT.OWNER.get<ErrorFunction[]>(ERRORHANDLERS_SYMBOL);

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
