import { STATE_CLEAN } from "~/context.ts";
import { Effect } from "~/objects/effect.ts";

export type ScheduleMethod = "sync" | "async";

/**
 * The scheduler handles the execution of effects
 */
export abstract class Scheduler {
  #queue: Effect<any>[] = [];
  running = false;
  abstract readonly method: ScheduleMethod;

  enqueue(effect: Effect<any>) {
    this.#queue.push(effect);
  }

  runEffects() {
    if (this.#queue.length) {
      this.running = true;

      this.#queue.forEach((effect) => {
        // The state can be clean if the effect is the parent of one of the other effects in the queue and was therefore executed by an earlier `runTop` call
        if (effect.state !== STATE_CLEAN) {
          this.runTop(effect);
        }
      });

      this.#queue = [];
      this.running = false;
    }
  }

  /** @see https://github.com/maverick-js/signals/blob/main/src/core.ts#L50 */
  runTop(node: Effect<any>) {
    const ancestors = [node];

    while ((node = node.parentScope as Effect<any>)) {
      if (node?.state !== STATE_CLEAN) {
        ancestors.push(node);
      }
    }

    for (let i = ancestors.length - 1; i >= 0; i--) {
      ancestors[i].updateIfNecessary();
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
