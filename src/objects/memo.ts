import { CacheState, STATE_CHECK } from "~/context.ts";
import { Computation, ComputationFunction } from "./computation.ts";
import { Observable } from "./observable.ts";
import type { ObservableOptions } from "./observable.ts";

/**
 * A memo is a computation that stores the last return value of its execution as observable so it can be depended on
 */
export class Memo<T> extends Computation<T> {
  prevValue: Observable<T>;

  constructor(
    fn: ComputationFunction<undefined | T, T>,
    init?: T,
    options?: ObservableOptions<T>,
  ) {
    super(fn);

    this.prevValue = new Observable(init, options);
    this.prevValue.parent = this;
  }

  override update(): T {
    return this.prevValue.write(super.run(this.prevValue.value));
  }

  /**
   * Sets the state and notifies all observers about the new state
   * @param newState the new state
   */
  override stale(newState: CacheState): void {
    if (this.state >= newState) {
      return;
    }

    this.state = newState;

    // notify observers
    this.prevValue.stale(STATE_CHECK);
  }
}
