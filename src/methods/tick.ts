import { SCHEDULER } from "~/context.ts";

export function tick() {
  SCHEDULER.runEffects();
}
