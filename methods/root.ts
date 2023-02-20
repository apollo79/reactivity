import { Root, RootFunction } from "../objects/root";

export function createRoot<T>(fn: RootFunction<T>) {
  return new Root(fn).wrap();
}
