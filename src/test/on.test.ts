import {
  createEffect,
  createRoot,
  createSignal,
  on,
  setScheduling,
} from "#/mod.ts";
import { assertStrictEquals, beforeAll, describe, it } from "./util.ts";

describe("on", () => {
  beforeAll(() => {
    setScheduling("sync");
  });

  it("should create an effect with an explicit dep", () => {
    let temp: string;

    createRoot(() => {
      const sign = createSignal("thoughts");
      const fn = on(sign, (v) => (temp = `impure ${v}`));

      createEffect(fn);
      createEffect(on(sign, (v) => (temp = `impure ${v}`)));
    });

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

    assertStrictEquals(temp!, "impure 3");
  });

  it("it should create an effect with explicit deps which on the first change", () => {
    let temp: string;
    const sign = createSignal("thoughts");

    createRoot(() => {
      const fn = on(sign, (v) => (temp = `impure ${v}`), { defer: true });

      createEffect(fn);
    });

    assertStrictEquals(temp!, undefined);

    sign.set("minds");

    assertStrictEquals(temp!, "impure minds");
  });
});
