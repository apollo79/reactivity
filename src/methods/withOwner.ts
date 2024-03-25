import { Owner } from "~/objects/owner.ts";
import { CURRENTOWNER, ERRORTHROWN_SYMBOL } from "~/context.ts";
import { CURRENTOBSERVER } from "~/context.ts";

export function withOwner(): <T>(fn: () => T) => T {
  const currentOwner = CURRENTOWNER;
  const currentObserver = CURRENTOBSERVER;

  return <T>(fn: () => T): T => {
    const result = Owner.runWithOwner(fn, currentOwner, currentObserver);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  };
}
