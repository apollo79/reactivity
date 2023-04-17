import { ERRORHANDLERS_SYMBOL } from "~/context.ts";
import { Scope } from "~/objects/scope.ts";
import { runWithOwner } from "~/utils/runWithOwner.ts";

export type ErrorFunction = (error: Error) => void;

export function catchError(tryFn: () => void, handler: ErrorFunction) {
  const scope = new Scope();

  scope.contexts[ERRORHANDLERS_SYMBOL] = [handler];

  return runWithOwner(tryFn, scope, false);
}
