import { CONTEXT, ERRORHANDLERS_SYMBOL } from "../context";

export type ErrorFunction = (error: Error) => void;

export function onError(handler: ErrorFunction) {
  if (CONTEXT.OWNER === null) return;

  if (!(ERRORHANDLERS_SYMBOL in CONTEXT.OWNER)) {
    CONTEXT.OWNER.contexts[ERRORHANDLERS_SYMBOL] = [handler];
  } else {
    CONTEXT.OWNER.contexts[ERRORHANDLERS_SYMBOL].push(handler);
  }
}
