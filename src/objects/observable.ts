import {
  CURRENTOBSERVER,
  STATE_DIRTY,
  STATE_DISPOSED,
  SYNCSCHEDULER,
} from "~/context.ts";
import type { Observer } from "~/objects/observer.ts";
import type { Memo } from "~/objects/memo.ts";
import type {
  CacheState,
  EqualsFunction,
  ObservableOptions,
  UpdateFunction,
} from "~/types.ts";

/**
 * An observable can be a dependency of effects / memos
 */
export class Observable<T = unknown> {
  /**
   * Holds a reference to the parent memo, as the memo holds its value with this observable.
   * The memo notifies its dependencies over this observable.
   * Plus, when this observable is read, it tells the memo to update if necessary
   */
  parent: Memo<T> | null = null;
  /** One part of the double-linked list between computations and observables. It holds all computations that observe this observable. */
  observers = new Set<Observer<any>>();
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
    const running = CURRENTOBSERVER;

    if (running) {
      // store the computation in our part of the list
      this.observers.add(running);

      // store us in the computation's part of the list
      running.sources.add(this);
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
    const nextValue = typeof value === "function"
      ? (value as UpdateFunction<T>)(this.value)
      : value;

    // check if the new value is actually different than the old one
    if (!this.equals(this.value, nextValue)) {
      this.value = nextValue;

      // notify computations about the new value
      this.stale(STATE_DIRTY);
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

    SYNCSCHEDULER.flush();
  }
}
