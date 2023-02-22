import { CONTEXT } from "~/context.ts";
import type { Owner } from "~/objects/owner.ts";

export function getOwner(): Owner | null {
  return CONTEXT.OWNER;
}
