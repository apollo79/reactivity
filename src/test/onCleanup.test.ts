import { createEffect, createRoot, onCleanup, tick } from "#/mod.ts";
import { assertSpyCalls, describe, it, spy } from "./util.ts";
describe("onCleanup", () => {
  it("should be invoked when computation is disposed", () => {
    const callback1 = spy();
    const callback2 = spy();
    const callback3 = spy();

    const stop = createEffect(() => {
      onCleanup(callback1);
      onCleanup(callback2);
      onCleanup(callback3);
    });

    stop();

    assertSpyCalls(callback1, 1);
    assertSpyCalls(callback2, 1);
    assertSpyCalls(callback3, 1);
  });

  it("should clear disposal early", () => {
    const dispose = spy();

    const stop = createEffect(() => {
      const early = onCleanup(dispose);
      early();
    });

    console.log("after createEffect");

    assertSpyCalls(dispose, 1);

    stop();
    tick();

    assertSpyCalls(dispose, 1);
  });

  it("should not trigger wrong onDispose", () => {
    const dispose = spy();

    createRoot(() => {
      createEffect(() => {
        onCleanup(dispose);
      });

      const stop = createEffect(() => {});

      stop();
      tick();

      assertSpyCalls(dispose, 0);
    });
  });
});
