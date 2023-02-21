import { CONTEXT } from "../context";
import { Owner } from "../objects/owner";

export function getOwner(): Owner | null {
  return CONTEXT.OWNER;
}
