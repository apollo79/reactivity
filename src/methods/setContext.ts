import { CONTEXT } from "~/context.ts";
import { Owner } from "../objects/owner.ts";

export function setContext<T>(
  id: string | symbol,
  value: T,
  scope: Owner | null = CONTEXT.CURRENTOWNER,
): void {
  if (scope === null) {
    return;
  }

  scope.set(id, value);
}
