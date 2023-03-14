import {
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
  STATE_DISPOSED,
} from "./core.ts";

// Magic type that when used at sites where generic types are inferred from, will prevent those sites from being involved in the inference.
// https://github.com/microsoft/TypeScript/issues/14829
// TypeScript Discord conversation: https://discord.com/channels/508357248330760243/508357248330760249/911266491024949328
// deno-lint-ignore no-explicit-any
export type NoInfer<T extends any> = [T][T extends any ? 0 : never];

export type CacheState =
  | typeof STATE_CLEAN
  | typeof STATE_CHECK
  | typeof STATE_DIRTY
  | typeof STATE_DISPOSED;

export type CacheStateNotify = typeof STATE_CHECK | typeof STATE_DIRTY;

export type Accessor<T> = () => T;
export type Setter<T> = (newValue: T | (() => T)) => T;

export type CleanupFunction = () => void;

export type DisposeFunction = () => void;

export type Scope = {
  parentScope: Scope | null;
  childrenScopes: Set<Scope>;
  contexts: Record<string | symbol, unknown>;
  cleanups: CleanupFunction[];
  state: CacheState;
  sources?: Computation<any, any>[];
  dispose: DisposeFunction;
  lookup: <T>(id: string | symbol) => T | undefined;
};

export type ComputationFunction<Next extends Prev, Prev = Next> = (
  prev: Prev,
) => Next;

export type EqualsFunction<T> = (prev: T, next: T) => boolean;

export type ComputationOptions<T> = {
  isMemo?: boolean;
  equals?: EqualsFunction<T>;
};

export type Computation<Init, Next extends Init = Init> = Scope & {
  fn: ComputationFunction<Next, Init | Next> | null;
  isMemo: boolean;
  value: Init;
  observers?: Computation<any, any>[];
  equals: EqualsFunction<Init>;
};

export type ErrorFunction = (error: Error) => void;

export type SignalOptions<T> = {
  equals: EqualsFunction<T>;
};

export type Signal<T> = Accessor<T> & {
  set: Setter<T>;
  // peek: Accessor<T>;
};

export type EffectFunction<
  Next extends Prev,
  Prev = Next,
> = ComputationFunction<Next, Prev>;
