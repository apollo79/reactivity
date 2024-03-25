import { CURRENTOWNER } from "~/context.ts";
import type { CleanupFunction } from "~/types.ts";
import { noop } from "~/utils/noop.ts";

export function onDispose(fn: CleanupFunction) {
  if (!CURRENTOWNER) {
    return noop;
  }

  const owner = CURRENTOWNER;

  owner.disposal.push(fn);

  return () => {
    // if we wouldn't dispose on first run we could add this
    // if (owner.state === STATE_DISPOSED) {
    //   return;
    // }

    fn();

    owner.disposal.splice(owner.disposal.indexOf(fn), 1);
  };
}
