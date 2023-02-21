import { CONTEXT } from "../context";

export type CleanupFunction = () => void;

export function onCleanup(fn: CleanupFunction) {
  if (CONTEXT.OWNER?.cleanups === null) {
    CONTEXT.OWNER.cleanups = [fn];
  } else {
    CONTEXT.OWNER?.cleanups.push(fn);
  }

  return fn;
}
