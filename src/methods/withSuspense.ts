import { Accessor } from "~/types.ts";
import { Suspense } from "~/objects/suspense.ts";
import { createEffect } from "~/methods/createEffect.ts";

export function withSuspense<T>(suspended: Accessor<boolean>, fn: () => T): T {
  const suspense = new Suspense();

  createEffect(
    () => {
      suspense.toggle(suspended());
    },
    undefined,
    { sync: true },
  );

  return suspense.runWith(fn);
}
