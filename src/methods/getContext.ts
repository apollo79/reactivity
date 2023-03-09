import { CONTEXT } from "../context.ts";
import { lookup, Scope } from "../objects/scope.ts";

export function getContext<T = unknown>(
  id: symbol | string,
  scope: Scope | null = CONTEXT.CURRENTSCOPE,
): T | undefined {
  if (scope === null) {
    return undefined;
  }

  return lookup(scope, id);
}
