import { Observable } from "./objects/observable";
import { Computation } from "./objects/computation";

type Context = {
  OBSERVER: Computation<any, any> | undefined;
  TRACKING: boolean;
  BATCH: Map<Observable<any>, any> | undefined;
};

export const CONTEXT: Context = {
  OBSERVER: undefined,
  TRACKING: false,
  BATCH: undefined,
};
