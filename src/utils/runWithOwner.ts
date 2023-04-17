import { CONTEXT, ERRORTHROWN_SYMBOL } from "~/context.ts";
import type { Scope } from "~/objects/scope.ts";
import { handleError } from "~/utils/handleError.ts";

export function runWithOwner<T>(
  fn: () => T,
  owner: Scope | null,
  tracking = true,
): T | typeof ERRORTHROWN_SYMBOL {
  const PREV_OBSERVER = CONTEXT.CURRENTSCOPE;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.CURRENTSCOPE = owner;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } catch (error: unknown) {
    handleError(error);

    return ERRORTHROWN_SYMBOL;
  } finally {
    CONTEXT.CURRENTSCOPE = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
