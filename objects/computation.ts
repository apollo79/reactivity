import { CONTEXT } from "../context";
import { wrapComputation } from "../utils/wrapComputation";
import {
  NON_STALE,
  Observable,
  ObservableOptions,
  STALE,
  Stale,
} from "./observable";
import { Observer } from "./observer";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev
) => Next;

export class Computation<Next, Init = unknown> extends Observer {
  fn: ComputationFunction<Init | Next, Next>;
  prevValue: Observable<Next | Init>;
  waiting = 0;
  fresh = false;

  constructor(
    fn: ComputationFunction<Init | Next, Next>,
    init?: Init,
    options?: ObservableOptions<Next | Init>
  ) {
    super();
    this.fn = fn;
    this.prevValue = new Observable<Next | Init>(init, options);
    this.execute();
  }

  execute = () => {
    this.waiting = 0;

    if (Object.is(CONTEXT.OBSERVER, this)) {
      throw Error("Circular effect execution detected");
    }

    this.dispose();

    this.parent?.observers.add(this);

    return wrapComputation(this.fn, this, true);
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
