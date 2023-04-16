import { CacheState, CONTEXT, STATE_CLEAN } from "~/context.ts";
import { Computation, ComputationFunction } from "./computation.ts";

/**
 * An effect is executed immediately on creation and every time again when one of its dependencies changes
 */
export class Effect<Next, Init = unknown> extends Computation<Next, Init> {
  /** Stores the last return value of the callback */
  prevValue: Next | Init | undefined;

  constructor(
    fn: ComputationFunction<undefined | Init | Next, Next>,
    init?: Init,
  ) {
    super(fn);

    this.prevValue = init;
    this.update();
  }

  /**
   * Just runs the callback with this effect as scope
   */
  override update(): Next {
    const result = super.runComputation(this.prevValue);

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
