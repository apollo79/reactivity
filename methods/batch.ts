import { CONTEXT } from "../context";
import { NON_STALE, STALE } from "../objects/observable";

export function batch(fn: () => void) {
  // if already batching, do nothing, as batching again would result in BATCH being undefined in the outer batch
  // because the execution of the inner batch is inside the outer one and therefore ends first
  if (CONTEXT.BATCH) {
    return fn();
  }

  CONTEXT.BATCH = new Map();

  try {
    return fn();
  } finally {
    const newValues = CONTEXT.BATCH;

    CONTEXT.BATCH = undefined;

    newValues.forEach((_, observable) => {
      observable.stale(STALE, false);
    });

    newValues.forEach((value, observable) => {
      observable.set(value);
    });

    newValues.forEach((_, observable) => {
      observable.stale(NON_STALE, false);
    });
  }
}
