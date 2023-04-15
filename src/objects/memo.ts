import { CacheState, STATE_CHECK } from "~/context.ts";
import { Computation, ComputationFunction } from "./computation.ts";
import { Observable } from "./observable.ts";
import type { ObservableOptions } from "./observable.ts";

/**
 * A memo is a computation that stores the last return value of its execution as observable so it can be depended on
 */
export class Memo<Next, Init = unknown> extends Computation<Next, Init> {
  prevValue: Observable<Next>;
  init?: Init;

  constructor(
    fn: ComputationFunction<undefined | Init | Next, Next>,
    init?: Init,
    options?: ObservableOptions<Next>,
  ) {
    super(fn);

    this.init = init;

    this.prevValue = new Observable<Next>(undefined, options);
    this.prevValue.parent = this as Memo<Next, unknown>;
  }

  override update(): Next {
    return this.prevValue.write(
      super.runComputation(this.prevValue.value ?? this.init),
    );
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
