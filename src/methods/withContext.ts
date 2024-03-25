import { Context } from "~/objects/context.ts";
import { Contexts } from "~/types.ts";
import { Owner } from "~/objects/owner.ts";
import { ERRORTHROWN_SYMBOL } from "~/context.ts";

export function withContext<T>(contexts: Contexts, fn: () => T): T {
  const owner = new Context(contexts);

  const result = Owner.runWithOwner(fn, owner, undefined);

  return result === ERRORTHROWN_SYMBOL ? undefined! : result;
}
