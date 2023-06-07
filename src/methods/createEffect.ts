import { type ObserverFunction } from "~/objects/observer.ts";
import { NoInfer } from "~/context.ts";
import { Effect, EffectOptions } from "~/objects/effect.ts";

export type EffectFunction<Prev, Next extends Prev = Prev> = ObserverFunction<
  Prev,
  Next
>;

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
