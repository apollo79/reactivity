import { Root } from "~/objects/root.ts";
import type { RootFunction } from "~/types.ts";

export function createRoot<T>(fn: RootFunction<T>): T {
  return new Root(fn).runWith();
}
