import { CURRENTOWNER } from "~/context.ts";
import type { Owner } from "~/objects/owner.ts";

export function getContext<T = unknown>(
  id: symbol | string,
  scope: Owner | null = CURRENTOWNER,
): T | undefined {
  return scope?.get(id);
}
