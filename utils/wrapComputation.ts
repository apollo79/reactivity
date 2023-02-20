import { CONTEXT } from "../context";
import { Computation, ComputationFunction } from "../objects/computation";

export function wrapComputation<Next, Init>(
  fn: ComputationFunction<undefined | Next | Init, Next>,
  computation: Computation<Next, Init> | undefined,
  tracking: boolean
) {
  const PREV_OBSERVER = CONTEXT.OBSERVER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.OBSERVER = computation;
  CONTEXT.TRACKING = tracking;

  try {
    // use value here, as with `get` we would register ourselves as listening to our own signal which would cause an infinite loop
    // also `prevValue` might be undefined here, since it is set the first time to the result of the `run` method, which calls `wrapComputation`
    return fn(computation?.prevValue?.value ?? computation?.init);
  } finally {
    CONTEXT.OBSERVER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
