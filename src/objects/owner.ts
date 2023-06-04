import {
  type CacheState,
  CURRENTOBSERVER,
  CURRENTOWNER,
  ERRORTHROWN_SYMBOL,
  setObserver,
  setOwner,
  STATE_CLEAN,
  STATE_DISPOSED,
} from "~/context.ts";
import type { CleanupFunction } from "~/methods/onDispose.ts";
import { handleError } from "~/utils/handleError.ts";

/**
 * A scope is the abstraction over roots and computations. It provides contexts and can own other scopes
 */
export class Owner {
  static getOwner(): Owner | undefined {
    return CURRENTOWNER;
  }

  static runWithOwner<T>(
    fn: () => T,
    owner: typeof CURRENTOWNER,
    observer: typeof CURRENTOBSERVER,
  ): T | typeof ERRORTHROWN_SYMBOL {
    const PREV_OWNER = CURRENTOWNER;
    const PREV_OBSERVER = CURRENTOBSERVER;

    setOwner(owner);
    setObserver(observer);

    try {
      return fn();
    } catch (error: unknown) {
      handleError(error);

      return ERRORTHROWN_SYMBOL;
    } finally {
      setOwner(PREV_OWNER);
      setObserver(PREV_OBSERVER);
    }
  }

  /**
   * The scope gets registered under its parent scope for.
   * This is needed for the parent's disposal and contexts as well as errors as they bubble up
   */
  readonly parentScope: Owner | undefined = CURRENTOWNER;
  /**
   * Scopes that are created under this scope.
   * This isneeded so when this scope is disposed, it can tell its children scopes to dispose themselves too
   */
  readonly childrenScopes = new Set<Owner>();
  /** Custom cleanup functions */
  disposal: CleanupFunction[] = [];
  /**
   * stores contexts values and error handlers
   * @see onError.ts
   */
  contexts: Record<string | symbol, unknown> = {};
  /**
   * The current state of the scope.
   */
  state: CacheState = STATE_CLEAN;

  /**
   * Cleans up the scope (removes cleanups and contexts and disposes every child scope, which stops tracking)
   * This method gets executed before every reexecution of a computation to provide dynamic dependencies
   */
  dispose(): void {
    if (this.state === STATE_DISPOSED) {
      return;
    }

    this.state = STATE_DISPOSED;

    this.childrenScopes.forEach((scope) => {
      scope.dispose();
    });

    this.childrenScopes.clear();

    this.disposal?.forEach((cleanup) => {
      cleanup();
    });

    this.disposal = [];

    this.contexts = {};
  }

  /**
   * Searches for the context registered under the given id. If it is not found it searches recursively up the scope-tree
   * @param id The ID under which the context is registered
   * @returns The context if found, else undefined
   */
  get<T>(id: string | symbol): T | undefined {
    if (id in this.contexts) {
      return this.contexts[id] as T;
    } else {
      return this.parentScope?.get(id);
    }
  }

  /**
   * Sets a context on this scope
   * @param id The ID to register the context under
   * @param value The value of the context
   */
  set(id: string | symbol, value: unknown): void {
    this.contexts[id] = value;
  }
}
