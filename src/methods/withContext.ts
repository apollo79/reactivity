import { Context } from "~/objects/context.ts";
import { Contexts } from "~/types.ts";

export function withContext<T>(contexts: Contexts, fn: () => T): T {
  const owner = new Context(contexts);

  return owner.runWith(fn);
}
