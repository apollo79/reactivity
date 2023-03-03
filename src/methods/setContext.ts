import { CONTEXT } from "~/context.ts";
import { Scope } from "../objects/scope.ts";

export function setContext<T>(
  id: string | symbol,
  value: T,
  scope: Scope | null = CONTEXT.CURRENTSCOPE,
): void {
  if (scope === null) {
    return;
  }

  scope.set(id, value);
}
