import { CONTEXT, ERRORTHROWN_SYMBOL } from "~/context.ts";
import type { Owner } from "~/objects/owner.ts";
import { handleError } from "~/utils/handleError.ts";

export function runWithOwner<T>(
  fn: () => T,
  owner: Owner | null,
  tracking = true,
): T | typeof ERRORTHROWN_SYMBOL {
  const PREV_OBSERVER = CONTEXT.CURRENTOWNER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.CURRENTOWNER = owner;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } catch (error: unknown) {
    handleError(error);

    return ERRORTHROWN_SYMBOL;
  } finally {
    CONTEXT.CURRENTOWNER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
