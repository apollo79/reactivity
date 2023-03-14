// import { STATE_CLEAN, STATE_DIRTY } from "./context.ts";
// import { createComputation, dispose, read, write } from "./core.ts";
// import {
//   Accessor,
//   EffectFunction,
//   NoInfer,
//   Setter,
//   SignalOptions,
// } from "./types.ts";

// export type Signal<T> = Accessor<T> & {
//   set: Setter<T>;
//   peek: Accessor<T>;
// };

// export function createSignal<T>(): Signal<T | undefined>;
// export function createSignal<T>(
//   value: T,
//   options?: SignalOptions<T>,
// ): Signal<T>;
// export function createSignal<T>(value?: T, options?: SignalOptions<T>) {
//   const observable = createComputation(null, value, STATE_CLEAN, options);

//   const signal = read.bind(observable) as Signal<T>;

//   signal.set = write.bind(observable) as Setter<T>;

//   return signal;
// }

// export type Memo<T> = Accessor<T> & {
//   peek: Accessor<T>;
// };

// export function createMemo<Next extends Prev, Prev = Next>(
//   fn: EffectFunction<Next, undefined | NoInfer<Prev>>,
// ): Memo<Next>;
// export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
//   fn: EffectFunction<Next, Init | Prev>,
//   value: Init,
//   options?: SignalOptions<Next>,
// ): Memo<Next>;
// export function createMemo<Next extends Prev, Init, Prev>(
//   fn: EffectFunction<Next, undefined | Init | Prev>,
//   value?: Init,
//   options?: SignalOptions<Next>,
// ): Memo<Next> {
//   const memoOptions = Object.assign(options ?? {}, {
//     isMemo: true,
//   });

//   const signal = createComputation(fn, value, STATE_DIRTY, memoOptions);

//   const accessor = read.bind(signal) as Memo<Next>;

//   return accessor;
// }

// export function createEffect<Next>(
//   fn: EffectFunction<Next, undefined | NoInfer<Next>>,
// ): () => void;
// export function createEffect<Next, Init = Next>(
//   fn: EffectFunction<Next, Init | Next>,
//   value: Init,
// ): () => void;
// export function createEffect<Next, Init>(
//   fn: EffectFunction<Next, Init | Next>,
//   value?: Init,
// ): () => void {
//   const computation = createComputation(fn, value, STATE_CLEAN, {
//     isMemo: false,
//   });

//   return dispose.bind(computation);
// }

import { STATE_CLEAN, STATE_DIRTY } from "./context.ts";
import { Reactive } from "./core.ts";
import {
  Accessor,
  EffectFunction,
  NoInfer,
  Setter,
  SignalOptions,
} from "./types.ts";

export type Signal<T> = Accessor<T> & {
  set: Setter<T>;
  peek: Accessor<T>;
};

export function createSignal<T>(): Signal<T | undefined>;
export function createSignal<T>(
  value: T,
  options?: SignalOptions<T>,
): Signal<T>;
export function createSignal<T>(value?: T, options?: SignalOptions<T>) {
  const observable = new Reactive(null, value, STATE_CLEAN, options);

  const signal = observable.read.bind(observable) as Signal<T>;

  signal.set = observable.write.bind(observable) as Setter<T>;

  return signal;
}

export type Memo<T> = Accessor<T> & {
  peek: Accessor<T>;
};

export function createMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<Next, undefined | NoInfer<Prev>>,
): Memo<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Next, Init | Prev>,
  value: Init,
  options?: SignalOptions<Next>,
): Memo<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  fn: EffectFunction<Next, undefined | Init | Prev>,
  value?: Init,
  options?: SignalOptions<Next>,
): Memo<Next> {
  const memoOptions = Object.assign(options ?? {}, {
    isMemo: true,
  });

  const signal = new Reactive(fn, value, STATE_DIRTY, memoOptions);

  const accessor = signal.read.bind(signal) as Memo<Next>;

  return accessor;
}

export function createEffect<Next>(
  fn: EffectFunction<Next, undefined | NoInfer<Next>>,
): () => void;
export function createEffect<Next, Init = Next>(
  fn: EffectFunction<Next, Init | Next>,
  value: Init,
): () => void;
export function createEffect<Next, Init>(
  fn: EffectFunction<Next, Init | Next>,
  value?: Init,
): () => void {
  const computation = new Reactive(fn, value, STATE_CLEAN, {
    isMemo: false,
  });

  return computation.dispose.bind(computation);
}
