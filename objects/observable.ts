import { Computation } from "./computation";
import { CONTEXT } from "../context";

export type Accessor<T> = () => T;
export type Setter<T> = (nextValue: T) => T;

type EqualsFunction<T> = (prev: T, next: T) => boolean;
type UpdateFunction<T> = (current: T) => T;

export type Stale = typeof STALE | typeof NON_STALE;
export const STALE = 1;
export const NON_STALE = -1;

export type ObservableOptions<T> = {
  equals?: false | EqualsFunction<T>;
};

export class Observable<T = unknown> {
  observers = new Set<Computation<any, any>>();
  value: T;
  // the function to compare nextValue to the current value
  equals: EqualsFunction<T>;

  constructor(value?: T, options?: ObservableOptions<T>) {
    this.value = value!;
    this.equals =
      options?.equals === false ? () => false : options?.equals || Object.is;
  }

  /**
   * stores dependencies between observables and computations in a double-linked list
   */
  #subscribe = () => {
    const running = CONTEXT.OBSERVER;

    if (CONTEXT.TRACKING && running && running instanceof Computation) {
      this.observers.add(running);
      running.observables.add(this as Observable<unknown>);
    }
  };

  get: Accessor<T> = () => {
    this.#subscribe();

    return this.value;
  };

  set: Setter<T> = (value: UpdateFunction<T> | T): T => {
    const nextValue = value instanceof Function ? value(this.value) : value;

    if (!this.equals(this.value, nextValue)) {
      if (CONTEXT.BATCH) {
        CONTEXT.BATCH.set(this, nextValue);
      } else {
        this.value = nextValue;
        // cloning, so elements inserted while executing do not affect this to run

        this.stale(STALE, true);

        this.stale(NON_STALE, true);
      }
    }

    return this.value;
  };

  stale = (change: Stale, fresh: boolean) => {
    this.observers.forEach((observer) => {
      observer.stale(change, fresh);
    });
  };
}
