import { CONTEXT } from "~/context.ts";

export type CleanupFunction = () => void;

export function onDispose(fn: CleanupFunction) {
  if (!CONTEXT.CURRENTSCOPE) {
    return () => {};
  }

  const owner = CONTEXT.CURRENTSCOPE;

  owner?.disposal.push(fn);

  return () => {
    // if (owner?.state === STATE_DISPOSED) {
    //   return;
    // }

    fn();

    owner.disposal.splice(owner.disposal.indexOf(fn), 1);
  };
}
