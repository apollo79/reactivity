import { CURRENTOWNER, ERRORTHROWN_SYMBOL } from "~/context.ts";
import { Computation } from "~/objects/computation.ts";
import { Owner } from "../objects/owner.ts";

export function untrack<T>(fn: () => T): T {
  // Only computations are tracking, so if the current scope is a computation we have to explicitly run the callback with no tracking
  if (CURRENTOWNER instanceof Computation) {
    const result = Owner.runWithOwner(fn, CURRENTOWNER, undefined);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }

  return fn();
}
