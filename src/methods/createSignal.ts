import {
  Accessor,
  ObservableNode,
  ObservableOptions,
  read,
  Setter,
  write,
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
  // @ts-ignore
  const observable = new ObservableNode<T>(value, options);

  const signal = read.bind(observable) as Signal<T>;

  // const { set, peek } = observable;

  signal.set = write.bind(observable) as Setter<T>;

  // signal.peek = peek.bind(observable);

  return signal;
}
