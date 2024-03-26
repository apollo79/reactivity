import {
  ASYNCSCHEDULER,
  ERRORTHROWN_SYMBOL,
  STATE_CLEAN,
  SUSPENSE_SYMBOL,
  SYNCSCHEDULER,
} from "~/context.ts";
import { Observer } from "~/objects/observer.ts";
import type { CacheState, EffectOptions, ObserverFunction } from "~/types.ts";
import { Suspense } from "~/objects/suspense.ts";

/**
 * An effect is executed immediately on creation and every time again when one of its dependencies changes
 */
export class Effect<T> extends Observer<T> {
  /** Stores the last return value of the callback */
  prevValue: T | undefined;
  declare readonly sync?: true;
  init?: boolean;
  suspense?: Suspense;

  constructor(
    fn: ObserverFunction<undefined | T, T>,
    initialValue?: T,
    options?: EffectOptions,
  ) {
    super(fn);

    this.suspense = this.get(SUSPENSE_SYMBOL);

    this.prevValue = initialValue;

    if (options?.sync === true) {
      this.sync = true;
    }

    if (options?.sync === "init") {
      // when the effect is suspended on first run, the suspense will run this effect instantly if it gets unsuspended
      this.init = true;

      // on first run we have to run the effect immediately
      this.update();
    } else {
      this.schedule();
    }
  }

  /**
   * Updates immediately if the effect is sync or schedules it with  the async scheduler otherwise
   * This method is used on initialization when the effect is not caused to run by a signal and in suspense when it gets toggled.
   * @returns
   */
  schedule(): void {
    // if there is a suspense (or multiple suspenses) only schedule if `suspended` > 0
    if (this.suspense?.suspended) {
      return;
    }

    // here we don't use the sync scheduler because it gets flushed by the observable
    // which is not the case when this is the first run or caused by the suspense boundary toggling
    if (this.sync) {
      this.update();
    } else {
      ASYNCSCHEDULER.schedule(this);
    }
  }

  /**
   * Just runs the callback with this effect as scope
   */
  override update(): void {
    // if there is a suspense (or multiple suspenses) only schedule if `suspended` > 0
    if (this.suspense?.suspended) {
      return;
    }

    const result = super.run(this.prevValue);

    if (result !== ERRORTHROWN_SYMBOL) {
      this.prevValue = result;
    }
  }

  /**
   * sets the new state and pushes itself on the effect queue
   * @param newState the new state
   */
  override stale(newState: CacheState): void {
    if (this.state >= newState) {
      return;
    }

    // if the state is not clean, it already has been added to execution queue
    if (this.state === STATE_CLEAN) {
      if (this.sync) {
        // the scheduler will be run by the observable after marking all observers
        SYNCSCHEDULER.schedule(this);
      } else {
        // the scheduler will be run on the next microtask
        ASYNCSCHEDULER.schedule(this);
      }
    }

    this.state = newState;
  }
}
