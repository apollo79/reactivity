import { CONTEXT, ERRORHANDLERS_SYMBOL } from "~/context.ts";

export type ErrorFunction = (error: Error) => void;

export function onError(handler: ErrorFunction) {
  if (CONTEXT.CURRENTSCOPE === null) return;

  if (!(ERRORHANDLERS_SYMBOL in CONTEXT.CURRENTSCOPE.contexts)) {
    CONTEXT.CURRENTSCOPE.contexts[ERRORHANDLERS_SYMBOL] = [handler];
  } else {
    (
      CONTEXT.CURRENTSCOPE.contexts[ERRORHANDLERS_SYMBOL] as ErrorFunction[]
    ).push(handler);
  }
}
