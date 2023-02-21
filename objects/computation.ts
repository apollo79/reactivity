import { CONTEXT } from "../context";
import { runWithOwner } from "../utils/runWithOwner";
import {
  NON_STALE,
  Observable,
  ObservableOptions,
  STALE,
  Stale,
} from "./observable";
import { Owner } from "./owner";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev
) => Next;

export class Computation<Next, Init = unknown> extends Owner {
  fn: ComputationFunction<undefined | Init | Next, Next>;
  prevValue: Observable<Next>;
  waiting = 0;
  fresh = false;
  readonly init?: Init | undefined;

  constructor(
    fn: ComputationFunction<undefined | Init | Next, Next>,
    init?: Init,
    options?: ObservableOptions<Next | Init>
  ) {
    super();
    this.fn = fn;
    this.init = init;
    // extra `run` method which doesn't set the internal observable, which isn't created at the time
    this.prevValue = new Observable<Next>(this.run(), options);
  }

  run = (): Next => {
    // this.waiting = 0;

    if (Object.is(CONTEXT.OWNER, this)) {
      throw Error("Circular effect execution detected");
    }

    this.dispose();

    this.owner?.observers.add(this);

    return runWithOwner(
      () => this.fn(this.prevValue?.value || this.init),
      this,
      true
    )!;
  };

  update = () => {
    this.waiting = 0;

    return this.prevValue.set(this.run());
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
      this.update();
    }

    this.prevValue.stale(NON_STALE, false);
  };
}
