import { CONTEXT } from "../context";
import { Root, RootFunction } from "../objects/root";

export function wrapRoot<T>(fn: RootFunction<T>, root: Root) {
  const PREV_OBSERVER = CONTEXT.OWNER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.OWNER = root;
  CONTEXT.TRACKING = false;

  try {
    return fn(root?.dispose);
  } finally {
    CONTEXT.OWNER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
