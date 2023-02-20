import { CONTEXT } from "../context";
import {
  NON_STALE,
  Observable,
  ObservableOptions,
  STALE,
  Stale,
} from "./observable";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev
) => Next;

export class Computation<Next, Init = unknown> {
  fn: ComputationFunction<Init | Next, Next>;
  observables = new Set<Observable<any>>();
  prevValue: Observable<Next | Init>;
  waiting = 0;
  fresh = false;

  constructor(
    fn: ComputationFunction<Init | Next, Next>,
    init?: Init,
    options?: ObservableOptions<Next | Init>
  ) {
    this.fn = fn;
    this.prevValue = new Observable<Next | Init>(init, options);
    this.execute();
  }

  cleanup = () => {
    this.observables.forEach((observable) => {
      observable.observers.delete(this);
    });

    this.observables.clear();
  };

  execute = () => {
    this.waiting = 0;

    if (Object.is(CONTEXT.OBSERVER, this)) {
      throw Error("Circular effect execution detected");
    }

    const PREV_OBSERVER = CONTEXT.OBSERVER;
    const PREV_TRACKING = CONTEXT.TRACKING;

    CONTEXT.OBSERVER = this;
    CONTEXT.TRACKING = true;

    this.cleanup();

    try {
      // use value here, as with `get` we would register ourselves as listening to our own signal which would cause an infinite loop
      this.prevValue.set(this.fn(this.prevValue.value));
    } finally {
      CONTEXT.OBSERVER = PREV_OBSERVER;
      CONTEXT.TRACKING = PREV_TRACKING;
    }
  };

  stale = (change: Stale, fresh: boolean) => {
    if (this.waiting === 0 && change === NON_STALE) {
      return;
    }

    if (this.waiting === 0 && change === STALE) {
      this.prevValue.stale(STALE, false);
    }

    this.waiting += change;

    if (this.fresh === false && fresh === true) {
      this.fresh = true;
    }

    if (this.waiting === 0) {
      this.execute();
    }

    this.prevValue.stale(NON_STALE, false);
  };
}
