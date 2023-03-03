import { CONTEXT } from "~/context.ts";

export type CleanupFunction = () => void;

export function onDispose(fn: CleanupFunction) {
  if (!CONTEXT.CURRENTSCOPE) {
    return () => {};
  }

  const owner = CONTEXT.CURRENTSCOPE;

  owner?.cleanups.push(fn);

  return () => {
    // if (owner?.state === STATE_DISPOSED) {
    //   return;
    // }

    fn();

    owner.cleanups.splice(owner.cleanups.indexOf(fn), 1);
  };
}
