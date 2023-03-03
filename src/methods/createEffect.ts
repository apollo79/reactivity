import {
  Computation,
  type ComputationFunction,
} from "~/objects/computation.ts";
import type { ObservableOptions } from "~/objects/observable.ts";

export type EffectFunction<
  Prev,
  Next extends Prev = Prev,
> = ComputationFunction<Prev, Next>;

export type EffectOptions<T> = ObservableOptions<T>;

export function createEffect<Next>(
  fn: EffectFunction<undefined | Next, Next>,
): () => void;
export function createEffect<Next, Init = Next>(
  fn: EffectFunction<Init | Next, Next>,
  value: Init,
): () => void;
export function createEffect<Next, Init>(
  fn: EffectFunction<Init | Next, Next>,
  value?: Init,
): () => void {
  // @ts-ignore this is ok with the overloads but ts doesn't like it
  const computation = new Computation(fn, value);

  return computation.dispose.bind(computation);
}
