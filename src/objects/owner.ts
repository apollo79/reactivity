import { CONTEXT } from "~/context.ts";
import type { CleanupFunction } from "~/methods/onCleanup.ts";
import type { Computation } from "~/objects/computation.ts";
import type { Observable } from "~/objects/observable.ts";

export class Owner {
  owner: Owner | null = CONTEXT.OWNER;
  observables = new Set<Observable>();
  observers = new Set<Owner>();
  cleanups: CleanupFunction[] = [];
  contexts: Record<symbol, unknown> = {};

  dispose = (): void => {
    this.observables.forEach((observable) => {
      observable.observers.delete(
        this as unknown as Computation<unknown, unknown>,
      );
    });

    this.observables.clear();

    this.observers.forEach((observer) => {
      observer.dispose();
    });

    this.observers.clear();

    this.cleanups?.forEach((cleanup) => {
      cleanup();
    });

    this.cleanups = [];

    this.contexts = {};

    this.owner?.observers.delete(this);
  };

  get = <T>(id: symbol): T | undefined => {
    if (id in this.contexts) {
      return this.contexts[id] as T;
    } else {
      return this.owner?.get(id);
    }
  };

  set = (id: symbol, value: unknown): void => {
    this.contexts[id] = value;
  };
}
