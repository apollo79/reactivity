import { ReadonlySignal, Signal } from "~/types.ts";

export function readonly<T>(signal: Signal<T>): ReadonlySignal<T> {
  return () => signal();
}
