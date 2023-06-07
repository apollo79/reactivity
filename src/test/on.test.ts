import { createEffect, createRoot, createSignal, on, tick } from "#/mod.ts";
import { assertStrictEquals, describe, it } from "./util.ts";

describe("on", () => {
  it("should create an effect with an explicit dep", () => {
    let temp: string;

    createRoot(() => {
      const sign = createSignal("thoughts");
      const fn = on(sign, (v) => (temp = `impure ${v}`));

      createEffect(fn);
      createEffect(on(sign, (v) => (temp = `impure ${v}`)));
    });

    tick();
    assertStrictEquals(temp!, "impure thoughts");
  });

  it("should create an effect with multiple explicit deps", () => {
    let temp: string;

    createRoot(() => {
      const sign = createSignal("thoughts");
      const num = createSignal(3);
      const fn = on([sign, num], (v) => (temp = `impure ${v[1]}`));

      createEffect(fn);
    });

    tick();
    assertStrictEquals(temp!, "impure 3");
  });

  it("it should create an effect with explicit deps which on the first change", () => {
    let temp: string;
    const sign = createSignal("thoughts");

    createRoot(() => {
      const fn = on(sign, (v) => (temp = `impure ${v}`), { defer: true });

      createEffect(fn);
    });

    tick();
    assertStrictEquals(temp!, undefined);

    sign.set("minds");
    tick();
    assertStrictEquals(temp!, "impure minds");
  });
});
