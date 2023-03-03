import { Effect } from "./objects/effect.ts";

export function runEffects() {
  if (EFFECT_QUEUE.length !== 0) {
    RUNNING_EFFECTS = true;

    EFFECT_QUEUE.forEach((effect) => {
      if (!effect.isZombie()) {
        effect.updateIfNecessary();
      }
    });

    EFFECT_QUEUE = [];
    RUNNING_EFFECTS = false;
  }

  SCHEDULED_EFFECTS = false;
}

export function flushEffects() {
  SCHEDULED_EFFECTS = true;
  queueMicrotask(runEffects);
}

export let SCHEDULED_EFFECTS = false;
export let RUNNING_EFFECTS = false;

export let EFFECT_QUEUE: Effect<unknown, unknown>[] = [];
