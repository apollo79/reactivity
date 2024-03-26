import { Owner } from "~/objects/owner.ts";
import {
  ERRORTHROWN_SYMBOL,
  STATE_CHECK,
  STATE_DIRTY,
  SUSPENSE_SYMBOL,
} from "~/context.ts";
import { Contexts } from "~/types.ts";
import { Effect } from "~/objects/effect.ts";

export class Suspense extends Owner {
  /**
   * A counter that keeps track of the number of suspensions
   * It is needed for nested suspense boundaries because parent suspenses suspend there children suspenses as well
   * So if a children suspense gets unsuspended it should not necesarily run the effects as there could be a parent that still suspends
   * In that case, `suspended` will still be > 0
   */
  public suspended: number;

  contexts: Contexts = {
    ...this.parentScope?.contexts,
    [SUSPENSE_SYMBOL]: this,
  };

  constructor() {
    super();

    // get the state of a maybe existing parent suspense
    this.suspended = this.parentScope?.get(SUSPENSE_SYMBOL)?.suspended ?? 0;
  }

  toggle(suspended: boolean) {
    // suspended is already 0 meaning it is not suspended, we don't want it to be negative
    if (!this.suspended && !suspended) {
      return;
    }

    const prevSuspended = this.suspended;
    const nextSuspended = this.suspended + (suspended ? 1 : -1);

    this.suspended = nextSuspended;

    // if the overall state hasn't changed, we don't need to do anything
    // this can happen if the parent suspense boundary is still suspending
    if (Boolean(prevSuspended) === Boolean(nextSuspended)) {
      return;
    }

    notifyChildrenScopes(this, suspended);
  }

  runWith<T>(fn: () => T): T {
    const result = Owner.runWithOwner(fn, this, undefined);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }
}

function notifyChildrenScopes(scope: Owner, suspended: boolean) {
  for (const childrenScope of scope.childrenScopes) {
    // notify children suspenses
    if (childrenScope instanceof Suspense) {
      childrenScope.toggle(suspended);
    }

    if (childrenScope instanceof Effect) {
      // if the effect should have run if there was no suspense boundary, we now update / schedule it
      if (
        childrenScope.state === STATE_CHECK ||
        childrenScope.state === STATE_DIRTY
      ) {
        // If `init` is true it means that this effect should be sync on first run
        if (childrenScope.init) {
          // childrenScope.init = false;

          childrenScope.update();
        } else {
          childrenScope.schedule();
        }
      }
    }

    notifyChildrenScopes(childrenScope, suspended);
  }
}
