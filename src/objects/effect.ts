import { CacheState, STATE_CLEAN } from "~/context.ts";
import { EFFECT_QUEUE, flushEffects, SCHEDULED_EFFECTS } from "~/scheduler.ts";
import { Computation, ComputationFunction } from "./computation.ts";

export class Effect<Next, Init = unknown> extends Computation<Next, Init> {
  prevValue: Next | Init | undefined;

  constructor(
    fn: ComputationFunction<undefined | Init | Next, Next>,
    init?: Init,
  ) {
    super(fn);

    this.prevValue = init;
    this.prevValue = this.run();
  }

  run(): Next {
    return super.runComputation(this.prevValue);
  }

  stale(newState: CacheState) {
    if (this.state >= newState) {
      return;
    }

    if (this.state === STATE_CLEAN) {
      EFFECT_QUEUE.push(this as Effect<unknown, unknown>);

      if (!SCHEDULED_EFFECTS) {
        flushEffects();
      }
    }

    this.state = newState;
  }
}
