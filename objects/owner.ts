import { CONTEXT } from "../context";
import { CleanupFunction } from "../methods/onCleanup";
import { Computation } from "./computation";
import { Observable } from "./observable";

export class Owner {
  parent: Owner | undefined = CONTEXT.OWNER;
  observables = new Set<Observable>();
  observers = new Set<Owner>();
  cleanups: CleanupFunction[] | null = null;

  dispose = () => {
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

    this.cleanups = null;

    this.parent?.observers.delete(this);
  };
}
