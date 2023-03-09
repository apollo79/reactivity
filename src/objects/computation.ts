import {
  CacheState,
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
} from "~/context.ts";
import { runWithScope } from "~/utils/runWithScope.ts";
import { dispose, type Scope, ScopeNode } from "~/objects/scope.ts";
import { EFFECT_QUEUE, flushEffects, SCHEDULED_EFFECTS } from "../scheduler.ts";
import { ObservableNode, ObservableOptions } from "./observable.ts";

export type ComputationFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev,
) => Next;

export type GetSetValue<T> = {
  value: T | undefined;
  get: () => T | undefined;
  set: (value: T) => T;
};

export type Computation<Next, Init = unknown> = Scope & {
  fn: ComputationFunction<undefined | Init | Next, Next>;
  isComputation: true;
  isEffect: boolean;
  prevValue: GetSetValue<Next>;
};

function EffectValueHolder<T>(this: GetSetValue<T>, value?: T) {
  this.value = value;
  this.get = () => this.value;
  this.set = (value: T) => (this.value = value);
}

export type ComputationOptions<T> = ObservableOptions<T> & {
  isEffect: boolean;
};

export function ComputationNode<Next, Init = unknown>(
  this: Computation<Next, Init>,
  fn: ComputationFunction<undefined | Init | Next, Next>,
  init?: Init,
  options?: ComputationOptions<Next>,
) {
  ScopeNode.call(this);

  this.fn = fn;
  this.isComputation = true;
  this.isEffect = options?.isEffect ?? true;

  if (this.isEffect) {
    // @ts-ignore
    this.prevValue = new EffectValueHolder<Next>(init as Next);
  } else {
    // @ts-ignore
    this.prevValue = new ObservableNode<Next>(init as Next);
  }

  if (this.isEffect) {
    runComputation(this);
  }
}

Object.setPrototypeOf(ComputationNode.prototype, ScopeNode.prototype);

export function runComputation<Next, Init = unknown>(
  node: Computation<Next, Init>,
): Next {
  dispose.call(node);

  node.parentScope?.childrenObservers.add(node);

  const result = runWithScope(() => node.fn(node.prevValue.value), node, true)!;

  node.state = STATE_CLEAN;

  if (node.isEffect) {
    node.prevValue.set(result);
  }

  return result;
}

export function updateIfNecessary<Next, Init = unknown>(
  computation: Computation<Next, Init>,
) {
  if (computation.state === STATE_CHECK) {
    for (const observable of computation.observables) {
      if (observable.parent) {
        updateIfNecessary(observable.parent);
      }

      if ((computation.state as number) === STATE_DIRTY) {
        // Stop the loop here so we won't trigger updates on other parents unnecessarily
        // If our computation changes to no longer use some sources, we don't
        // want to update() a source we used last time, but now don't use.
        break;
      }
    }
  }

  if (computation.state === STATE_DIRTY && !isZombie(computation)) {
    runComputation(computation);
  }

  computation.state = STATE_CLEAN;
}

export function isZombie<Next, Init = unknown>(scope: Computation<Next, Init>) {
  let owner = scope.parentScope;

  while (owner !== null) {
    if (owner.state === STATE_DIRTY) {
      return true;
    }

    owner = owner.parentScope;
  }

  return false;
}

export function notify(node: Scope, newState: CacheState) {
  if (node.state >= newState) return;

  if ("isEffect" in node && node.state === STATE_CLEAN) {
    EFFECT_QUEUE.push(node as Computation<unknown>);

    if (!SCHEDULED_EFFECTS) {
      flushEffects();
    }
  }

  node.state = newState;

  for (const observer of node.childrenObservers) {
    if (node.isComputation) {
      notify(observer, STATE_CHECK);
    }
  }
}

// export abstract class Computation<Next, Init = unknown> extends Scope {
//   fn: ComputationFunction<undefined | Init | Next, Next>;

//   constructor(fn: ComputationFunction<undefined | Init | Next, Next>) {
//     super();
//     this.fn = fn;
//   }

//   abstract run(): Next;

//   runComputation(prevValue: Next | Init | undefined): Next {
//     this.dispose();

//     this.parentScope?.childrenObservers.add(this);

//     const result = runWithScope(() => this.fn(prevValue), this, true)!;

//     this.state = STATE_CLEAN;

//     return result;
//   }

//   updateIfNecessary() {
//     if (this.state === STATE_CHECK) {
//       for (const observable of this.observables) {
//         observable.parent?.updateIfNecessary();

//         if ((this.state as number) === STATE_DIRTY) {
//           // Stop the loop here so we won't trigger updates on other parents unnecessarily
//           // If our computation changes to no longer use some sources, we don't
//           // want to update() a source we used last time, but now don't use.
//           break;
//         }
//       }
//     }

//     if (this.state === STATE_DIRTY && !this.isZombie()) {
//       this.run();
//     }

//     this.state = STATE_CLEAN;
//   }

//   abstract stale(newState: CacheState): void;

//   isZombie() {
//     let owner: Scope | null = this.parentScope;

//     while (owner !== null) {
//       if (owner instanceof Computation && owner.state === STATE_DIRTY) {
//         return true;
//       }

//       owner = owner.parentScope;
//     }

//     return false;
//   }
// }
