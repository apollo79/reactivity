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
  fn: EffectFunction<Init | Prev, Next>,
  value?: Init,
  options?: ObservableOptions<Next>
): Accessor<Next> {
  return new Computation(
    fn,
    value,
    options as ObservableOptions<Next | Init> | undefined
  ).prevValue.get as unknown as Accessor<Next>;
}
