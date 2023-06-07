import { CURRENTOWNER } from "~/context.ts";
import type { CleanupFunction } from "~/types.ts";

export function onDispose(fn: CleanupFunction) {
  if (!CURRENTOWNER) {
    return () => {};
  }

  const owner = CURRENTOWNER;

  owner?.disposal.push(fn);

  return () => {
    // if (owner?.state === STATE_DISPOSED) {
    //   return;
    // }

    fn();

    owner.disposal.splice(owner.disposal.indexOf(fn), 1);
  };
}
