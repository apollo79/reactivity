import { ERRORHANDLER_SYMBOL } from "~/context.ts";
import { Owner } from "~/objects/owner.ts";
import { ErrorFunction } from "~/types.ts";

export function catchError(tryFn: () => void, handler: ErrorFunction) {
  const owner = new Owner();

  owner.context = { [ERRORHANDLER_SYMBOL]: handler };

  return Owner.runWithOwner(tryFn, owner, undefined);
}
