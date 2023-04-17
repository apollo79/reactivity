import type { EffectFunction } from "~/methods/createEffect.ts";
import type { Accessor } from "~/objects/observable.ts";
import type { NoInfer } from "../context.ts";
import { Memo, type MemoOptions } from "../objects/memo.ts";

export function createMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
): Accessor<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  value: Init,
  options?: MemoOptions<Next>,
): Accessor<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  fn: EffectFunction<undefined | Init | Prev, Next>,
  value?: Init,
  options?: MemoOptions<Next>,
): Accessor<Next> {
  const { prevValue } = new Memo<Init | Next>(
    fn,
    value,
    options as MemoOptions<Init | Next>,
  );

  const accessor = prevValue.read.bind(prevValue) as Accessor<Next>;

  return accessor;
}
