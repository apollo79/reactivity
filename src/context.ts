import type { Observable } from "~/objects/observable.ts";
import type { Owner } from "~/objects/owner.ts";
import { Computation } from "./objects/computation.ts";

type Context = {
  OWNER: Owner | null;
  TRACKING: boolean;
  BATCH: Map<Observable<unknown>, unknown> | undefined;
};

export const CONTEXT: Context = {
  OWNER: null,
  TRACKING: false,
  BATCH: undefined,
};

export const CACHE_CLEAN = 1;
export const CACHE_CHECK = 2;
export const CACHE_DIRTY = 3;

export type CacheState =
  | typeof CACHE_CLEAN
  | typeof CACHE_CHECK
  | typeof CACHE_DIRTY;

export const ERRORHANDLERS_SYMBOL = Symbol("Error");
