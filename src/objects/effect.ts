import { CacheState, CONTEXT, STATE_CLEAN } from "~/context.ts";
import { Computation, ComputationFunction } from "./computation.ts";

/**
 * An effect is executed immediately on creation and every time again when one of its dependencies changes
 */
export class Effect<T> extends Computation<T> {
  /** Stores the last return value of the callback */
  prevValue: T | undefined;

  constructor(fn: ComputationFunction<undefined | T, T>, init?: T) {
    super(fn);

    this.prevValue = init;
    this.update();
  }

  /**
   * Just runs the callback with this effect as scope
   */
  override update(): T {
    const result = super.run(this.prevValue);

    this.prevValue = result;

    return result;
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
      CONTEXT.SCHEDULER.enqueue(this);

      // If not already done in another effect, queue a microtask to execute all effects
      // if (!SCHEDULED_EFFECTS) {
      //   flushEffects();
      // }
    }

    this.state = newState;
  }
}
