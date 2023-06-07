import { untrack } from "~/methods/untrack.ts";
import type {
  Accessor,
  AccessorArray,
  EffectFunction,
  NoInfer,
  OnEffectFunction,
  OnOptions,
} from "~/types.ts";

export function on<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
  options?: OnOptions & { defer?: false },
): EffectFunction<undefined | NoInfer<Next>, NoInfer<Next>>;
export function on<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
  options: OnOptions & { defer: true },
): EffectFunction<undefined | NoInfer<Next>>;
export function on<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
  options?: OnOptions,
): EffectFunction<undefined | NoInfer<Next>> {
  const isArray = Array.isArray(deps);

  let defer = options?.defer ?? false;
  let prevInput: S;

  return (prevValue) => {
    let input: S;

    if (isArray) {
      input = Array(deps.length) as S;

      for (let i = 0; i < deps.length; i++) {
        (input as unknown[])[i] = deps[i]();
      }
    } else {
      input = deps();
    }

    if (defer) {
      defer = false;

      return undefined;
    }

    const nextValue = untrack(() => fn(input, prevInput, prevValue));

    prevInput = input;

    return nextValue;
  };
}
