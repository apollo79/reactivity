import type {
  Accessor,
  ObservableOptions,
  Setter,
} from "~/objects/observable.ts";
import { Observable } from "~/objects/observable.ts";

export type SignalOptions<T> = ObservableOptions<T>;
export type Signal<T> = Accessor<T> & {
  set: Setter<T>;
  peek: Accessor<T>;
};

export function createSignal<T>(): Signal<T | undefined>;
export function createSignal<T>(
  value: T,
  options?: SignalOptions<T>,
): Signal<T>;
export function createSignal<T>(value?: T, options?: SignalOptions<T>) {
  const observable = new Observable<T>(value, options);

  const { get, set, peek } = observable;

  const signal = get.bind(observable) as Signal<T>;

  signal.set = set.bind(observable);

  signal.peek = peek.bind(observable);

  return signal;
}
