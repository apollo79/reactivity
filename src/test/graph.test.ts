// https://github.com/preactjs/signals/blob/main/packages/core/test/signal.test.tsx#L1249

import { createMemo, createSignal, setScheduling } from "#/mod.ts";
import {
  assertSpyCalls,
  assertStrictEquals,
  beforeAll,
  describe,
  it,
  spy,
} from "./util.ts";

describe("graph", () => {
  beforeAll(() => {
    setScheduling("sync");
  });

  it("should drop A->B->A updates", () => {
    //     A
    //   / |
    //  B  | <- Looks like a flag doesn't it? :D
    //   \ |
    //     C
    //     |
    //     D

    const $a = createSignal(2);
    const $b = createMemo(() => $a() - 1);
    const $c = createMemo(() => $a() + $b());

    const compute = spy(() => "d: " + $c());
    const $d = createMemo(compute);

    assertStrictEquals($d(), "d: 3");
    assertSpyCalls(compute, 1);

    $a.set(4);
    $d();
    assertSpyCalls(compute, 2);
  });

  it("should only update every createSignal once (diamond graph)", () => {
    // In this scenario "D" should only update once when "A" receives
    // an update. This is sometimes referred to as the "diamond" scenario.
    //     A
    //   /   \
    //  B     C
    //   \   /
    //     D

    const $a = createSignal("a");
    const $b = createMemo(() => $a());
    const $c = createMemo(() => $a());

    const compute = spy(() => $b() + " " + $c());
    const $d = createMemo(compute);

    assertStrictEquals($d(), "a a");
    assertSpyCalls(compute, 1);

    $a.set("aa");
    assertStrictEquals($d(), "aa aa");
    assertSpyCalls(compute, 2);
  });

  it("should only update every createSignal once (diamond graph + tail)", () => {
    // "E" will be likely updated twice if our mark+sweep logic is buggy.
    //     A
    //   /   \
    //  B     C
    //   \   /
    //     D
    //     |
    //     E

    const $a = createSignal("a");
    const $b = createMemo(() => $a());
    const $c = createMemo(() => $a());
    const $d = createMemo(() => $b() + " " + $c());

    const compute = spy(() => $d());
    const $e = createMemo(compute);

    assertStrictEquals($e(), "a a");
    assertSpyCalls(compute, 1);

    $a.set("aa");
    assertStrictEquals($e(), "aa aa");
    assertSpyCalls(compute, 2);
  });

  it("should bail out if result is the same", () => {
    // Bail out if value of "B" never changes
    // A->B->C

    const $a = createSignal("a");

    const $b = createMemo(() => {
      $a();
      return "foo";
    });

    const compute = spy(() => $b());
    const $c = createMemo(compute);

    assertStrictEquals($c(), "foo");
    assertSpyCalls(compute, 1);

    $a.set("aa");
    assertStrictEquals($c(), "foo");
    assertSpyCalls(compute, 1);
  });

  it("should only update every createSignal once (jagged diamond graph + tails)", () => {
    // "F" and "G" will be likely updated >3 if our mark+sweep logic is buggy.
    //     A
    //   /   \
    //  B     C
    //  |     |
    //  |     D
    //   \   /
    //     E
    //   /   \
    //  F     G

    const $a = createSignal("a");
    const $b = createMemo(() => $a());
    const $c = createMemo(() => $a());
    const $d = createMemo(() => $c());

    const eSpy = spy(() => $b() + " " + $d());
    const $e = createMemo(eSpy);

    const fSpy = spy(() => $e());
    const $f = createMemo(fSpy);
    const gSpy = spy(() => $e());
    const $g = createMemo(gSpy);

    assertStrictEquals($f(), "a a");
    assertSpyCalls(fSpy, 1);

    assertStrictEquals($g(), "a a");
    assertSpyCalls(gSpy, 1);

    $a.set("b");

    assertStrictEquals($e(), "b b");
    assertSpyCalls(eSpy, 2);

    assertStrictEquals($f(), "b b");
    assertSpyCalls(fSpy, 2);

    assertStrictEquals($g(), "b b");
    assertSpyCalls(gSpy, 2);

    $a.set("c");

    assertStrictEquals($e(), "c c");
    assertSpyCalls(eSpy, 3);

    assertStrictEquals($f(), "c c");
    assertSpyCalls(fSpy, 3);

    assertStrictEquals($g(), "c c");
    assertSpyCalls(gSpy, 3);
  });

  it("should only subscribe to createSignals listened to", () => {
    //    *A
    //   /   \
    // *B     C <- we don't listen to C

    const $a = createSignal("a");

    const $b = createMemo(() => $a());
    const compute = spy(() => $a());
    createMemo(compute);

    assertStrictEquals($b(), "a");
    assertSpyCalls(compute, 0);
    $a.set("aa");

    assertStrictEquals($b(), "aa");
    assertSpyCalls(compute, 0);
  });

  it("should ensure subs update even if one dep unmarks it", () => {
    // In this scenario "C" always returns the same value. When "A"
    // changes, "B" will update, then "C" at which point its update
    // to "D" will be unmarked. But "D" must still update because
    // "B" marked it. If "D" isn't updated, then we have a bug.
    //     A
    //   /   \
    //  B     *C <- returns same value every time
    //   \   /
    //     D

    const $a = createSignal("a");
    const $b = createMemo(() => $a());
    const $c = createMemo(() => {
      $a();
      return "c";
    });

    const compute = spy(() => $b() + " " + $c());
    const $d = createMemo(compute);

    assertStrictEquals($d(), "a c");
    $a.set("aa");

    assertStrictEquals($d(), "aa c");
    assertSpyCalls(compute, 2);
  });

  it("should ensure subs update even if two deps unmark it", () => {
    // In this scenario both "C" and "D" always return the same
    // value. But "E" must still update because "A"  marked it.
    // If "E" isn't updated, then we have a bug.
    //     A
    //   / | \
    //  B *C *D
    //   \ | /
    //     E

    const $a = createSignal("a");
    const $b = createMemo(() => $a());
    const $c = createMemo(() => {
      $a();
      return "c";
    });
    const $d = createMemo(() => {
      $a();
      return "d";
    });

    const compute = spy(() => $b() + " " + $c() + " " + $d());
    const $e = createMemo(compute);
    assertStrictEquals($e(), "a c d");

    $a.set("aa");

    assertStrictEquals($e(), "aa c d");
    assertSpyCalls(compute, 2);
  });
});
