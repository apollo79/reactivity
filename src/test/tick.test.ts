import { createEffect, createSignal, setScheduling, tick } from "#/mod.ts";
import { assertSpyCalls, beforeAll, describe, it, spy } from "./util.ts";

describe("tick", () => {
  beforeAll(() => {
    setScheduling("async");
  });

  it("should batch updates", () => {
    const $a = createSignal(10);
    const $effect = spy(() => void $a());

    createEffect($effect);

    $a.set(20);
    $a.set(30);
    $a.set(40);

    assertSpyCalls($effect, 1);
    tick();
    assertSpyCalls($effect, 2);
  });

  it("should wait for queue to flush", () => {
    const $a = createSignal(10);
    const $effect = spy(() => void $a());

    createEffect($effect);

    assertSpyCalls($effect, 1);

    $a.set(20);
    tick();
    assertSpyCalls($effect, 2);

    $a.set(30);
    tick();
    assertSpyCalls($effect, 3);
  });

  it("should not fail if called while flushing", () => {
    const $a = createSignal(10);
    const $effect = spy(() => {
      $a();
      tick();
    });

    createEffect(() => {
      $effect();
    });

    assertSpyCalls($effect, 1);

    $a.set(20);
    tick();
    assertSpyCalls($effect, 2);
  });
});
