import type { Accessor } from "~/objects/observable.ts";
import type { EffectFunction } from "~/methods/createEffect.ts";
import { untrack } from "~/methods/untrack.ts";
import { NoInfer } from "../context.ts";

// transforms a tuple to a tuple of accessors in a way that allows generics to be inferred
export type AccessorArray<T> = [
  ...Extract<{ [K in keyof T]: Accessor<T[K]> }, readonly unknown[]>,
];

export type OnEffectFunction<S, Prev, Next extends Prev = Prev> = (
  input: S,
  prevInput: S | undefined,
  prev: Prev,
) => Next;

export type OnOptions = { defer: boolean };

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
