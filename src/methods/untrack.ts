import { CONTEXT } from "~/context.ts";
import { Computation } from "~/objects/computation.ts";
import { runWithScope } from "~/utils/runWithScope.ts";

export function untrack<T>(fn: () => T): T {
  if (CONTEXT.CURRENTSCOPE instanceof Computation) {
    return runWithScope(fn, CONTEXT.CURRENTSCOPE, false)!;
  }

  return fn();
}
