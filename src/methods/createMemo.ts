import type { EffectFunction } from "~/methods/createEffect.ts";
import type { Accessor, ObservableOptions } from "~/objects/observable.ts";
import { NoInfer } from "../context.ts";
import { Memo } from "../objects/memo.ts";

export function createMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
): Accessor<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  value: Init,
  options?: ObservableOptions<Next>,
): Accessor<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  fn: EffectFunction<undefined | Init | Prev, Next>,
  value?: Init,
  options?: ObservableOptions<Next>,
): Accessor<Next> {
  const memo = new Memo(fn, value, options);

  return memo.prevValue.get.bind(memo.prevValue);
}
