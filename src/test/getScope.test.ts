import { createEffect, createRoot, getScope, untrack } from "#/mod.ts";
import {
  assertExists,
  assertNotEquals,
  assertStrictEquals,
  describe,
  it,
} from "./util.ts";

describe("getOwner", () => {
  it("should return the owner of the current computation", () => {
    const nullOwner = getScope();
    assertStrictEquals(nullOwner, null);

    createRoot(() => {
      const outerOwner = getScope();

      createEffect(() => {
        const owner = getScope();
        assertExists(owner);
        assertNotEquals(owner, outerOwner);
      });
    });
  });

  it("should return the owner of the computation in untrack", () => {
    createRoot(() => {
      const owner = getScope();

      untrack(() => {
        const currentOwner = getScope();
        assertExists(currentOwner);
        assertStrictEquals(currentOwner, owner);
      });
    });
  });
});
