import { Observable } from "./objects/observable";
import { Owner } from "./objects/owner";

type Context = {
  OWNER: Owner | null;
  TRACKING: boolean;
  BATCH: Map<Observable<any>, any> | undefined;
};

export const CONTEXT: Context = {
  OWNER: null,
  TRACKING: false,
  BATCH: undefined,
};
