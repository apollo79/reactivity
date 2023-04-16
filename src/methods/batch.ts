import { CONTEXT } from "../context.ts";

export function batch(fn: () => void): void {
  CONTEXT.BATCH = [];
  try {
    fn();

    CONTEXT.SCHEDULER.runEffects();
  } finally {
    CONTEXT.BATCH = null;
  }
}
