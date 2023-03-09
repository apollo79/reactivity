import {
  Computation,
  notify,
  updateIfNecessary,
} from "~/objects/computation.ts";
import {
  type CacheState,
  CONTEXT,
  STATE_CLEAN,
  STATE_DIRTY,
} from "~/context.ts";
// import { Memo } from "./memo.ts";
import { Scope } from "./scope.ts";

export type Accessor<T> = () => T;
export type Setter<T> = (nextValue: T | UpdateFunction<T>) => T;

type EqualsFunction<T> = (prev: T, next: T) => boolean;
type UpdateFunction<T> = (current: T) => T;

export type ObservableOptions<T> = {
  equals?: false | EqualsFunction<T>;
};

export type Observable<T> = {
  parent?: Computation<T, unknown>;
  observers: Set<Scope>;
  value: T;
  // the function to compare nextValue to the current value
  equals: EqualsFunction<T>;
  state: CacheState;
};

export function ObservableNode<T = unknown>(
  this: Observable<T>,
  value?: T,
  options?: ObservableOptions<T>,
) {
  this.value = value!;
  this.equals = options?.equals === false
    ? () => false
    : options?.equals || Object.is;
  this.observers = new Set();
  this.state = STATE_CLEAN;
}

export function read<T>(this: Observable<T>): T {
  const running = CONTEXT.CURRENTSCOPE;

  if (CONTEXT.TRACKING && running !== null) {
    this.observers.add(running);
    running.observables.add(this as Observable<unknown>);
  }

  if (this.parent) {
    updateIfNecessary(this.parent);
  }

  return this.value;
}

export function write<T>(this: Observable<T>, value: T | UpdateFunction<T>): T {
  const nextValue = value instanceof Function ? value(this.value) : value;

  if (!this.equals(this.value, nextValue)) {
    this.value = nextValue;

    this.state = STATE_DIRTY;

    this.observers.forEach((observer) => {
      notify(observer, STATE_DIRTY);
    });
  }

  return this.value;
}

export function peek<T>(this: Observable<T>): T {
  if (this.parent) {
    updateIfNecessary(this.parent);
  }

  return this.value;
}

// export class Observable<T = unknown> {
//   parent?: Memo<T, unknown>;
//   observers = new Set<Computation<unknown, unknown>>();
//   value: T;
//   // the function to compare nextValue to the current value
//   equals: EqualsFunction<T>;
//   state: CacheState = STATE_CLEAN;

//   constructor(value?: T, options?: ObservableOptions<T>) {
//     this.value = value!;
//     this.equals = options?.equals === false
//       ? () => false
//       : options?.equals || Object.is;
//   }

//   /**
//    * stores dependencies between observables and computations in a double-linked list
//    */
//   #subscribe() {
//     const running = CONTEXT.CURRENTSCOPE;

//     if (CONTEXT.TRACKING && running instanceof Computation) {
//       this.observers.add(running);
//       running.observables.add(this as Observable<unknown>);
//     }
//   }

//   get(): T {
//     this.#subscribe();

//     this.parent?.updateIfNecessary();

//     return this.value;
//   }

//   set(value: T | UpdateFunction<T>): T {
//     const nextValue = value instanceof Function ? value(this.value) : value;

//     if (!this.equals(this.value, nextValue)) {
//       this.value = nextValue;

//       this.stale(STATE_DIRTY);
//     }

//     return this.value;
//   }

//   stale(change: CacheState): void {
//     this.state = change;

//     this.observers.forEach((observer) => {
//       observer.stale(change);
//     });
//   }

//   peek(): T {
//     this.parent?.updateIfNecessary();

//     return this.value;
//   }
// }
