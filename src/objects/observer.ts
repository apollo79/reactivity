import {
  ERRORTHROWN_SYMBOL,
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
} from "~/context.ts";
import { Owner } from "~/objects/owner.ts";
import { type Observable } from "~/objects/observable.ts";
import { CacheState, ObserverFunction } from "~/types.ts";

/**
 * A computation is a scope and the abstraction over effects and memos.
 */
export abstract class Observer<T> extends Owner {
  /** One part of the double-linked list between observables and computations. It holds all observables that this computation depends on. */
  readonly sources = new Set<Observable<any>>();
  readonly fn: ObserverFunction<undefined | T, T>;
  readonly sync?: boolean;

  constructor(fn: ObserverFunction<undefined | T, T>) {
    super();
    this.fn = fn;
    // Register under the parent scope for the parent's disposal
    this.parentScope?.childrenScopes.add(this);
    this.state = STATE_DIRTY;
  }

  /**
   * Calls the scope disposal, clears observables and deregisteres this computation from its parent
   */
  override dispose(): void {
    super.dispose();

    for (const observable of this.sources) {
      observable.observers.delete(this);
    }

    this.sources.clear();

    this.parentScope?.childrenScopes.delete(this);
  }

  abstract update(): void;

  /**
   * Runs the callback with this computation as scope. This is used in the effects and memos `run` methods.
   * @param prevValue The result of the previous execution or the init value of a memo to pass to the callback
   */
  run(prevValue: T | undefined): T | typeof ERRORTHROWN_SYMBOL {
    this.dispose();

    this.parentScope?.childrenScopes.add(this);

    const result = Owner.runWithOwner(() => this.fn(prevValue), this, this);

    this.state = STATE_CLEAN;

    return result;
  }

  /**
   * Checks if this computation needs to be rerun.
   */
  updateIfNecessary() {
    // If there was a change down the tree
    if (this.state === STATE_CHECK) {
      // Check if one of the direct dependencies is dirty
      for (const source of this.sources) {
        source.parent?.updateIfNecessary();

        if ((this.state as CacheState) === STATE_DIRTY) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    // If a direct dependency is dirty, we are marked dirty as well
    if (this.state === STATE_DIRTY) {
      this.update();
    }

    this.state = STATE_CLEAN;
  }

  abstract stale(newState: CacheState): void;
}
