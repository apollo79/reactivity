import { CONTEXT } from "../context";
import { Owner } from "../objects/owner";

export function runWithOwner<T>(
  fn: () => T,
  owner: Owner,
  tracking: boolean
): T {
  const PREV_OBSERVER = CONTEXT.OWNER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.OWNER = owner;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } finally {
    CONTEXT.OWNER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
