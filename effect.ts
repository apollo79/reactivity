import { Computation, ComputationFunction } from "./computation";

export type EffectFunction<
  Prev,
  Next extends Prev = Prev
> = ComputationFunction<Prev, Next>;

export class Effect<Init, Next = unknown> extends Computation<Init, Next> {}

export function createEffect<Next>(
  fn: EffectFunction<undefined | Next, Next>
): void;
export function createEffect<Next, Init = Next>(
  fn: EffectFunction<Init | Next, Next>,
  value: Init
): void;
export function createEffect<Next, Init>(
  fn: EffectFunction<Init | Next, Next>,
  value?: Init
): void {
  new Effect(fn, value);
}
