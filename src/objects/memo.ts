import { CacheState, STATE_CHECK } from "~/context.ts";
import { Computation, ComputationFunction } from "./computation.ts";
import { Observable } from "./observable.ts";
import type { ObservableOptions } from "./observable.ts";

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

  run(): Next {
    return this.prevValue.set(
      super.runComputation(this.prevValue.value ?? this.init),
    );
  }

  stale(newState: CacheState) {
    if (this.state >= newState) {
      return;
    }

    this.state = newState;

    this.prevValue.stale(STATE_CHECK);
  }
}
