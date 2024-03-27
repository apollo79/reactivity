import { Owner } from "~/objects/owner.ts";
import { Contexts } from "~/types.ts";
import { ERRORTHROWN_SYMBOL } from "~/context.ts";

export class Context extends Owner {
  context: Contexts;

  constructor(contexts: Contexts) {
    super();

    this.context = { ...this.parentScope?.context, ...contexts };
  }

  runWith<T>(fn: () => T): T {
    const result = Owner.runWithOwner(fn, this, undefined);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }
}
