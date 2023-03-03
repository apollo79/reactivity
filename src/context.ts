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

export const ERRORHANDLERS_SYMBOL = Symbol("Error");
