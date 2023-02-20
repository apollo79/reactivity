import { CONTEXT } from "../context";
import { Computation, ComputationFunction } from "../objects/computation";

export function wrapComputation<T>(
  fn: ComputationFunction<T>,
  computation: Computation<any, any> | undefined,
  tracking: boolean
) {
  const PREV_OBSERVER = CONTEXT.OBSERVER;
  const PREV_TRACKING = CONTEXT.TRACKING;

  CONTEXT.OBSERVER = computation;
  CONTEXT.TRACKING = tracking;

  try {
    // use value here, as with `get` we would register ourselves as listening to our own signal which would cause an infinite loop
    const nextValue = fn(computation?.prevValue.value);
    computation?.prevValue.set(nextValue);

    return nextValue;
  } finally {
    CONTEXT.OBSERVER = PREV_OBSERVER;
    CONTEXT.TRACKING = PREV_TRACKING;
  }
}
