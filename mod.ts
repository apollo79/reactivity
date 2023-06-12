import { CURRENTOWNER, ERRORTHROWN_SYMBOL } from "~/context.ts";
import { Owner } from "~/objects/owner.ts";

export { createSignal } from "~/methods/createSignal.ts";
export { createEffect } from "~/methods/createEffect.ts";
export { on } from "~/methods/on.ts";
export { createMemo } from "~/methods/createMemo.ts";
export { createRoot } from "~/methods/createRoot.ts";
export { batch } from "~/methods/batch.ts";
export { getContext } from "~/methods/getContext.ts";
export { setContext } from "~/methods/setContext.ts";
export { untrack } from "~/methods/untrack.ts";
export { onDispose } from "~/methods/onDispose.ts";
export { catchError } from "~/methods/catchError.ts";
export { tick } from "~/methods/tick.ts";
export { createSelector } from "~/methods/createSelector.ts";

export function getOwner(): Owner | undefined {
  return Owner.getOwner();
}

export function runWithOwner<T>(fn: () => T, owner: typeof CURRENTOWNER): T {
  const result = Owner.runWithOwner(fn, owner, undefined);

  return result === ERRORTHROWN_SYMBOL ? undefined! : result;
}

export type {
  Accessor,
  EffectFunction,
  EffectOptions,
  Signal,
  SignalOptions,
} from "~/types.ts";
export type { Owner } from "~/objects/owner.ts";
