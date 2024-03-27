import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  onDispose,
  tick,
  withContext,
  withSuspense,
} from "#/mod.ts";
import { ReadonlySignal } from "~/types.ts";
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

  it("should be invoked in an effect on a dependency change", () => {
    const dispose = spy();

    const dependency = createSignal(0);

    createEffect(() => {
      dependency();

      onDispose(dispose);
    });

    tick();
    assertSpyCalls(dispose, 0);

    dependency.set(1);
    tick();

    assertSpyCalls(dispose, 1);
  });

  it("should be invoked in a memo on a dependency change", () => {
    const dispose = spy();

    const dependency = createSignal(0);

    const memo = createMemo(() => {
      dependency();

      onDispose(dispose);
    });

    tick();
    assertSpyCalls(dispose, 0);

    memo();
    assertSpyCalls(dispose, 0);

    dependency.set(1);
    memo();
    assertSpyCalls(dispose, 1);
  });

  it("should be invoked in different types of scopes on parent cleanup", () => {
    const dispose1 = spy();
    const dispose2 = spy();
    const dispose3 = spy();
    const dispose4 = spy();

    let disposeRoot: () => void;
    let memo: ReadonlySignal<number>;
    createRoot((dispose) => {
      disposeRoot = dispose;

      createEffect(() => {
        onDispose(dispose1);
      });

      memo = createMemo(() => {
        onDispose(dispose2);

        return 0;
      });

      withSuspense(
        () => false,
        () => {
          onDispose(dispose3);
        },
      );

      withContext({ id: 0 }, () => {
        onDispose(dispose4);
      });
    });

    tick();
    memo!();
    disposeRoot!();

    assertSpyCalls(dispose1, 1);
    assertSpyCalls(dispose2, 1);
    assertSpyCalls(dispose3, 1);
    assertSpyCalls(dispose4, 1);
  });
});
