import { CONTEXT } from "../context.ts";
import { Computation } from "../objects/computation.ts";
import { runWithOwner } from "../utils/runWithOwner.ts";

export function untrack<T>(fn: () => T): T {
  if (CONTEXT.OWNER instanceof Computation) {
    return runWithOwner(fn, CONTEXT.OWNER, false)!;
  }

  return fn();
}
