import { CURRENTOWNER } from "~/context.ts";

export function setContext<T>(id: string | symbol, value: T): void {
  CURRENTOWNER?.set(id, value);
}
