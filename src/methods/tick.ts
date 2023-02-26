import { runEffects } from "../scheduler.ts";

export function tick() {
  runEffects();
}
