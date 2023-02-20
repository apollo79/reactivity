import { CONTEXT } from "../context";
import { Root, RootFunction } from "../objects/root";

export function wrapRoot<T>(fn: RootFunction<T>, root: Root) {
  const PREV_OBSERVER = CONTEXT.OBSERVER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.OBSERVER = root;
  CONTEXT.TRACKING = false;

  try {
    return fn(root?.dispose);
  } finally {
    CONTEXT.OBSERVER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
