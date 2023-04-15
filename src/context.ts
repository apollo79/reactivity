import type { Scope } from "~/objects/scope.ts";

type Context = {
  CURRENTSCOPE: Scope | null;
  TRACKING: boolean;
};

export const CONTEXT: Context = {
  CURRENTSCOPE: null,
  TRACKING: false,
};

export const STATE_CLEAN = 1;
export const STATE_CHECK = 2;
export const STATE_DIRTY = 3;
export const STATE_DISPOSED = 4;

export type CacheState =
  | typeof STATE_CLEAN
  | typeof STATE_CHECK
  | typeof STATE_DIRTY
  | typeof STATE_DISPOSED;

export const ERRORHANDLERS_SYMBOL = Symbol("Errorhandlers");

// Magic type that when used at sites where generic types are inferred from, will prevent those sites from being involved in the inference.
// https://github.com/microsoft/TypeScript/issues/14829
// TypeScript Discord conversation: https://discord.com/channels/508357248330760243/508357248330760249/911266491024949328
// deno-lint-ignore no-explicit-any
export type NoInfer<T extends any> = [T][T extends any ? 0 : never];
