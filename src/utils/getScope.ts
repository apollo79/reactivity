import { CONTEXT } from "~/context.ts";
import type { Scope } from "~/objects/scope.ts";

export function getScope(): Scope | null {
  return CONTEXT.CURRENTSCOPE;
}
