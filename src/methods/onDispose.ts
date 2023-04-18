import { CONTEXT } from "~/context.ts";

export type CleanupFunction = () => void;

export function onDispose(fn: CleanupFunction) {
  if (!CONTEXT.CURRENTOWNER) {
    return () => {};
  }

  const owner = CONTEXT.CURRENTOWNER;

  owner?.disposal.push(fn);

  return () => {
    // if (owner?.state === STATE_DISPOSED) {
    //   return;
    // }

    fn();

    owner.disposal.splice(owner.disposal.indexOf(fn), 1);
  };
}
