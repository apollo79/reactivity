import { ERRORTHROWN_SYMBOL, STATE_CHECK } from "~/context.ts";
import { Observer } from "~/objects/observer.ts";
import { Observable } from "~/objects/observable.ts";
import type { CacheState, MemoOptions, ObserverFunction } from "~/types.ts";

/**
 * A memo is a computation that stores the last return value of its execution as observable so it can be depended on.
 * It's also not executed eagerly, but only if it has been notified by one of its dependencies before and gets read.
 */
export class Memo<T> extends Observer<T> {
  currentValue: Observable<T>;
  declare readonly sync?: false;

  constructor(
    fn: ObserverFunction<undefined | T, T>,
    init?: T,
    options?: MemoOptions<T>,
  ) {
    super(fn);

    this.currentValue = new Observable(init, options);
    this.currentValue.parent = this;
  }

  override update(): void {
    const result = super.run(this.currentValue.value);

    if (result !== ERRORTHROWN_SYMBOL) {
      this.currentValue.write(result);
    }
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
    this.currentValue.stale(STATE_CHECK);
  }
}
