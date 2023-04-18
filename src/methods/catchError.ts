import { ERRORHANDLER_SYMBOL } from "~/context.ts";
import { Owner } from "~/objects/owner.ts";

export type ErrorFunction = (error: Error) => void;

export function catchError(tryFn: () => void, handler: ErrorFunction) {
  const scope = new Owner();

  scope.contexts[ERRORHANDLER_SYMBOL] = handler;

  return Owner.runWithOwner(tryFn, scope, undefined);
}
