import { CURRENTOBSERVER, ERRORTHROWN_SYMBOL } from "~/context.ts";
import { Owner } from "~/objects/owner.ts";

export function untrack<T>(fn: () => T): T {
  if (CURRENTOBSERVER) {
    const result = Owner.runWithOwner(fn, CURRENTOBSERVER, undefined);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }

  return fn();
}
