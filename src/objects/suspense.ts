import { Owner } from "~/objects/owner.ts";
import {
  ERRORTHROWN_SYMBOL,
  STATE_CHECK,
  STATE_DIRTY,
  SUSPENSE_SYMBOL,
} from "~/context.ts";
import { Contexts } from "~/types.ts";
import { Effect } from "~/objects/effect.ts";

/**
 * Suspense provide a way to stop the execution of the effects under it.
 * When suspended, effects won't be executed, but they will get marked by their dependencies,
 * so when unsuspended, they will execute if they would normally have during the supension.
 * Suspenses also can be nested: When there is at least one suspense being suspended up the tree, effects won't be executed.
 */
export class Suspense extends Owner {
  /**
   * A counter that keeps track of the number of suspensions
   * It is needed for nested suspense boundaries because parent suspenses suspend there children suspenses as well
   * So if a children suspense gets unsuspended it should not necesarily run the effects as there could be a parent that still suspends
   * In that case, `suspended` will still be > 0
   */
  public suspended: number;

  override context: Contexts = {
    ...this.parentScope?.context,
    [SUSPENSE_SYMBOL]: this,
  };

  constructor() {
    super();

    this.parentScope?.childrenScopes.add(this);

    // get the state of a maybe existing parent suspense
    this.suspended = this.parentScope?.get(SUSPENSE_SYMBOL)?.suspended ?? 0;
  }

  override dispose() {
    super.dispose();

    this.parentScope?.childrenScopes.delete(this);
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

    // if the suspension has ended, we notify all the children scopes and queue effects that should run now
    notifyChildrenScopes(this, suspended);
  }

  runWith<T>(fn: () => T): T {
    const result = Owner.runWithOwner(fn, this, undefined);

    return result === ERRORTHROWN_SYMBOL ? undefined! : result;
  }
}

function notifyChildrenScopes(scope: Owner, suspended: boolean) {
  for (const childScope of scope.childrenScopes) {
    // notify children suspenses
    if (childScope instanceof Suspense) {
      childScope.toggle(suspended);
    }

    if (childScope instanceof Effect) {
      // if the effect should have run if there was no suspense boundary, we now update / schedule it
      if (
        childScope.state === STATE_CHECK ||
        childScope.state === STATE_DIRTY
      ) {
        // If `init` is true it means that this effect should be sync on first run
        if (childScope.init) {
          // TODO: Should this get set to false so that on future suspension and unsuspension it doesn't get executed immediately again?
          // childScope.init = false;

          childScope.update();
        } else {
          childScope.schedule();
        }
      }
    }

    notifyChildrenScopes(childScope, suspended);
  }

  for (const root of scope.roots) {
    notifyChildrenScopes(root, suspended);
  }
}
