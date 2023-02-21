import { CONTEXT } from "../context";

export type CleanupFunction = () => void;

export function onCleanup(fn: CleanupFunction) {
  CONTEXT.OWNER?.cleanups.push(fn);

  return fn;
}
