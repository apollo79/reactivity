import {
  ASYNCSCHEDULER,
  ERRORTHROWN_SYMBOL,
  STATE_CLEAN,
  SYNCSCHEDULER,
} from "~/context.ts";
import { Observer } from "~/objects/observer.ts";
import type { CacheState, EffectOptions, ObserverFunction } from "~/types.ts";

/**
 * An effect is executed immediately on creation and every time again when one of its dependencies changes
 */
export class Effect<T> extends Observer<T> {
  /** Stores the last return value of the callback */
  prevValue: T | undefined;
  declare readonly sync?: true;

  constructor(
    fn: ObserverFunction<undefined | T, T>,
    init?: T,
    options?: EffectOptions,
  ) {
    super(fn);

    this.prevValue = init;

    if (options?.sync === true) {
      this.sync = true;
    }

    if (options?.sync === "init") {
      this.update();
    } else {
      this.schedule();
    }
  }

  schedule(): void {
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
        SYNCSCHEDULER.schedule(this);
      } else {
        ASYNCSCHEDULER.schedule(this);
      }
    }

    this.state = newState;
  }
}
