import { CONTEXT } from "~/context.ts";

export type CleanupFunction = () => void;

export function onCleanup(fn: CleanupFunction) {
  if (!CONTEXT.CURRENTSCOPE) {
    return () => {};
  }

  const owner = CONTEXT.CURRENTSCOPE;

  owner?.cleanups.push(fn);

  return () => {
    // if (owner?.state === STATE_DISPOSED) {
    //   return;
    // }

    // fn.call(null)
    fn();

    owner.cleanups.splice(owner.cleanups.indexOf(fn), 1);
  };
}
