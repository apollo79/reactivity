import {
  createEffect,
  createRoot,
  createSignal,
  setScheduling,
  untrack,
} from "#/mod.ts";
import { assertStrictEquals, beforeAll, describe, it } from "./util.ts";

describe("untrack", () => {
  beforeAll(() => {
    setScheduling("sync");
  });

  it("should mute an effect", () => {
    createRoot(() => {
      let temp!: string;

      const sign = createSignal("thoughts");

      createEffect(() => (temp = `unpure ${untrack(sign)}`));

      assertStrictEquals(temp, "unpure thoughts");
      sign.set("mind");
      assertStrictEquals(temp, "unpure thoughts");
    });
  });
});
