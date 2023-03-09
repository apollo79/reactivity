import { CONTEXT } from "~/context.ts";
import { runWithScope } from "~/utils/runWithScope.ts";

export function untrack<T>(fn: () => T): T {
  if (CONTEXT.CURRENTSCOPE?.isComputation) {
    return runWithScope(fn, CONTEXT.CURRENTSCOPE, false)!;
  }

  return fn();
}
