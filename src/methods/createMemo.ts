import { Computation, ComputationOptions } from "~/objects/computation.ts";
import type { EffectFunction } from "~/methods/createEffect.ts";
import type { Accessor, ObservableOptions } from "~/objects/observable.ts";

export type Memo<T> = Accessor<T>;

export function createMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | Prev, Next>,
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
  const memoOptions: ComputationOptions<Next> = Object.assign(options ?? {}, {
    isMemo: true,
  });

  const computation = new Computation(
    fn,
    value,
    // @ts-ignore no idea why ts complains, since `Next` is included in `Next | Init | undefined`
    memoOptions,
  );

  return computation.prevValue.get.bind(computation.prevValue);
}
