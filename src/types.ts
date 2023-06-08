// UTILS
import type {
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
  STATE_DISPOSED,
} from "~/context.ts";

// Magic type that when used at sites where generic types are inferred from, will prevent those sites from being involved in the inference.
// https://github.com/microsoft/TypeScript/issues/14829
// TypeScript Discord conversation: https://discord.com/channels/508357248330760243/508357248330760249/911266491024949328
// deno-lint-ignore no-explicit-any
export type NoInfer<T extends any> = [T][T extends any ? 0 : never];

// GLOBAL
export type CacheState =
  | typeof STATE_CLEAN
  | typeof STATE_CHECK
  | typeof STATE_DIRTY
  | typeof STATE_DISPOSED;

// OBSERVABLE
export type Accessor<T> = () => T;
export type Setter<T> = (nextValue: T | UpdateFunction<T>) => T;

export type EqualsFunction<T> = (prev: T, next: T) => boolean;
export type UpdateFunction<T> = (current: T) => T;

export type ObservableOptions<T> = {
  equals?: false | EqualsFunction<T>;
};

export type SignalOptions<T> = ObservableOptions<T>;
export interface Signal<T> extends Accessor<T> {
  set: Setter<T>;
}

// OWNER
export type CleanupFunction = () => void;
export type ErrorFunction = (error: Error) => void;

// ROOT
export type RootFunction<T> = (dispose: () => void) => T;

// OBSERVER
export type ObserverFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev,
) => Next;

// EFFECT
export type EffectOptions = {
  sync?: true | "init";
};
export type EffectFunction<Prev, Next extends Prev = Prev> = ObserverFunction<
  Prev,
  Next
>;

// MEMO
export type MemoOptions<T> = ObservableOptions<T>;

// ON
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

// BATCH
export type BatchFunction<T> = () => T | Promise<T>;
