import { ASYNCSCHEDULER } from "~/context.ts";

export function tick() {
  ASYNCSCHEDULER.runEffects();
}
