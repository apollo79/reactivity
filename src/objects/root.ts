import { Owner } from "~/objects/owner.ts";
import {
  EMPTY_CONTEXT,
  ERRORTHROWN_SYMBOL,
  SUSPENSE_SYMBOL,
} from "~/context.ts";
import type { Contexts, RootFunction } from "~/types.ts";

/**
 * A root is a scope under which the provided callback is executed. It also passes the callback the `dispose` function for manual disposal.
 * A root, in contrast to a computation, doesn't reexecute and doesn't link itself with its parent as a scope, meaning it isn't automatically disposed if the parent disposes.
 * It links itself as a root though for a suspense to be able to notify perhaps existing children suspenses created in a root which is created under the parent suspense's scope.
 * Since we only need that for suspenses we only do it if there is a suspense boundary up the tree.
 * Anyway it needs to know about its parent for getting context from it.
 */
export class Root<T = unknown> extends Owner {
  override context: Contexts = this.parentScope?.context || EMPTY_CONTEXT;

  constructor() {
    super();

    // Since we only need the root registered for suspenses (as for other parent scopes the reason to use a root is exactly to not have it linked)
    // we only do it if there is a suspense boundary up the tree
    if (this.get(SUSPENSE_SYMBOL)) {
      this.parentScope?.roots.add(this);
    }
  }

  override dispose() {
    super.dispose();

    this.parentScope?.roots.delete(this);
  }

  /**
   * Executes the provided callback with the root as scope
   */
  runWith<T>(fn: RootFunction<T>): T {
    const result = Owner.runWithOwner(
      () => fn(this.dispose.bind(this)),
      this,
      undefined,
    );

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }
}
