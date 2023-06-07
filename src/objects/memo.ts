import { ERRORTHROWN_SYMBOL, STATE_CHECK } from "~/context.ts";
import { Observer } from "~/objects/observer.ts";
import { Observable } from "~/objects/observable.ts";
import type { CacheState, MemoOptions, ObserverFunction } from "~/types.ts";

/**
 * A memo is a computation that stores the last return value of its execution as observable so it can be depended on
 */
export class Memo<T> extends Observer<T> {
  prevValue: Observable<T>;
  declare readonly sync?: false;

  constructor(
    fn: ObserverFunction<undefined | T, T>,
    init?: T,
    options?: MemoOptions<T>,
  ) {
    super(fn);

    this.prevValue = new Observable(init, options);
    this.prevValue.parent = this;
  }

  override update(): void {
    const result = super.run(this.prevValue.value);

    if (result !== ERRORTHROWN_SYMBOL) {
      this.prevValue.write(result);
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
    this.prevValue.stale(STATE_CHECK);
  }
}
