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

  schedule(effect: Effect<any>) {
    this.#queue.push(effect);
  }

  runEffects() {
    if (this.#queue.length) {
      this.running = true;
      
      const queue = this.#queue;
      // reset the queue here so that nested effects can get added during the execution of their parents
      this.#queue = [];

      for (let i = 0; i < queue.length; i++) {
        const effect = queue[i];
        // The state can be clean if the effect is the parent of one of the other effects in the queue and was therefore executed by an earlier `runTop` call
        if (effect.state !== STATE_CLEAN) {
          this.runTop(effect);
        }
      }

      // if nested effects were added, we execute them here
      if (this.#queue.length) {
        this.runEffects();
      }

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
 * The async scheduler allows automatic batching by deferring the execution of effects to the next microtask
 */
export class AsyncScheduler extends Scheduler {
  override method = "async" as ScheduleMethod;
  scheduled = false;

  override schedule(effect: Effect<any>): void {
    super.schedule(effect);

    this.flush();
  }

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
