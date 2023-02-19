import { Observer } from "./observer";

type Context = {
  OBSERVER: Observer | undefined;
  TRACKING: boolean;
};

export const CONTEXT: Context = {
  OBSERVER: undefined,
  TRACKING: false,
};
