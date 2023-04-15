import { CONTEXT } from "~/context.ts";
import type { Scope } from "~/objects/scope.ts";

export function getOwner(): Scope | null {
  return CONTEXT.CURRENTSCOPE;
}
