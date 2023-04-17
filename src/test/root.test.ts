import {
  type Accessor,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  getOwner,
  onDispose,
  setScheduling,
  type Signal,
} from "#/mod.ts";
import {
  assertSpyCallArg,
  assertSpyCalls,
  assertStrictEquals,
  beforeAll,
  describe,
  it,
  spy,
} from "./util.ts";

describe("root", () => {
  beforeAll(() => {
    setScheduling("sync");
  });

  it("should dispose of inner computations", () => {
    const computeB = spy();

    let $a: Signal<number>;
    let $b: Accessor<number>;

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

    $a!.set(50);

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
