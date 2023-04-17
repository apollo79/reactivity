import { type ComputationFunction } from "~/objects/computation.ts";
import type { ObservableOptions } from "~/objects/observable.ts";
import { NoInfer } from "../context.ts";
import { Effect } from "../objects/effect.ts";

export type EffectFunction<
  Prev,
  Next extends Prev = Prev,
> = ComputationFunction<Prev, Next>;

export type EffectOptions<T> = ObservableOptions<T>;

export function createEffect<Next>(
  fn: EffectFunction<undefined | NoInfer<Next>, Next>,
): () => void;
export function createEffect<Next, Init = Next>(
  fn: EffectFunction<Init | Next, Next>,
  value: Init,
): () => void;
export function createEffect<Next, Init>(
  fn: EffectFunction<undefined | Init | Next, Next>,
  value?: Init,
): () => void {
  const computation = new Effect(fn, value);

  computation.update();

  return computation.dispose.bind(computation);
}
