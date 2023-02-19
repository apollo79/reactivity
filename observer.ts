import { Computation } from "./computation";
import { Observable } from "./observable";

export type ObserverFunction<Prev, Next extends Prev = Prev> = (
  prevValue: Prev
) => Next;

export class Observer {
  public observables: Set<Observable>;

  cleanup = () => {
    this.observables.forEach((observable) => {
      observable.observers.delete(this as unknown as Computation);
    });

    this.observables.clear();
  };
}
