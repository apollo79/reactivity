import { CONTEXT, ERRORHANDLERS_SYMBOL } from "~/context.ts";
import type { ErrorFunction } from "~/methods/onError.ts";
import type { Scope } from "~/objects/scope.ts";
import { castError } from "~/utils/castError.ts";
import { handleError } from "./handleError.ts";

export function runWithOwner<T>(
  fn: () => T,
  owner: Scope | null,
  tracking = true,
): T | undefined {
  const PREV_OBSERVER = CONTEXT.CURRENTSCOPE;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.CURRENTSCOPE = owner;
  CONTEXT.TRACKING = tracking;

  try {
    return fn();
  } catch (error: unknown) {
    handleError(error);
  } finally {
    CONTEXT.CURRENTSCOPE = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
