import {
  CacheState,
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
} from "~/context.ts";
import { runWithScope } from "~/utils/runWithScope.ts";
import { Scope } from "~/objects/scope.ts";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev,
) => Next;

export abstract class Computation<Next, Init = unknown> extends Scope {
  fn: ComputationFunction<undefined | Init | Next, Next>;

  constructor(fn: ComputationFunction<undefined | Init | Next, Next>) {
    super();
    this.fn = fn;
  }

  abstract run(): Next;

  runComputation(prevValue: Next | Init | undefined): Next {
    this.dispose();

    this.parentScope?.childrenObservers.add(this);

    const result = runWithScope(() => this.fn(prevValue), this, true)!;

    this.state = STATE_CLEAN;

    return result;
  }

  updateIfNecessary() {
    if (this.state === STATE_CHECK) {
      for (const observable of this.observables) {
        observable.parent?.updateIfNecessary();

        if ((this.state as number) === STATE_DIRTY) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    if (this.state === STATE_DIRTY && !this.isZombie()) {
      this.run();
    }

    this.state = STATE_CLEAN;
  }

  abstract stale(newState: CacheState): void;

  isZombie() {
    let owner: Scope | null = this.parentScope;

    while (owner !== null) {
      if (owner instanceof Computation && owner.state === STATE_DIRTY) {
        return true;
      }

      owner = owner.parentScope;
    }

    return false;
  }
}
