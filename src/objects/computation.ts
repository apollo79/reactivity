import {
  CacheState,
  CONTEXT,
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
} from "~/context.ts";
import { runWithScope } from "~/utils/runWithScope.ts";
import { Scope } from "~/objects/scope.ts";
import { Observable, ObservableOptions } from "./observable.ts";
import { EFFECT_QUEUE, flushEffects, SCHEDULED_EFFECTS } from "../scheduler.ts";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev,
) => Next;

export type ComputationOptions<T> = ObservableOptions<T> & {
  isMemo?: boolean;
};

export class Computation<Next, Init = unknown> extends Scope {
  fn: ComputationFunction<undefined | Init | Next, Next>;
  prevValue: Observable<Next>;
  readonly init?: Init | undefined;
  isMemo: boolean;

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

    if (this.isMemo) {
      this.prevValue.parent = this as Computation<Next, unknown>;
    } else {
      this.state = STATE_CLEAN;
    }
  }

  run(): Next {
    if (Object.is(CONTEXT.CURRENTSCOPE, this)) {
      throw Error("Circular effect execution detected");
    }

    this.dispose();

    this.parentScope?.childrenObservers.add(this);

    const result = runWithScope(
      () => this.fn(this.prevValue?.value ?? this.init),
      this,
      true,
    )!;

    this.state = STATE_CLEAN;

    return result;
  }

  update() {
    if (!this.isZombie()) {
      return this.prevValue.set(this.run());
    }
  }

  updateIfNecessary() {
    if (this.state === STATE_CHECK) {
      for (const observable of this.observables) {
        observable.parent?.updateIfNecessary();
        if ((this.state as number) === STATE_DIRTY) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    if (this.state === STATE_DIRTY) {
      this.update();
    }

    this.state = STATE_CLEAN;
  }

  stale(change: CacheState) {
    if (this.state >= change) {
      return;
    }

    if (this.state === STATE_CLEAN) {
      EFFECT_QUEUE.push(this as Computation<unknown, unknown>);

      if (!SCHEDULED_EFFECTS) {
        flushEffects();
      }
    }

    this.state = change;

    this.prevValue?.stale(STATE_CHECK);
  }

  isZombie() {
    let owner: Scope | null = this.parentScope;

    while (owner !== null) {
      if (owner instanceof Computation && owner.state === STATE_DIRTY) {
        return true;
      }

      owner = owner.parentScope;
    }

    return false;
  }
}
