import { createSignal, setScheduling } from "#/mod.ts";

import {
  assertInstanceOf,
  assertStrictEquals,
  beforeAll,
  describe,
  it,
} from "./util.ts";

describe("signal", () => {
  beforeAll(() => {
    setScheduling("sync");
  });

  it("should store and return value on read", () => {
    const $a = createSignal(10);

    assertInstanceOf($a, Function);
    assertStrictEquals($a(), 10);
  });

  it("should update signal via `set()`", () => {
    const $a = createSignal(10);
    $a.set(20);
    assertStrictEquals($a(), 20);
  });

  it("should update signal via next function", () => {
    const $a = createSignal(10);
    $a.set((n) => n + 10);
    assertStrictEquals($a(), 20);
  });

  it("should accept equals option", () => {
    const $a = createSignal(10, {
      // Skip odd numbers.
      equals: (prev, next) => prev + 1 === next,
    });

    $a.set(11);
    assertStrictEquals($a(), 10);

    $a.set(12);
    assertStrictEquals($a(), 12);

    $a.set(13);
    assertStrictEquals($a(), 12);
  });

  it("should update signal with functional value", () => {
    const $a = createSignal<() => number>(() => 10);
    assertStrictEquals($a()(), 10);
    $a.set(() => () => 20);
    assertStrictEquals($a()(), 20);
  });
});
