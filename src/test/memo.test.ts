import {
  type Accessor,
  catchError,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
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

describe("memo", () => {
  it("should store and return value on read", () => {
    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createMemo(() => $a() + $b());

    assertStrictEquals($c(), 20);

    // Try again to ensure state is maintained.
    assertStrictEquals($c(), 20);
  });

  it("should update when dependency is updated", () => {
    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createMemo(() => $a() + $b());

    $a.set(20);
    assertStrictEquals($c(), 30);

    $b.set(20);
    assertStrictEquals($c(), 40);
  });

  it("should update when deep dependency is updated", () => {
    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createMemo(() => $a() + $b());
    const $d = createMemo(() => $c());

    $a.set(20);
    assertStrictEquals($d(), 30);
  });

  it("should update when deep computed dependency is updated", () => {
    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createMemo(() => $a() + $b());
    const $d = createMemo(() => $c());
    const $e = createMemo(() => $d());

    $a.set(20);
    assertStrictEquals($e(), 30);
  });

  it("should only re-compute when needed", () => {
    const compute = spy();

    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createMemo(() => compute($a() + $b()));

    assertSpyCalls(compute, 0);

    $c();
    assertSpyCallArg(compute, 0, 0, 20);

    $c();
    assertSpyCalls(compute, 1);

    $a.set(20);
    $c();
    assertSpyCalls(compute, 2);

    $b.set(20);
    $c();
    assertSpyCalls(compute, 3);

    $c();
    assertSpyCalls(compute, 3);
  });

  it("should only re-compute whats needed", () => {
    const computeC = spy();
    const computeD = spy();

    const $a = createSignal(10);
    const $b = createSignal(10);
    const $c = createMemo(() => {
      const a = $a();
      computeC(a);
      return a;
    });
    const $d = createMemo(() => {
      const b = $b();
      computeD(b);
      return b;
    });
    const $e = createMemo(() => $c() + $d());

    assertSpyCalls(computeC, 0);
    assertSpyCalls(computeD, 0);

    $e();
    assertSpyCalls(computeC, 1);
    assertSpyCalls(computeD, 1);
    assertStrictEquals($e(), 20);

    $a.set(20);

    $e();
    assertSpyCalls(computeC, 2);
    assertSpyCalls(computeD, 1);
    assertStrictEquals($e(), 30);

    $b.set(20);

    $e();
    assertSpyCalls(computeC, 2);
    assertSpyCalls(computeD, 2);
    assertStrictEquals($e(), 40);
  });

  it("should discover new dependencies", () => {
    const $a = createSignal(1);
    const $b = createSignal(0);

    const $c = createMemo(() => {
      if ($a()) {
        return $a();
      } else {
        return $b();
      }
    });

    assertStrictEquals($c(), 1);

    $a.set(0);
    assertStrictEquals($c(), 0);

    $b.set(10);
    assertStrictEquals($c(), 10);
  });

  it("should accept equals option", () => {
    const $a = createSignal(0);

    const $b = createMemo(() => $a(), undefined, {
      // Skip odd numbers.
      equals: (prev, next) => prev + 1 === next,
    });

    const effectA = spy();

    createEffect(() => {
      $b();
      effectA();
    });

    tick();
    assertStrictEquals($b(), 0);
    assertSpyCalls(effectA, 1);

    $a.set(2);
    tick();
    assertStrictEquals($b(), 2);
    assertSpyCalls(effectA, 2);

    // no-change
    $a.set(3);
    tick();
    assertStrictEquals($b(), 2);
    assertSpyCalls(effectA, 2);
  });

  it("should use fallback if error is thrown during init", () => {
    createRoot(() => {
      let $a: Accessor<string>;

      catchError(() => {
        $a = createMemo(() => {
          // deno-lint-ignore no-constant-condition
          if (1) throw Error();
          return "";
        }, "foo");
      }, console.log);

      tick();
      assertStrictEquals($a!(), "foo");
    });
  });
});
