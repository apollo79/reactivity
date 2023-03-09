import { type ComputationFunction } from "~/objects/computation.ts";
import type { ObservableOptions } from "~/objects/observable.ts";
import { ComputationNode } from "~/objects/computation.ts";
import { NoInfer } from "../context.ts";
import { dispose } from "../objects/scope.ts";

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
  fn: EffectFunction<Init | Next, Next>,
  value?: Init,
): () => void {
  // @ts-ignore
  const computation = new ComputationNode(fn, value, {
    isEffect: true,
  });

  return dispose.bind(computation);

  // return computation.dispose.bind(computation);
}
