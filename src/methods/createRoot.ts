import { Root, type RootFunction } from "~/objects/root.ts";

export function createRoot<T>(fn: RootFunction<T>) {
  return new Root(fn).wrap();
}
