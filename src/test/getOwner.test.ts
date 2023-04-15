import { createEffect, createRoot, getOwner, untrack } from "#/mod.ts";
import {
  assertExists,
  assertNotEquals,
  assertStrictEquals,
  describe,
  it,
} from "./util.ts";

describe("getOwner", () => {
  it("should return the owner of the current computation", () => {
    const nullOwner = getOwner();
    assertStrictEquals(nullOwner, null);

    createRoot(() => {
      const outerOwner = getOwner();

      createEffect(() => {
        const owner = getOwner();
        assertExists(owner);
        assertNotEquals(owner, outerOwner);
      });
    });
  });

  it("should return the owner of the computation in untrack", () => {
    createRoot(() => {
      const owner = getOwner();

      untrack(() => {
        const currentOwner = getOwner();
        assertExists(currentOwner);
        assertStrictEquals(currentOwner, owner);
      });
    });
  });
});
