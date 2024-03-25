import { CURRENTOWNER } from "~/context.ts";

export function getContext<T = unknown>(id: symbol | string): T | undefined {
  return CURRENTOWNER?.get(id);
}
