import { Owner } from "~/objects/owner.ts";
import { Contexts } from "~/types.ts";
import { ERRORTHROWN_SYMBOL } from "~/context.ts";

export class Context extends Owner {
  override context: Contexts;

  constructor(contexts: Contexts) {
    super();

    this.parentScope?.childrenScopes.add(this);

    this.context = { ...this.parentScope?.context, ...contexts };
  }

  override dispose() {
    super.dispose();

    this.parentScope?.childrenScopes.delete(this);
  }

  runWith<T>(fn: () => T): T {
    const result = Owner.runWithOwner(fn, this, undefined);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }
}
