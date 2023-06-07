import { ERRORHANDLER_SYMBOL } from "~/context.ts";
import { Owner } from "~/objects/owner.ts";
import { ErrorFunction } from "~/types.ts";

export function catchError(tryFn: () => void, handler: ErrorFunction) {
  const scope = new Owner();

  scope.contexts[ERRORHANDLER_SYMBOL] = handler;

  return Owner.runWithOwner(tryFn, scope, undefined);
}
