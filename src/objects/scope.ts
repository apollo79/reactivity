import {
  type CacheState,
  CONTEXT,
  STATE_CLEAN,
  STATE_DISPOSED,
} from "~/context.ts";
import type { CleanupFunction } from "~/methods/onDispose.ts";

/**
 * A scope is the abstraction over roots and computations. It provides contexts and can own other scopes
 */
export abstract class Scope {
  /**
   * The scope gets registered under its parent scope for.
   * This is needed for the parent's disposal and contexts as well as errors as they bubble up
   */
  readonly parentScope: Scope | null = CONTEXT.CURRENTSCOPE;
  /**
   * Scopes that are created under this scope.
   * This isneeded so when this scope is disposed, it can tell its children scopes to dispose themselves too
   */
  readonly childrenScopes = new Set<Scope>();
  /** Custom cleanup functions */
  readonly disposal: CleanupFunction[] = [];
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

    this.disposal.length = 0;

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
