import { CacheState, ERRORTHROWN_SYMBOL, STATE_CHECK } from "~/context.ts";
import { Computation, ComputationFunction } from "./computation.ts";
import { Observable } from "./observable.ts";
import type { ObservableOptions } from "./observable.ts";

export type MemoOptions<T> = ObservableOptions<T>;

/**
 * A memo is a computation that stores the last return value of its execution as observable so it can be depended on
 */
export class Memo<T> extends Computation<T> {
  prevValue: Observable<T>;

  constructor(
    fn: ComputationFunction<undefined | T, T>,
    init?: T,
    options?: MemoOptions<T>,
  ) {
    super(fn);

    this.prevValue = new Observable(init, options);
    this.prevValue.parent = this;
  }

  override update(): T {
    const result = super.run(this.prevValue.value);

    if (result !== ERRORTHROWN_SYMBOL) {
      this.prevValue.write(result);

      return result;
    }

    return undefined!;
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
