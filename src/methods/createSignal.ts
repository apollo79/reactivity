import { Observable } from "~/objects/observable.ts";
import type { Signal, SignalOptions } from "~/types.ts";

export function createSignal<T>(): Signal<T | undefined>;
export function createSignal<T>(
  value: T,
  options?: SignalOptions<T>,
): Signal<T>;
export function createSignal<T>(value?: T, options?: SignalOptions<T>) {
  const observable = new Observable<T>(value, options);

  const { read, write } = observable;

  const signal = read.bind(observable) as Signal<T>;

  signal.set = write.bind(observable);

  return signal;
}
