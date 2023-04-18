import type { Owner } from "~/objects/owner.ts";
import { handleError } from "~/utils/handleError.ts";
import {
  CURRENTOWNER,
  ERRORTHROWN_SYMBOL,
  setCurrentOwner,
  setTracking,
  TRACKING,
} from "~/context.ts";

export function runWithOwner<T>(
  fn: () => T,
  owner: Owner | null,
  tracking = true,
): T | typeof ERRORTHROWN_SYMBOL {
  const PREV_OBSERVER = CURRENTOWNER;
  const PREV_TRACKING = TRACKING;

  setCurrentOwner(owner);
  setTracking(tracking);

  try {
    return fn();
  } catch (error: unknown) {
    handleError(error);

    return ERRORTHROWN_SYMBOL;
  } finally {
    setCurrentOwner(PREV_OBSERVER);
    setTracking(PREV_TRACKING);
  }
}
