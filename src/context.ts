import type { Observable } from "~/objects/observable.ts";
import type { Owner } from "~/objects/owner.ts";

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

export const ERRORHANDLERS_SYMBOL = Symbol("Error");
