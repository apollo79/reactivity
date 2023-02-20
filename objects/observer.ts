import { CONTEXT } from "../context";
import { CleanupFunction } from "../methods/onCleanup";
import { Computation } from "./computation";
import { Observable } from "./observable";

export class Observer {
  parent: Observer | undefined = CONTEXT.OBSERVER;
  observables = new Set<Observable>();
  observers = new Set<Observer>();
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
