import { CacheState, CONTEXT, STATE_DIRTY, STATE_DISPOSED } from "~/context.ts";
import type { CleanupFunction } from "~/methods/onDispose.ts";
import type { Computation } from "~/objects/computation.ts";
import type { Observable } from "~/objects/observable.ts";

export type Scope = {
  parentScope: Scope | null;
  observables: Set<Observable<unknown>>;
  childrenObservers: Set<Scope>;
  cleanups: CleanupFunction[];
  contexts: Record<string | symbol, unknown>;
  state: CacheState;
  isComputation: boolean;
};

export function ScopeNode(this: Scope) {
  this.parentScope = CONTEXT.CURRENTSCOPE;
  this.childrenObservers = new Set();
  this.cleanups = [];
  this.contexts = {};
  this.state = STATE_DIRTY;

  this.parentScope?.childrenObservers.add(this);
}

export function createScope(): Scope {
  // @ts-ignore
  return new ScopeNode() as Scope;
}

export function dispose(this: Scope) {
  if (this.state === STATE_DISPOSED) {
    return;
  }

  this.state = STATE_DISPOSED;

  this.observables.forEach((observable) => {
    observable.observers.delete(
      this as unknown as Computation<unknown, unknown>,
    );
  });

  this.observables.clear();

  this.childrenObservers.forEach((observer) => {
    dispose.call(observer);
  });

  this.childrenObservers.clear();

  this.cleanups?.forEach((cleanup) => {
    cleanup();
  });

  this.cleanups = [];

  this.contexts = {};

  this.parentScope?.childrenObservers.delete(this);
}

export function lookup<T>(scope: Scope, id: string | symbol): T | undefined {
  if (id in scope.contexts) {
    return scope.contexts[id] as T;
  } else {
    if (scope.parentScope) {
      return lookup(scope.parentScope, id) as T;
    }
  }
}

// export class Scope {
//   parentScope: Scope | null = CONTEXT.CURRENTSCOPE;
//   observables = new Set<Observable>();
//   childrenObservers = new Set<Scope>();
//   cleanups: CleanupFunction[] = [];
//   contexts: Record<string | symbol, unknown> = {};
//   state: CacheState = STATE_DIRTY;

//   constructor() {
//     this.parentScope?.childrenObservers.add(this);
//   }

//   dispose(): void {
//     if (this.state === STATE_DISPOSED) {
//       return;
//     }

//     this.state = STATE_DISPOSED;

//     this.observables.forEach((observable) => {
//       observable.observers.delete(
//         this as unknown as Computation<unknown, unknown>,
//       );
//     });

//     this.observables.clear();

//     this.childrenObservers.forEach((observer) => {
//       observer.dispose();
//     });

//     this.childrenObservers.clear();

//     this.cleanups?.forEach((cleanup) => {
//       cleanup();
//     });

//     this.cleanups = [];

//     this.contexts = {};

//     this.parentScope?.childrenObservers.delete(this);
//   }

//   get<T>(id: string | symbol): T | undefined {
//     if (id in this.contexts) {
//       return this.contexts[id] as T;
//     } else {
//       return this.parentScope?.get(id);
//     }
//   }

//   set(id: string | symbol, value: unknown): void {
//     this.contexts[id] = value;
//   }
// }