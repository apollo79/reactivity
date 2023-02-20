import { CONTEXT } from "../context";

export function untrack(fn: () => void) {
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.TRACKING = false;

  fn();

  CONTEXT.TRACKING = PREV_TRACKING;
}
