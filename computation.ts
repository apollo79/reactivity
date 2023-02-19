import { CONTEXT } from "./context";
import { Observable, ObservableOptions } from "./observable";
import { Observer } from "./observer";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev
) => Next;

export class Computation<Init = unknown, Next = unknown> extends Observer {
  #fn: ComputationFunction<Init | Next, Next>;
  observables = new Set<Observable<unknown>>();
  #prevValue: Observable<Init | Next>;

  constructor(
    fn: ComputationFunction<Init | Next, Next>,
    init?: Init,
    options?: ObservableOptions<Init | Next>
  ) {
    super();
    this.#fn = fn;
    this.#prevValue = new Observable<Init | Next>(init!, options);
    this.execute();
  }

  execute = () => {
    if (Object.is(CONTEXT.OBSERVER, this)) {
      throw Error("Circular effect execution detected");
    }

    const PREV_OBSERVER = CONTEXT.OBSERVER;
    const PREV_TRACKING = CONTEXT.TRACKING;

    CONTEXT.OBSERVER = this;
    CONTEXT.TRACKING = true;

    this.cleanup();

    try {
      this.#prevValue.set(this.#fn(this.#prevValue.get()));
    } finally {
      CONTEXT.OBSERVER = undefined;
    }

    CONTEXT.OBSERVER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  };
}
