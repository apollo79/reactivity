import { Effect } from "~/objects/effect.ts";
import type { EffectFunction, EffectOptions, NoInfer } from "~/types.ts";

export function createEffect<Next>(
  fn: EffectFunction<undefined | NoInfer<Next>, Next>,
): () => void;
export function createEffect<Next, Init = Next>(
  fn: EffectFunction<Init | Next, Next>,
  value: Init,
  options?: EffectOptions,
): () => void;
export function createEffect<Next, Init>(
  fn: EffectFunction<undefined | Init | Next, Next>,
  value?: Init,
  options?: EffectOptions,
): () => void {
  const computation = new Effect(fn, value, options);

  return computation.dispose.bind(computation);
}
