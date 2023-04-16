import { Effect } from "./objects/effect.ts";

export type ScheduleMethod = "sync" | "async";

/**
 * The scheduler handles the execution of effects
 */
export abstract class Scheduler {
  #queue: Effect<any, any>[] = [];
  running = false;
  abstract readonly method: ScheduleMethod;

  enqueue(effect: Effect<any, any>) {
    this.#queue.push(effect);
  }

  runEffects() {
    if (this.#queue.length) {
      this.running = true;

      this.#queue.forEach((effect) => {
        if (!effect.isZombie()) {
          effect.updateIfNecessary();
        }
      });

      this.#queue = [];
      this.running = false;
    }
  }

  abstract flush(): void;
}

/**
 * The sync scheduler is executed after every change to a signal
 */
export class SyncScheduler extends Scheduler {
  override method = "sync" as ScheduleMethod;

  override flush(): void {
    this.runEffects();
  }
}

/**
 * The async scheduler allows automatic batching by deferring the execution of effects to the next microtask
 */
export class AsyncScheduler extends Scheduler {
  override method = "async" as ScheduleMethod;
  scheduled = false;

  override runEffects(): void {
    super.runEffects();

    this.scheduled = false;
  }

  override flush(): void {
    if (this.scheduled) {
      return;
    }

    this.scheduled = true;

    queueMicrotask(() => {
      this.runEffects();
    });
  }
}
