import {
  createEffect,
  createMemo,
  createSignal,
  onDispose,
  tick,
} from "#/mod.ts";
import {
  assertSpyCalls,
  assertStrictEquals,
  describe,
  it,
  spy,
} from "./util.ts";

describe("effect", () => {
  it("should run effect", () => {
    const $a = createSignal(0),
      $effect = spy(() => void $a());

    createEffect($effect);
    tick();
    assertSpyCalls($effect, 1);

    $a.set(1);
    tick();
    assertSpyCalls($effect, 2);
  });

  it("should run effect on change", () => {
    const effectA = spy();

    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createMemo(() => $a() + $b());
    const $d = createMemo(() => $c());

    createEffect(() => {
      effectA();
      $d();
    });

    tick();
    assertSpyCalls(effectA, 1);

    $a.set(20);
    tick();
    assertSpyCalls(effectA, 2);

    $b.set(20);
    tick();
    assertSpyCalls(effectA, 3);

    $a.set(20);
    $b.set(20);
    tick();
    assertSpyCalls(effectA, 3);
  });

  it("should handle nested effect", () => {
    const $a = createSignal(0);
    const $b = createSignal(0);

    const outerEffect = spy();
    const innerEffect = spy();
    const innerDispose = spy();

    const stop = createEffect(() => {
      $a();
      outerEffect();
      createEffect(() => {
        $b();
        innerEffect();
        onDispose(innerDispose);
      });
    });

    tick();
    assertSpyCalls(outerEffect, 1);
    assertSpyCalls(innerEffect, 1);
    assertSpyCalls(innerDispose, 0);

    $b.set(1);
    tick();
    assertSpyCalls(outerEffect, 1);
    assertSpyCalls(innerEffect, 2);
    assertSpyCalls(innerDispose, 1);

    $b.set(2);
    tick();
    assertSpyCalls(outerEffect, 1);
    assertSpyCalls(innerEffect, 3);
    assertSpyCalls(innerDispose, 2);

    $a.set(1);
    tick();
    assertSpyCalls(outerEffect, 2);
    assertSpyCalls(innerEffect, 4); // new one is created
    assertSpyCalls(innerDispose, 3);

    $b.set(3);
    tick();
    assertSpyCalls(outerEffect, 2);
    assertSpyCalls(innerEffect, 5);
    assertSpyCalls(innerDispose, 4);

    stop();
    $a.set(10);
    $b.set(10);
    tick();
    assertSpyCalls(outerEffect, 2);
    assertSpyCalls(innerEffect, 5);
    assertSpyCalls(innerDispose, 5);
  });

  it("should stop effect", () => {
    const effectA = spy();

    const $a = createSignal(10);

    const stop = createEffect(() => {
      effectA();
      $a();
    });

    tick();
    stop();

    $a.set(20);
    tick();
    assertSpyCalls(effectA, 1);
  });

  it("should not run effect if stopped early", () => {
    const effectA = spy();

    const $a = createSignal(10);

    const stop = createEffect(() => {
      effectA();
      $a();
    });

    stop();

    $a.set(20);
    tick();
    assertSpyCalls(effectA, 0);
  });

  //   it("should call returned dispose function", () => {
  //     const dispose = spy();

  //     const $a = createSignal(0);

  //     createEffect(() => {
  //       $a();
  //       return dispose;
  //     });

  //     assertSpyCalls(dispose, 0);

  //     for (let i = 1; i <= 3; i += 1) {
  //       $a.set(i);
  //         //       assertSpyCalls(dispose, i);
  //     }
  //   });

  it("should run all disposals before each new run", () => {
    const effectA = spy();
    const disposeA = spy();
    const disposeB = spy();

    function fnA() {
      onDispose(disposeA);
    }

    function fnB() {
      onDispose(disposeB);
    }

    const $a = createSignal(0);
    createEffect(() => {
      effectA();
      fnA(), fnB(), $a();
    });

    tick();
    assertSpyCalls(effectA, 1);
    assertSpyCalls(disposeA, 0);
    assertSpyCalls(disposeB, 0);

    for (let i = 1; i <= 3; i += 1) {
      $a.set(i);
      tick();
      assertSpyCalls(effectA, i + 1);
      assertSpyCalls(disposeA, i);
      assertSpyCalls(disposeB, i);
    }
  });

  it("should dispose of nested effect", () => {
    const $a = createSignal(0);
    const innerEffect = spy();

    const stop = createEffect(() => {
      createEffect(() => {
        innerEffect($a());
      });
    });

    stop();
    tick();
    $a.set(10);
    assertSpyCalls(innerEffect, 0);
  });

  it("should conditionally observe", () => {
    const $a = createSignal(0);
    const $b = createSignal(0);
    const $cond = createSignal(true);
    const $c = createMemo(() => ($cond() ? $a() : $b()));
    const $effect = spy();

    createEffect(() => {
      $c();
      $effect();
    });

    tick();
    assertSpyCalls($effect, 1);

    $b.set(1);
    tick();
    assertSpyCalls($effect, 1);

    $a.set(1);
    tick();
    assertSpyCalls($effect, 2);

    $cond.set(false);
    tick();
    assertSpyCalls($effect, 2);

    $b.set(2);
    tick();
    assertSpyCalls($effect, 3);

    $a.set(3);
    tick();
    assertSpyCalls($effect, 3);
  });

  it("should dispose of nested conditional effect", () => {
    const $cond = createSignal(true);

    const disposeA = spy();
    const disposeB = spy();

    function fnA() {
      createEffect(() => {
        onDispose(disposeA);
      });
    }

    function fnB() {
      createEffect(() => {
        onDispose(disposeB);
      });
    }

    createEffect(() => ($cond() ? fnA() : fnB()));
    tick();
    $cond.set(false);
    tick();
    assertSpyCalls(disposeA, 1);
  });

  // https://github.com/preactjs/signals/issues/152
  it("should handle looped effects", () => {
    let values: number[] = [],
      loop = 2;

    const $value = createSignal(0);

    let x = 0;
    createEffect(
      () => {
        x++;
        values.push($value());
        for (let i = 0; i < loop; i++) {
          createEffect(
            () => {
              values.push($value() + i);
            },
            // { id: `inner-effect-${x}-${i}` },
          );
        }
      },
      //   { id: "root-effect" },
    );

    tick();
    assertStrictEquals(values.length, 3);
    assertStrictEquals(values.join(","), "0,0,1");

    loop = 1;
    values = [];
    $value.set(1);
    tick();
    assertStrictEquals(values.length, 2);
    assertStrictEquals(values.join(","), "1,1");

    values = [];
    $value.set(2);
    tick();
    assertStrictEquals(values.length, 2);
    assertStrictEquals(values.join(","), "2,2");
  });

  it("should apply changes in effect in same flush", async () => {
    const $a = createSignal(0),
      $b = createSignal(0),
      $c = createMemo(() => {
        return $a() + 1;
      }),
      $d = createMemo(() => {
        return $c() + 2;
      });

    createEffect(() => {
      $a.set((n) => n + 1);
      $b();
    });

    tick();
    assertStrictEquals($a(), 1);
    assertStrictEquals($c(), 2);
    assertStrictEquals($d(), 4);

    $b.set(1);

    await Promise.resolve();

    assertStrictEquals($a(), 2);
    assertStrictEquals($c(), 3);
    assertStrictEquals($d(), 5);

    $b.set(2);

    await Promise.resolve();

    assertStrictEquals($a(), 3);
    assertStrictEquals($c(), 4);
    assertStrictEquals($d(), 6);
  });
});
