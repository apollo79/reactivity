import { CONTEXT, ERRORTHROWN_SYMBOL } from "~/context.ts";
import { Computation } from "~/objects/computation.ts";
import { runWithOwner } from "~/utils/runWithOwner.ts";

export function untrack<T>(fn: () => T): T {
  // Only computations are tracking, so if the current scope is a computation we have to explicitly run the callback with no tracking
  if (CONTEXT.CURRENTSCOPE instanceof Computation) {
    const result = runWithOwner(fn, CONTEXT.CURRENTSCOPE, false);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }

  return fn();
}
