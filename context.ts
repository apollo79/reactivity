import { Observable } from "./observable";
import { Computation } from "./computation";

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
