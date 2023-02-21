import { CONTEXT } from "../context";
import { CleanupFunction } from "../methods/onCleanup";
import { Computation } from "./computation";
import { Observable } from "./observable";

export class Owner {
  owner: Owner | null = CONTEXT.OWNER;
  observables = new Set<Observable>();
  observers = new Set<Owner>();
  cleanups: CleanupFunction[] = [];
  contexts: Record<symbol, any> = {};

  dispose = (): void => {
    this.observables.forEach((observable) => {
      observable.observers.delete(this as unknown as Computation<any, any>);
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
      return this.contexts[id];
    } else {
      return this.owner?.get(id);
    }
  };

  set = (id: symbol, value: any): void => {
    this.contexts[id] = value;
  };
}
