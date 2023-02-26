import {
  CACHE_CHECK,
  CACHE_CLEAN,
  CACHE_DIRTY,
  CacheState,
  CONTEXT,
} from "~/context.ts";
import { runWithOwner } from "~/utils/runWithOwner.ts";
import { Owner } from "~/objects/owner.ts";
import { Observable, ObservableOptions } from "./observable.ts";
import { EFFECT_QUEUE, flushEffects, SCHEDULED_EFFECTS } from "../scheduler.ts";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev,
) => Next;

export type ComputationOptions<T> = ObservableOptions<T> & {
  isMemo?: boolean;
};

export class Computation<Next, Init = unknown> extends Owner {
  fn: ComputationFunction<undefined | Init | Next, Next>;
  prevValue: Observable<Next>;
  readonly init?: Init | undefined;
  isMemo: boolean;
  state: CacheState;

  constructor(
    fn: ComputationFunction<undefined | Init | Next, Next>,
    init?: Init,
    options?: ComputationOptions<Init | Next>,
  ) {
    super();
    this.fn = fn;
    this.init = init;
    this.isMemo = options?.isMemo ?? false;
    // extra `run` method which doesn't set the internal observable, which isn't created at the time
    this.prevValue = new Observable<Next>(
      this.isMemo ? undefined : this.run(),
      options,
    );

    this.state = this.isMemo ? CACHE_DIRTY : CACHE_CLEAN;

    if (this.isMemo) {
      this.prevValue.parent = this as Computation<Next, unknown>;
    }

    new Set();
  }

  run = (): Next => {
    if (Object.is(CONTEXT.OWNER, this)) {
      throw Error("Circular effect execution detected");
    }

    this.dispose();

    this.owner?.observers.add(this);

    return runWithOwner(
      () => this.fn(this.prevValue?.value ?? this.init),
      this,
      true,
    )!;
  };

  update = () => {
    this.state = CACHE_CLEAN;

    // if (!this.isZombie()) {
    return this.prevValue.set(this.run());
    // }
  };

  updateIfNecessary = () => {
    if (this.state === CACHE_CHECK) {
      for (const observable of this.observables) {
        observable.parent?.updateIfNecessary();
        if ((this.state as number) === CACHE_DIRTY) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    if (this.state === CACHE_DIRTY) {
      this.update();
    }

    this.state = CACHE_CLEAN;
  };

  stale = (change: CacheState) => {
    if (this.state >= change) {
      return;
    }

    if (this.state === CACHE_CLEAN) {
      EFFECT_QUEUE.push(this as Computation<unknown, unknown>);

      if (!SCHEDULED_EFFECTS) {
        flushEffects();
      }
    }

    this.state = change;

    this.prevValue?.stale(CACHE_CHECK);
  };
}
