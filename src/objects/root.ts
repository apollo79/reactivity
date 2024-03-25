import { Owner } from "~/objects/owner.ts";
import { CURRENTOWNER, EMPTY_CONTEXT, ERRORTHROWN_SYMBOL } from "~/context.ts";
import type { Contexts, RootFunction } from "~/types.ts";

/**
 * A root is a scope under which the provided callback is executed. It also passes the callback the `dispose` function for manual disposal.
 * A root, in contrast to a computation, doesn't link itself with its parent, meaning it isn't automatically disposed if the parent disposes
 * Anyway it needs to know about its parent for getting context from it
 */
export class Root<T = unknown> extends Owner {
  fn: RootFunction<T>;
  contexts: Contexts = CURRENTOWNER?.contexts || EMPTY_CONTEXT;

  constructor(fn: RootFunction<T>) {
    super();
    this.fn = fn;
  }

  /**
   * Executes the provided callback with the root as scope
   */
  wrap(): T {
    const result = Owner.runWithOwner(
      () => this.fn(this.dispose.bind(this)),
      this,
      undefined
    );

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }
}
