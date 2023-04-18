import { ERRORHANDLER_SYMBOL } from "~/context.ts";
import { Owner } from "~/objects/owner.ts";
import { runWithOwner } from "~/utils/runWithOwner.ts";

export type ErrorFunction = (error: Error) => void;

export function catchError(tryFn: () => void, handler: ErrorFunction) {
  const scope = new Owner();

  scope.contexts[ERRORHANDLER_SYMBOL] = handler;

  return runWithOwner(tryFn, scope, false);
}
