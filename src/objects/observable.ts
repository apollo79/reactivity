import { Computation } from "~/objects/computation.ts";
import {
  type CacheState,
  CONTEXT,
  STATE_DIRTY,
  STATE_DISPOSED,
} from "~/context.ts";
import { Memo } from "./memo.ts";

export type Accessor<T> = () => T;
export type Setter<T> = (nextValue: T | UpdateFunction<T>) => T;

type EqualsFunction<T> = (prev: T, next: T) => boolean;
type UpdateFunction<T> = (current: T) => T;

export type ObservableOptions<T> = {
  equals?: false | EqualsFunction<T>;
};

/**
 * An observable can be a dependency of effects / memos
 */
export class Observable<T = unknown> {
  /**
   * Holds a reference to the parent memo, as the memo holds its value with this observable.
   * The memo notifies its dependencies over this observable.
   * Plus, when this observable is read, it tells the memo to update if necessary
   */
  parent?: Memo<T, unknown>;
  /** One part of the double-linked list between computations and observables. It holds all computations that observe this observable. */
  observers = new Set<Computation<unknown, unknown>>();
  value: T;
  // the function to compare nextValue to the current value
  equals: EqualsFunction<T>;

  constructor(value?: T, options?: ObservableOptions<T>) {
    this.value = value!;
    this.equals = options?.equals === false
      ? () => false
      : options?.equals || Object.is;
  }

  /**
   * Stores dependencies between observables and computations in a double-linked list
   */
  #subscribe() {
    const running = CONTEXT.CURRENTSCOPE;

    if (CONTEXT.TRACKING && running instanceof Computation) {
      // store the computation in our part of the list
      this.observers.add(running);

      // store us in the computation's part of the list
      running.sources.add(this as Observable<unknown>);
    }
  }

  /**
   * Gets the current value of the observable
   * @returns the current value
   */
  read(): T {
    if (this.parent?.state === STATE_DISPOSED) {
      return this.value;
    }

    this.#subscribe();

    // If there is a parent memo, check if it has to be reexecuted, so that we have the correct value
    this.parent?.updateIfNecessary();

    return this.value;
  }

  /**
   * Sets a new value, but only, if it is different than the old one. This behaviour can be modified with the `equals` option of an observable
   * @param value the new value or a function that returns the new value
   * @returns The new value
   */
  write(value: T | UpdateFunction<T>): T {
    const nextValue = value instanceof Function ? value(this.value) : value;

    // check if the new value is actually different than the old one
    if (!this.equals(this.value, nextValue)) {
      this.value = nextValue;

      // notify computations about the new value
      this.stale(STATE_DIRTY);

      CONTEXT.SCHEDULER.flush();
    }

    return this.value;
  }

  /**
   * Notifies all observers about the new state
   * @param newState
   */
  stale(newState: CacheState): void {
    for (const observer of this.observers) {
      observer.stale(newState);
    }
  }
}
