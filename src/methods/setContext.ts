import { CURRENTOWNER } from "~/context.ts";
import { Owner } from "~/objects/owner.ts";

export function setContext<T>(
  id: string | symbol,
  value: T,
  scope: Owner | undefined = CURRENTOWNER,
): void {
  if (!scope) {
    return;
  }

  scope.set(id, value);
}
