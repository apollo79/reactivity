import { createEffect, createRoot, onDispose, setScheduling } from "#/mod.ts";
import { assertSpyCalls, beforeAll, describe, it, spy } from "./util.ts";

describe("onDispose", () => {
  beforeAll(() => {
    setScheduling("sync");
  });

  it("should be invoked when computation is disposed", () => {
    const callback1 = spy();
    const callback2 = spy();
    const callback3 = spy();

    const stop = createEffect(() => {
      onDispose(callback1);
      onDispose(callback2);
      onDispose(callback3);
    });

    stop();

    assertSpyCalls(callback1, 1);
    assertSpyCalls(callback2, 1);
    assertSpyCalls(callback3, 1);
  });

  it("should clear disposal early", () => {
    const dispose = spy();

    const stop = createEffect(() => {
      const early = onDispose(dispose);
      early();
    });

    assertSpyCalls(dispose, 1);

    console.log("stopping");

    stop();

    assertSpyCalls(dispose, 1);
  });

  it("should not trigger wrong onDispose", () => {
    const dispose = spy();

    createRoot(() => {
      createEffect(() => {
        onDispose(dispose);
      });

      const stop = createEffect(() => {});

      stop();

      assertSpyCalls(dispose, 0);
    });
  });
});
