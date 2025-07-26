import { batch, createEffect, createSignal } from "#/mod.ts";
import { assertRejects } from "./util.ts";
import { tick } from "../methods/tick.ts";
import {
  assertInstanceOf,
  assertSpyCallArgs,
  assertSpyCalls,
  assertStrictEquals,
  describe,
  it,
  spy,
} from "./util.ts";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("batch", () => {
  it("should batch asynchronous changes", async () => {
    const $a = createSignal(0);
    const $b = createSignal(0);
    const effect = spy();

    createEffect(() => {
      effect($a(), $b());
    });

    await batch(async () => {
      $a.set(1);
      await Promise.resolve();
      $b.set(1);
      await Promise.resolve();
    });

    await Promise.resolve(); // ensures the queue is run without explicitly doing it

    assertSpyCalls(effect, 1);
    assertSpyCallArgs(effect, 0, [1, 1]);
  });

  it("should batch asynchonous changes after initial run", async () => {
    const $a = createSignal(0);
    const $b = createSignal(0);
    const effect = spy();

    createEffect(() => {
      effect($a(), $b());
    });

    await Promise.resolve(); // ensures the queue is run without explicitly doing it

    await batch(async () => {
      $a.set(1);
      await Promise.resolve();
      $b.set(1);
      await Promise.resolve();
    });

    await Promise.resolve();

    assertSpyCalls(effect, 2);
    assertSpyCallArgs(effect, 1, [1, 1]);
  });

  it("should not batch changes for synchronous effects", async () => {
    const $a = createSignal(0);
    const $b = createSignal(0);
    const effect = spy();

    createEffect(
      () => {
        effect($a(), $b());
      },
      undefined,
      {
        sync: true,
      },
    );

    await batch(async () => {
      $a.set(1);
      await Promise.resolve();
      $b.set(1);
      await Promise.resolve();
    });

    assertSpyCalls(effect, 3);
    assertSpyCallArgs(effect, 0, [0, 0]);
    assertSpyCallArgs(effect, 1, [1, 0]);
    assertSpyCallArgs(effect, 2, [1, 1]);
  });

  it("should allow manual flushing the queue", async () => {
    const $a = createSignal(0);
    const $b = createSignal(0);
    const effect = spy();

    createEffect(() => {
      effect($a(), $b());
    });

    await batch(async () => {
      $a.set(1);
      tick();
      await Promise.resolve();
      $b.set(1);
      await Promise.resolve();
    });

    await Promise.resolve();

    assertSpyCalls(effect, 2);
    assertSpyCallArgs(effect, 0, [1, 0]);
  });

  it("should allow nested batches", async () => {
    const $a = createSignal(0);
    const $b = createSignal(0);
    const effect = spy();

    createEffect(() => {
      effect($a(), $b());
    });

    await batch(async () => {
      $a.set(1);

      await batch(async () => {
        $b.set(1);
        await Promise.resolve();
      });

      await Promise.resolve();
    });

    await Promise.resolve(); // ensures the queue is run without explicitly doing it

    assertSpyCalls(effect, 1);
    assertSpyCallArgs(effect, 0, [1, 1]);
  });

  it("should allow multiple concurrent batches", async () => {
    const $a = createSignal(0);
    const $b = createSignal(0);

    const effect = spy();

    createEffect(() => {
      effect($a(), $b());
    });

    const batchA = batch(async () => {
      await delay(10);
      $a.set(1);
    });

    const batchB = batch(async () => {
      await delay(50);
      $b.set(1);
    });

    await Promise.allSettled([batchA, batchB]);

    assertSpyCalls(effect, 1);
    assertSpyCallArgs(effect, 0, [1, 1]);
  });

  it("should return the return value wrapped in a Promise for a synchronous function", async () => {
    const result = batch(() => 1);

    assertInstanceOf(result, Promise);

    assertStrictEquals(await result, 1);
  });

  it("should return the return value wrapped in a Promise for an asynchronous function", async () => {
    const result = batch(async () => {
      await Promise.resolve();
      return 1;
    });

    assertInstanceOf(result, Promise);

    assertStrictEquals(await result, 1);
  });

  it("should throw the thrown Error in a synchronous function", async () => {
    await assertRejects(
      () =>
        batch(() => {
          throw new Error("Test Error");
        }),
      "Test Error",
    );
  });

  it("should throw the thrown Error in an asynchronous function", async () => {
    await assertRejects(
      () =>
        batch(async () => {
          await Promise.resolve();

          throw new Error("Test Error");
        }),
      "Test Error",
    );
  });
});
