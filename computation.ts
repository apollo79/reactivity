import { CONTEXT } from "./context";
import { Observable, ObservableOptions } from "./observable";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev
) => Next;

export class Computation<Init = unknown, Next = unknown> {
  fn: ComputationFunction<Init | Next, Next>;
  observables = new Set<Observable>();
  #prevValue: Observable<Init | Next>;

  constructor(
    fn: ComputationFunction<Init | Next, Next>,
    init?: Init,
    options?: ObservableOptions<Init | Next>
  ) {
    this.fn = fn;
    this.#prevValue = new Observable<Init | Next>(init!, options);
    this.execute();
  }

  cleanup = () => {
    this.observables.forEach((observable) => {
      observable.observers.delete(this as unknown as Computation);
    });

    this.observables.clear();
  };

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
      this.#prevValue.set(this.fn(this.#prevValue.get()));
    } finally {
      CONTEXT.OBSERVER = undefined;
    }

    CONTEXT.OBSERVER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  };
}
