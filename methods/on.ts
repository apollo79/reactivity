import { Accessor } from "../objects/observable.ts";
import { EffectFunction } from "./createEffect.ts";
import { untrack } from "./untrack.ts";

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
  fn: OnEffectFunction<S, undefined | Prev, Next>,
  options?: OnOptions & { defer?: false },
): EffectFunction<undefined | Next, Next>;
export function on<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: OnEffectFunction<S, undefined | Prev, Next>,
  options: OnOptions & { defer: true },
): EffectFunction<undefined | Next>;
export function on<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: OnEffectFunction<S, undefined | Prev, Next>,
  options?: OnOptions,
): EffectFunction<undefined | Next> {
  const isArray = Array.isArray(deps);

  let defer = options?.defer;
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
      defer = true;
      return undefined;
    }

    const nextValue = untrack(() => fn(input, prevInput, prevValue));

    prevInput = input;

    return nextValue;
  };
}
