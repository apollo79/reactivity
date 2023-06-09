import { Memo } from "~/objects/memo.ts";
import type {
  EffectFunction,
  MemoOptions,
  NoInfer,
  ReadonlySignal,
} from "~/types.ts";

export function createMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
): ReadonlySignal<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  value: Init,
  options?: MemoOptions<Next>,
): ReadonlySignal<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  fn: EffectFunction<undefined | Init | Prev, Next>,
  value?: Init,
  options?: MemoOptions<Next>,
): ReadonlySignal<Next> {
  const { prevValue } = new Memo<Init | Next>(
    fn,
    value,
    options as MemoOptions<Init | Next>,
  );

  const accessor = prevValue.read.bind(prevValue) as ReadonlySignal<Next>;

  return accessor;
}
