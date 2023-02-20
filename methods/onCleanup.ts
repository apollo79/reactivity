import { CONTEXT } from "../context";

export type CleanupFunction = () => void;

export function onCleanup(fn: CleanupFunction) {
  if (CONTEXT.OBSERVER?.cleanups === null) {
    CONTEXT.OBSERVER.cleanups = [fn];
  } else {
    CONTEXT.OBSERVER?.cleanups.push(fn);
  }

  return fn;
}
