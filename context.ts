import { Observable } from "./objects/observable";
import { Observer } from "./objects/observer";

type Context = {
  OBSERVER: Observer | undefined;
  TRACKING: boolean;
  BATCH: Map<Observable<any>, any> | undefined;
};

export const CONTEXT: Context = {
  OBSERVER: undefined,
  TRACKING: false,
  BATCH: undefined,
};
