import { context } from "./context";
import { ObserverInternals } from "./observer";

export type Accessor<T> = () => T;
export type Setter<T> = (nextValue: T) => T;
export type Signal<T> = [get: Accessor<T>, set: Setter<T>];

type EqualsFunction<T> = (prev: T, next: T) => boolean;
type UpdateFunction<T> = (current: T) => T;

export type ObservableOptions<T> = {
  equals?: false | EqualsFunction<T>;
};

export class Observable<T> {
  observers = new Set<ObserverInternals>();
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
    const running = context[context.length - 1];

    if (running) {
      this.observers.add(running);
      running.observables.add(this.observers);
    }
  };

  get = () => {
    this.#subscribe();

    return this.value;
  };

  set = (value: UpdateFunction<T> | T): T => {
    const nextValue = value instanceof Function ? value(this.value) : value;

    if (!this.equals(this.value, nextValue)) {
      this.value = nextValue;
      // cloning, so elements inserted while executing do not affect this to run

      for (const computation of [...this.observers]) {
        computation.execute();
      }
    }

    return this.value;
  };
}

export function createSignal<T>(): Signal<T | undefined>;
export function createSignal<T>(value: T): Signal<T>;
export function createSignal<T>(value?: T): Signal<T | undefined> {
  const { get, set } = new Observable<T | undefined>(value);

  return [get, set];
}
