// import type {
//   CacheState,
//   Computation,
//   ComputationFunction,
//   ComputationOptions,
//   ErrorFunction,
//   Scope,
// } from "./types.ts";

// function runEffects() {
//   if (EFFECT_QUEUE.length !== 0) {
//     // RUNNING_EFFECTS = true;

//     EFFECT_QUEUE.forEach((effect) => {
//       isZombie(effect);
//       if (!isZombie(effect)) {
//         updateIfNecessary(effect);
//       }
//     });

//     EFFECT_QUEUE = [];
//     // RUNNING_EFFECTS = false;
//   }

//   SCHEDULED_EFFECTS = false;
// }

// function flushEffects() {
//   SCHEDULED_EFFECTS = true;
//   queueMicrotask(runEffects);
// }

// export function tick() {
//   runEffects();
// }

// let SCHEDULED_EFFECTS = false;
// // let RUNNING_EFFECTS = false;

// let EFFECT_QUEUE: Computation<unknown, unknown>[] = [];

// let CURRENTSCOPE: Scope | null = null;
// let TRACKING: boolean;

// export const STATE_CLEAN = 1;
// export const STATE_CHECK = 2;
// export const STATE_DIRTY = 3;
// export const STATE_DISPOSED = 4;

// export const ERRORHANDLERS_SYMBOL = Symbol("Error");

// export function createComputation<Init, Next extends Init = Init>(
//   fn: ComputationFunction<Next, Next | Init> | null,
//   init: Init,
//   state: CacheState,
//   options?: ComputationOptions<Init>,
// ): Computation<Init, Next> {
//   const computation: Computation<Init, Next> = {
//     parentScope: CURRENTSCOPE,
//     childrenScopes: new Set(),
//     cleanups: [],
//     contexts: {},
//     fn,
//     isMemo: options?.isMemo ?? false,
//     sources: [],
//     state,
//     value: init,
//     equals: options?.equals ?? Object.is,
//   };

//   if (fn && !options?.isMemo) {
//     runComputation(computation);
//   }

//   return computation;
// }

// export function lookup<T>(scope: Scope, id: string | symbol): T | undefined {
//   if (id in scope.contexts) {
//     return scope.contexts[id] as T;
//   } else {
//     if (scope.parentScope) {
//       return lookup(scope.parentScope, id) as T;
//     }
//   }
// }

// export function castError(error: unknown) {
//   if (error instanceof Error) {
//     return error;
//   } else if (typeof error === "string") {
//     return new Error(error);
//   } else {
//     return new Error("Unknown error");
//   }
// }

// export function runWithScope<T>(
//   fn: () => T,
//   scope: Scope | null,
//   tracking = true,
// ): T | undefined {
//   const PREV_OBSERVER = CURRENTSCOPE;
//   const PREV_TRACKING = TRACKING;

//   CURRENTSCOPE = scope;
//   TRACKING = tracking;

//   try {
//     return fn();
//   } catch (e) {
//     const error = castError(e);

//     if (scope !== null) {
//       const errorHandlers = lookup(
//         scope,
//         ERRORHANDLERS_SYMBOL,
//       ) as ErrorFunction[];

//       if (errorHandlers !== undefined) {
//         errorHandlers.forEach((errorHandler) => {
//           errorHandler(error);
//         });
//       } else {
//         throw error;
//       }
//     }
//   } finally {
//     CURRENTSCOPE = PREV_OBSERVER;
//     TRACKING = PREV_TRACKING;
//   }
// }

// export function runComputation<Init, Next extends Init = Init>(
//   node: Computation<Init, Next>,
// ): Next {
//   dispose(node);

//   node.parentScope?.childrenScopes.add(node);

//   node.value = runWithScope(() => node.fn!(node.value), node, true)!;

//   node.state = STATE_CLEAN;

