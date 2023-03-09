import { runWithScope } from "~/utils/runWithScope.ts";
import { createScope, dispose, Scope } from "~/objects/scope.ts";

export type RootFunction<T> = (dispose: () => void) => T;

export type Root<T = unknown> = Scope & {
  fn: RootFunction<T>;
  isComputation: false;
};

export function createRoot<T = unknown>(this: Scope, fn: RootFunction<T>) {
  const scope = createScope();

  return runWithScope(() => fn(dispose.bind(scope)), this, false)!;
}

// export class Root<T = unknown> extends Scope {
//   fn: RootFunction<T>;
//   constructor(fn: RootFunction<T>) {
//     super();
//     this.fn = fn;
//     this.parentScope?.childrenObservers.add(this);
//   }

//   wrap(): T {
//     return runWithScope(() => this.fn(this.dispose.bind(this)), this, false)!;
//   }
// }
