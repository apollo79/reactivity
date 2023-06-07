import { createEffect, createRoot, onDispose, tick } from "#/mod.ts";
import { assertSpyCalls, describe, it, spy } from "./util.ts";

describe("onDispose", () => {
  it("should be invoked when computation is disposed", () => {
    const callback1 = spy();
    const callback2 = spy();
    const callback3 = spy();

    const stop = createEffect(() => {
      onDispose(callback1);
      onDispose(callback2);
      onDispose(callback3);
    });
    tick();
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

    tick();
    assertSpyCalls(dispose, 1);

    stop();
    tick();
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
      tick();
      assertSpyCalls(dispose, 0);
    });
  });
});
