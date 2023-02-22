import { runWithOwner } from "~/utils/runWithOwner.ts";
import { Owner } from "~/objects/owner.ts";

export type RootFunction<T> = (dispose: () => void) => T;

export class Root<T = unknown> extends Owner {
  fn: RootFunction<T>;
  constructor(fn: RootFunction<T>) {
    super();
    this.fn = fn;
  }

  wrap(): T {
    return runWithOwner(() => this.fn(this.dispose), this, false)!;
  }
}
