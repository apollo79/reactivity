import { CONTEXT } from "../context";
import { Computation } from "../objects/computation";
import { wrapComputation } from "../utils/wrapComputation";

export function untrack(fn: () => void) {
  if (CONTEXT.OWNER instanceof Computation) {
    return wrapComputation(fn, CONTEXT.OWNER, false);
  }

  return fn();
}