//   if (node.isMemo) {
//     if (node.observers) {
//       for (const observer of node.observers) {
//         notify(observer, STATE_DIRTY);
//       }
//     }
//   }

//   return node.value as Next;
// }

// export function dispose(node: Scope) {
//   if (node.state === STATE_DISPOSED) {
//     return;
//   }

//   node.state = STATE_DISPOSED;

//   node.sources.forEach((source) => {
//     (source.observers as Set<Computation<any, any>>).delete(
//       node as Computation<unknown, unknown>,
//     );
//   });

//   node.sources = [];

//   node.childrenScopes.forEach((scope) => {
//     dispose(scope);
//   });

//   node.childrenScopes.clear();

//   node.cleanups?.forEach((cleanup) => {
//     cleanup();
//   });

//   node.cleanups = [];

//   node.contexts = {};

//   node.parentScope?.childrenScopes.delete(node);
// }

// export function updateIfNecessary(computation: Computation<any, any>) {
//   if (computation.state === STATE_CHECK) {
//     for (const source of computation.sources) {
//       updateIfNecessary(source);

//       if ((computation.state as number) === STATE_DIRTY) {
//         // Stop the loop here so we won't trigger updates on other parents unnecessarily
//         // If our computation changes to no longer use some sources, we don't
//         // want to update() a source we used last time, but now don't use.
//         break;
//       }
//     }
//   }

//   if (computation.state === STATE_DIRTY && !isZombie(computation)) {
//     runComputation(computation);
//   }

//   computation.state = STATE_CLEAN;
// }

// export function isZombie(scope: Computation<any, any>) {
//   let owner = scope.parentScope;

//   while (owner !== null) {
//     if (owner.state === STATE_DIRTY) {
//       return true;
//     }

//     owner = owner.parentScope;
//   }

//   return false;
// }

// export function notify(node: Computation<any, any>, newState: CacheState) {
//   if (node.state >= newState) return;

//   if (!node.isMemo && node.state === STATE_CLEAN) {
//     EFFECT_QUEUE.push(node);

//     if (!SCHEDULED_EFFECTS) {
//       flushEffects();
//     }
//   }

//   node.state = newState;

//   if (node.observers) {
//     for (const observer of node.observers) {
//       notify(observer, STATE_CHECK);
//     }
//   }
// }

// export function read<Init, Next extends Init = Init>(
//   this: Computation<Init, Next>,
// ) {
//   const running = CURRENTSCOPE as Computation<any, any> | null;

//   if (TRACKING && running !== null) {
//     if (this.observers) {
//       this.observers.add(running);
//     } else {
//       this.observers = new Set([running]);
//     }

//     running.sources.push(this);
//   }

//   if (this.fn) {
//     updateIfNecessary(this);
//   }

//   return this.value;
// }

// export function write<Init, Next extends Init = Init>(
//   this: Computation<Init, Next>,
//   newValue: Next,
// ) {
//   const nextValue = newValue instanceof Function
//     ? newValue(this.value)
//     : newValue;

//   if (!this.equals(this.value, nextValue)) {
//     this.value = nextValue;

//     this.state = STATE_DIRTY;

//     if (this.observers) {
//       this.observers.forEach((observer) => {
//         notify(observer, STATE_DIRTY);
//       });
//     }
//   }

//   return this.value;
// }

import type {
  CacheState,
  CacheStateNotify,
  CleanupFunction,
  Computation,
  ComputationFunction,
  ComputationOptions,
  ErrorFunction,
  Scope,
} from "./types.ts";

