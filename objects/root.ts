import { wrapRoot } from "../utils/wrapRoot";
import { Owner } from "./owner";

export type RootFunction<T> = (dispose: () => void) => T;

export class Root<T = unknown> extends Owner {
  fn: RootFunction<T>;
  constructor(fn: RootFunction<T>) {
    super();
    this.fn = fn;
  }

  wrap(): T {
    return wrapRoot(this.fn, this);
  }
}
