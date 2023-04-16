import { CONTEXT } from "~/context.ts";

export function tick() {
  CONTEXT.SCHEDULER.runEffects();
}