function runEffects() {
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

function flushEffects() {
  SCHEDULED_EFFECTS = true;
  queueMicrotask(runEffects);
}

export function tick() {
  if (!RUNNING_EFFECTS) {
    runEffects();
  }
}

let SCHEDULED_EFFECTS = false;
let RUNNING_EFFECTS = false;

let EFFECT_QUEUE: Reactive<any, any>[] = [];

let CURRENTSCOPE: Scope | null = null;
let TRACKING: boolean;
let CURRENTSOURCES: Reactive<any, any>[] | null = null;
let CURRENTSOURCESINDEX = 0;

export const STATE_CLEAN = 1;
export const STATE_CHECK = 2;
export const STATE_DIRTY = 3;
export const STATE_DISPOSED = 4;

export const ERRORHANDLERS_SYMBOL = Symbol("Error");

export class Reactive<Init, Next extends Init = Init>
  implements Computation<Init, Next> {
  parentScope = CURRENTSCOPE;
  childrenScopes = new Set<Scope>();
  observers?: Reactive<any, any>[];
  cleanups: CleanupFunction[] = [];
  contexts: Record<string | symbol, unknown> = {};
  sources?: Reactive<any, any>[];
  isMemo = false;
  value: Init;
  equals = Object.is;
  state: CacheState;

  constructor(
    public fn: ComputationFunction<Next, Next | Init> | null,
    init: Init,
    options?: ComputationOptions<Init>,
  ) {
    this.value = init;
    if (options?.equals) {
      this.equals = options.equals;
    }

    if (fn) {
      this.state = STATE_DIRTY;

      if (options?.isMemo) {
        this.isMemo = true;
      } else {
        this.update();
      }
    } else {
      this.state = STATE_CLEAN;
    }
  }

  dispose() {
    if (this.state === STATE_DISPOSED) {
      return;
    }

    this.state = STATE_DISPOSED;

    // this.childrenScopes.forEach((scope) => {
    //   scope.dispose();
    // });

    // this.childrenScopes.clear();

    if (this.cleanups.length) {
      for (let i = 0; i < this.cleanups.length; i++) {
        this.cleanups[i]();
      }

      this.cleanups = [];
    }

    this.contexts = {};

    this.parentScope?.childrenScopes.delete(this);
  }

  removeParentObservers(index: number): void {
    if (!this.sources) {
      return;
    }

    for (let i = index; i < this.sources.length; i++) {
      const source: Reactive<any> = this.sources[i]; // We don't actually delete sources here because we're replacing the entire array soon

      const swap = source.observers!.findIndex((v) => v === this);

      source.observers![swap] = source.observers![source.observers!.length - 1];

      source.observers!.pop();
    }
  }

  update(): Next {
    if (this.fn) {
      this.dispose();

      const PREV_OBSERVER = CURRENTSCOPE;
      const PREV_TRACKING = TRACKING;

      CURRENTSCOPE = this;
      TRACKING = true;

      const prevSources = CURRENTSOURCES,
        prevSourcesIndex = CURRENTSOURCESINDEX;

      CURRENTSOURCES = null as Reactive<any, any>[] | null;
      CURRENTSOURCESINDEX = 0;

      try {
        this.value = this.fn(this.value);

        if (CURRENTSOURCES) {
          // remove all old sources' .observers links to us
          this.removeParentObservers(CURRENTSOURCESINDEX);

          // update source up links
          if (this.sources && CURRENTSOURCESINDEX > 0) {
            this.sources.length = CURRENTSOURCESINDEX + CURRENTSOURCES.length;

            for (let i = 0; i < CURRENTSOURCES.length; i++) {
              this.sources[CURRENTSOURCESINDEX + i] = CURRENTSOURCES[i];
            }
          } else {
            this.sources = CURRENTSOURCES;
          }

          let source: Reactive<any, any>;
          for (let i = CURRENTSOURCESINDEX; i < this.sources.length; i++) {
            // Add ourselves to the end of the parent .observers array
            source = this.sources[i];

            if (!source.observers) {
              source.observers = [this];
            } else {
              source.observers.push(this);
            }
          }
        } else if (this.sources && CURRENTSOURCESINDEX < this.sources.length) {
          // remove all old sources' .observers links to us
          this.removeParentObservers(CURRENTSOURCESINDEX);

          this.sources.length = CURRENTSOURCESINDEX;
        }
      } catch (e) {
        handleError(e);
      } finally {
        CURRENTSCOPE = PREV_OBSERVER;
        TRACKING = PREV_TRACKING;

        CURRENTSOURCES = prevSources;
        CURRENTSOURCESINDEX = prevSourcesIndex;
      }
    }

    if (this.observers) {
      for (const observer of this.observers) {
        observer.state = STATE_DIRTY;
      }
    }

    this.state = STATE_CLEAN;

    return this.value as Next;
  }

  updateIfNecessary() {
    if (this.state === STATE_CHECK && this.sources) {
      for (let i = 0; i < this.sources.length; i++) {
        this.sources[i].updateIfNecessary();

        if ((this.state as CacheState) === STATE_DIRTY) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    if (this.state === STATE_DIRTY) {
      this.update();
    } else {
      this.state = STATE_CLEAN;
    }
  }

  isZombie(): boolean {
    let scope = this.parentScope;

    while (scope !== null) {
      if (scope.state === STATE_DIRTY) {
        return true;
      }

      scope = scope.parentScope;
    }

    return false;
  }

  read(): Init | Next {
    const running = CURRENTSCOPE as Reactive<any, any> | null;

    if (TRACKING && running) {
      if (
        CURRENTSOURCES &&
        running.sources &&
        running.sources[CURRENTSOURCESINDEX] == this
      ) {
        CURRENTSOURCESINDEX++;
      } else if (!CURRENTSOURCES) {
        CURRENTSOURCES = [this];
      } else {
        CURRENTSOURCES.push(this);
      }
    }

    // CONSIDER removing the check - implications on large graphs?
    if (this.fn) {
      this.updateIfNecessary();
    }

    return this.value;
  }

  write(newValue: Next): Next {
    const nextValue = newValue instanceof Function
      ? newValue(this.value)
      : newValue;

    if (!this.equals(this.value, nextValue)) {
      this.value = nextValue;

      this.stale(STATE_DIRTY);
    }

    return this.value as Next;
  }

  lookup<T>(id: string | symbol): T | undefined {
    let scope: Scope | null = this;

    while (scope !== null) {
      if (id in scope.contexts) {
        return scope.contexts[id] as T;
      } else {
        scope = scope.parentScope;
      }
    }

    return undefined;
  }

  stale(newState: CacheStateNotify) {
    if (this.state < newState) {
      if (!this.isMemo && this.state === STATE_CLEAN) {
        EFFECT_QUEUE.push(this);

        if (!SCHEDULED_EFFECTS) {
          flushEffects();
        }
      }

      this.state = newState;

      if (this.observers) {
        for (const observer of this.observers) {
          observer.stale(STATE_CHECK);
        }
      }
    }
  }
}

export function castError(error: unknown) {
  if (error instanceof Error) {
    return error;
  } else if (typeof error === "string") {
    return new Error(error);
  } else {
    return new Error("Unknown error");
  }
}

export function handleError(e: unknown) {
  if (CURRENTSCOPE) {
    const error = castError(e);

    const errorHandlers = CURRENTSCOPE.lookup<ErrorFunction[]>(
      ERRORHANDLERS_SYMBOL,
    );

    if (errorHandlers !== undefined) {
      errorHandlers.forEach((errorHandler) => {
        errorHandler(error);
      });
    } else {
      throw error;
    }
  }
}

export function runWithScope<T>(
  fn: () => T,
  scope: Scope | null,
  tracking = true,
): T | undefined {
  const PREV_OBSERVER = CURRENTSCOPE;
  const PREV_TRACKING = TRACKING;

  CURRENTSCOPE = scope;
  TRACKING = tracking;

  try {
    return fn();
  } catch (e) {
    handleError(e);
  } finally {
    CURRENTSCOPE = PREV_OBSERVER;
    TRACKING = PREV_TRACKING;
  }
}
