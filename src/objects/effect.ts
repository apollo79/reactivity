import {
  ASYNCSCHEDULER,
  CacheState,
  ERRORTHROWN_SYMBOL,
  STATE_CLEAN,
} from "~/context.ts";
import { Observer, type ObserverFunction } from "~/objects/observer.ts";

/**
 * An effect is executed immediately on creation and every time again when one of its dependencies changes
 */
export class Effect<T> extends Observer<T> {
  /** Stores the last return value of the callback */
  prevValue: T | undefined;

  constructor(fn: ObserverFunction<undefined | T, T>, init?: T) {
    super(fn);

    this.prevValue = init;

    ASYNCSCHEDULER.schedule(this);
  }

  /**
   * Just runs the callback with this effect as scope
   */
  override update(): T {
    const result = super.run(this.prevValue);

    if (result !== ERRORTHROWN_SYMBOL) {
      this.prevValue = result;

      return result;
    }
    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }

  /**
   * sets the new state and pushes itself on the effect queue
   * @param newState the new state
   */
  override stale(newState: CacheState): void {
    if (this.state >= newState) {
      return;
    }

    if (this.state === STATE_CLEAN) {
      ASYNCSCHEDULER.schedule(this);
    }

    this.state = newState;
  }
}
