import { CONTEXT } from "../context.ts";
import { Scope } from "../objects/scope.ts";

export function getContext<T = unknown>(
  id: symbol | string,
  scope: Scope | null = CONTEXT.CURRENTSCOPE,
): T | undefined {
  return scope?.get(id);
}
