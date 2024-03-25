import { Owner } from "~/objects/owner.ts";
import { Contexts } from "~/types.ts";

export class Context extends Owner {
  contexts: Contexts;

  constructor(contexts: Contexts) {
    super();

    this.contexts = { ...this.parentScope?.contexts, ...contexts };
  }
}
