import { CONTEXT } from "../context";
import { Computation } from "./computation";
import { Observable } from "./observable";

export class Observer {
  parent: Observer | undefined = CONTEXT.OBSERVER;
  observables = new Set<Observable>();
  observers = new Set<Observer>();

  dispose = () => {
    this.observables.forEach((observable) => {
      observable.observers.delete(this as unknown as Computation<any, any>);
    });

    this.observables.clear();

    this.observers.forEach((observer) => {
      observer.dispose();
    });

    this.observers.clear();

    this.parent?.observers.delete(this);
  };
}
