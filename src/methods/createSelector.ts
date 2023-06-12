import { Accessor, SelectorEqualsFunction } from "~/types.ts";
import { createEffect } from "~/methods/createEffect.ts";
import { untrack } from "~/methods/untrack.ts";
import { onDispose } from "~/methods/onDispose.ts";
import { Observer } from "~/objects/observer.ts";
import { CURRENTOBSERVER, STATE_DIRTY } from "~/context.ts";

export function createSelector<T, U>(
  source: Accessor<T>,
  equalsFn: SelectorEqualsFunction<T, U> = Object.is,
): (key: U) => boolean {
  // we store the listeners for each call of the function returned by createSelector in a Map
  const observerMap: Map<U, Set<Observer<any>>> = new Map();

  let currentValue = untrack(source);

  createEffect<T, T | undefined>(
    (prevValue) => {
      const nextValue = source();
      currentValue = nextValue;

      if (!Object.is(prevValue, nextValue)) {
        // for each key that has already been requested
        for (const [key, observers] of observerMap) {
          const wasEqual = equalsFn(key, prevValue!);
          const isEqual = equalsFn(key, nextValue);

          if (wasEqual !== isEqual) {
            // we mark every observer of this key dirty so it gets queued
            for (const observer of observers) {
              observer.stale(STATE_DIRTY);
            }
          }
        }
      }

      return nextValue;
    },
    currentValue,
    {
      sync: true,
    },
  );

  return (key: U): boolean => {
    const observer = CURRENTOBSERVER;

    if (observer) {
      let observerSet = observerMap.get(key);

      if (!observerSet) {
        observerSet = new Set([observer]);
        observerMap.set(key, observerSet);
      } else {
        observerSet.add(observer);
      }

      onDispose(() => {
        observerSet!.delete(observer);
        if (!observerSet!.size) {
          observerMap.delete(key);
        }
      });
    }

    return equalsFn(key, currentValue);
  };
}
