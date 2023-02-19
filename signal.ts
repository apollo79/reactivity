import { Accessor, Observable, ObservableOptions, Setter } from "./observable";

export type SignalOptions<T> = ObservableOptions<T>;
export class Signal<T> extends Observable<T> {
  constructor(...args) {
    super(...args);
  }
}

export function createSignal<T>(): [
  get: Accessor<T | undefined>,
  set: Setter<T | undefined>
];
export function createSignal<T>(
  value: T,
  options?: SignalOptions<T>
): [get: Accessor<T>, set: Setter<T>];
export function createSignal<T>(value?, options?) {
  const { get, set } = new Observable<T>(value, options);

  return [get, set];
}
