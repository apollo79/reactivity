import { CONTEXT } from "../context";
import { wrapComputation } from "../utils/wrapComputation";

export function untrack(fn: () => void) {
  return wrapComputation(fn, CONTEXT.OBSERVER, false);
}
