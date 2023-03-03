import { runWithScope } from "~/utils/runWithScope.ts";
import { Scope } from "~/objects/scope.ts";

export type RootFunction<T> = (dispose: () => void) => T;

export class Root<T = unknown> extends Scope {
  fn: RootFunction<T>;
  constructor(fn: RootFunction<T>) {
    super();
    this.fn = fn;
    this.parentScope?.childrenObservers.add(this);
  }

  wrap(): T {
    return runWithScope(() => this.fn(this.dispose.bind(this)), this, false)!;
  }
}
