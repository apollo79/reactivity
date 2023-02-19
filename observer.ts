import { context } from "./context";

export type ObserverFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev
) => Next;
export type ObserverInternals = {
  execute: () => void;
  observables: Set<Set<ObserverInternals>>;
};

export class Observer<Init, Next = unknown> {
  #fn: ObserverFunction<Init | Next, Next>;
  #observables = new Set<Set<ObserverInternals>>();
  #running: ObserverInternals;
  #prevValue: Init | Next;

  constructor(fn: ObserverFunction<Init | Next, Next>, init?: Init) {
    this.#fn = fn;
    this.#prevValue = init!;
    this.#running = {
      execute: this.execute,
      observables: this.#observables,
    };
    this.execute();
  }

  #cleanup = () => {
    for (const observable of this.#observables) {
      observable.delete(this.#running);
    }

    this.#observables.clear();
  };

  execute = () => {
    if (context.indexOf(this.#running) !== -1) {
      throw Error("Circular effect execution detected");
    }

    context.push(this.#running);

    this.#cleanup();

    try {
      this.#prevValue = this.#fn(this.#prevValue);
    } finally {
      context.pop();
    }
  };
}

export function createEffect<Next>(
  fn: ObserverFunction<undefined | Next, Next>
): void;
export function createEffect<Next, Init = Next>(
  fn: ObserverFunction<Init | Next, Next>,
  value: Init
): void;
export function createEffect<Next, Init>(
  fn: ObserverFunction<Init | Next, Next>,
  value?: Init
): void {
  new Observer(fn, value);
}
