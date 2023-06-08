import { setBatch } from "~/context.ts";
import { BatchFunction } from "~/types.ts";

// we need a counter for checking for nested / concurrent batches
// in a nested one we could go with a boolean for the outer one, but with concurrent batches, this leads to problems as the one registered first,
// which would get the "outer batch role" might finish before the other batch(es) and trigger an unnescessary update
// the batch promise might be registered and resolved by different batches
let counter = 0;
let resolve: () => void;

export async function batch<T>(fn: BatchFunction<T>): Promise<Awaited<T>> {
  if (!counter) {
    const promise = new Promise<void>((r) => resolve = r);

    setBatch(promise);
  }

  try {
    counter++;

    return await fn();
  } finally {
    counter--;

    if (!counter) {
      resolve();
      setBatch(undefined);
    }
  }
}
