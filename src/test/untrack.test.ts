import {
  createEffect,
  createRoot,
  createSignal,
  tick,
  untrack,
} from "#/mod.ts";
import { assertStrictEquals, describe, it } from "./util.ts";

describe("untrack", () => {
  it("should mute an effect", () => {
    createRoot(() => {
      let temp!: string;

      const sign = createSignal("thoughts");

      createEffect(() => (temp = `unpure ${untrack(sign)}`));

      tick();
      assertStrictEquals(temp, "unpure thoughts");

      sign.set("mind");
      tick();
      assertStrictEquals(temp, "unpure thoughts");
    });
  });
});
