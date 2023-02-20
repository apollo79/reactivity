import { Computation } from "../objects/computation";
import { EffectFunction } from "./effect";
import { Accessor, ObservableOptions } from "../objects/observable";

export function createMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | Prev, Next>
): Accessor<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  value: Init,
  options?: ObservableOptions<Next>
): Accessor<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  fn: EffectFunction<undefined | Init | Prev, Next>,
  value?: Init,
  options?: ObservableOptions<Next>
): Accessor<Next> {
  return new Computation(
    fn,
    value,
    // @ts-ignore no idea why ts complains, since `Next` is included in `Next | Init | undefined`
    options
  ).prevValue.get;
}
