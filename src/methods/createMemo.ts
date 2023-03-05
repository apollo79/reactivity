import type { EffectFunction } from "~/methods/createEffect.ts";
import type { Accessor, ObservableOptions } from "~/objects/observable.ts";
import { NoInfer } from "../context.ts";
import { Memo as MemoClass } from "../objects/memo.ts";

export type Memo<T> = Accessor<T> & {
  peek: Accessor<T>;
};

export function createMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
): Memo<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  value: Init,
  options?: ObservableOptions<Next>,
): Memo<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  fn: EffectFunction<undefined | Init | Prev, Next>,
  value?: Init,
  options?: ObservableOptions<Next>,
): Memo<Next> {
  const { prevValue } = new MemoClass(fn, value, options);

  const accessor = prevValue.get.bind(prevValue) as Memo<Next>;

  accessor.peek = prevValue.peek.bind(prevValue);

  return accessor;
}
