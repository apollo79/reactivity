import { runWithOwner } from "~/utils/runWithOwner.ts";
import { Scope } from "~/objects/scope.ts";

export type RootFunction<T> = (dispose: () => void) => T;

/**
 * A root is a scope under which the provided callback is executed. It also passes the callback the `dispose` function for manual disposal.
 * A root, in contrast to a computation, doesn't link itself with its parent, meaning it isn't automatically disposed if the parent disposes
 * Anyway it needs to know about its parent for getting context from it
 */
export class Root<T = unknown> extends Scope {
  fn: RootFunction<T>;

  constructor(fn: RootFunction<T>) {
    super();
    this.fn = fn;
  }

  /**
   * Executes the provided callback with the root as scope
   */
  wrap(): T {
    return runWithOwner(() => this.fn(this.dispose.bind(this)), this, false)!;
  }
}
