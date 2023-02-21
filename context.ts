import { Observable } from "./objects/observable";
import { Owner } from "./objects/owner";

type Context = {
  OWNER: Owner | undefined;
  TRACKING: boolean;
  BATCH: Map<Observable<any>, any> | undefined;
};

export const CONTEXT: Context = {
  OWNER: undefined,
  TRACKING: false,
  BATCH: undefined,
};
