import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  getOwner,
  type Memo,
  onDispose,
  type Signal,
  tick,
} from "#/mod.ts";
import {
  assertSpyCallArg,
  assertSpyCalls,
  assertStrictEquals,
  describe,
  it,
  spy,
} from "./util.ts";

describe("root", () => {
  it("should dispose of inner computations", () => {
    const computeB = spy();

    let $a: Signal<number>;
    let $b: Memo<number>;

    createRoot((dispose) => {
      $a = createSignal(10);

      $b = createMemo(() => {
        computeB();
        return $a() + 10;
      });

      $b();
      dispose();
    });

    assertStrictEquals($b!(), 20);
    assertSpyCalls(computeB, 1);

    tick();

    $a!.set(50);
    tick();

    assertStrictEquals($b!(), 20);
    assertSpyCalls(computeB, 1);
  });

  it("should return result", () => {
    const result = createRoot((dispose) => {
      dispose();
      return 10;
    });

    assertStrictEquals(result, 10);
  });

  it("should create new tracking scope", () => {
    const innerEffect = spy();

    const $a = createSignal(0);

    const stop = createEffect(() => {
      $a();
      createRoot(() => {
        createEffect(() => {
          innerEffect($a());
        });
      });
    });

    assertSpyCallArg(innerEffect, 0, 0, 0);
    assertSpyCalls(innerEffect, 1);

    stop();

    $a.set(10);
    tick();
    assertSpyCalls(innerEffect, 2);
  });

  it("should not be reactive", () => {
    let $a: Signal<number>;

    const rootCall = spy();

    createRoot(() => {
      $a = createSignal(0);
      $a();
      rootCall();
    });

    assertSpyCalls(rootCall, 1);

    $a!.set(1);
    tick();
    assertSpyCalls(rootCall, 1);
  });

  it("should hold parent tracking", () => {
    createRoot(() => {
      const parent = getOwner();
      createRoot(() => {
        assertStrictEquals(getOwner()!.parentScope, parent);
      });
    });
  });

  it("should not throw if dispose called during active disposal process", () => {
    createRoot((dispose) => {
      onDispose(() => {
        dispose();
      });

      dispose();
    });
  });
});
