import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  getScope,
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

describe("peek", () => {
  it("should not create dependency", () => {
    const effectA = spy();
    const computeC = spy();

    const $a = createSignal(10);
    const $b = createMemo(() => $a() + 10);
    const $c = createMemo(() => {
      computeC();
      return $b.peek() + 10;
    });

    createEffect(() => {
      effectA();
      assertStrictEquals($a.peek(), 10);
      assertStrictEquals($b.peek(), 20);
      assertStrictEquals($c.peek(), 30);
    });

    assertSpyCalls(effectA, 1);
    assertSpyCalls(computeC, 1);

    $a.set(20);
    tick();

    assertSpyCalls(effectA, 1);
    assertSpyCalls(computeC, 1);
  });

  it("should not affect deep dependency being created", () => {
    const effectA = spy();
    const computeD = spy();

    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createSignal(10);
    const $d = createMemo(() => {
      computeD();
      return $a() + $b.peek() + $c.peek() + 10;
    });

    createEffect(() => {
      effectA();
      assertStrictEquals($a.peek(), 10);
      assertStrictEquals($d.peek(), 40);
    });

    assertSpyCalls(effectA, 1);
    assertStrictEquals($d(), 40);
    assertSpyCalls(computeD, 1);

    $a.set(20);
    tick();

    assertSpyCalls(effectA, 1);
    assertStrictEquals($d(), 50);
    assertSpyCalls(computeD, 2);

    $b.set(20);
    tick();

    assertSpyCalls(effectA, 1);
    assertStrictEquals($d(), 50);
    assertSpyCalls(computeD, 2);

    $c.set(20);
    tick();

    assertSpyCalls(effectA, 1);
    assertStrictEquals($d(), 50);
    assertSpyCalls(computeD, 2);
  });

  // it("should track parent across peeks", () => {
  //   const $a = createSignal(0, { id: "$a" });

  //   const childCompute = spy();
  //   const childDispose = spy();

  //   function child() {
  //     const $b = createMemo(() => $a() * 2, { id: "$b" });
  //     createEffect(() => {
  //       childCompute($b());
  //       onDispose(childDispose);
  //     });
  //   }

  //   const dispose = createRoot((dispose) => {
  //     peek(() => child());
  //     return dispose;
  //   });

  //   $a.set(1);
  //   tick();
  //   expect(childCompute).toHaveBeenCalledWith(2);
  //   expect(childDispose).toHaveBeenCalledTimes(1);

  //   dispose();
  //   expect(childDispose).toHaveBeenCalledTimes(2);

  //   $a.set(2);
  //   tick();
  //   expect(childCompute).not.toHaveBeenCalledWith(4);
  //   expect(childDispose).toHaveBeenCalledTimes(2);
  // });
});
