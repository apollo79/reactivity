import { CONTEXT } from "../context";
import { Computation } from "../objects/computation";
import { runWithOwner } from "../utils/runWithOwner";

export function untrack<T>(fn: () => T): T {
  if (CONTEXT.OWNER instanceof Computation) {
    return runWithOwner(fn, CONTEXT.OWNER, false);
  }

  return fn();
}
