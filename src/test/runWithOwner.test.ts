import {
  createRoot,
  getContext,
  getOwner,
  runWithOwner,
  type Scope,
  setContext,
} from "#/mod.ts";
import {
  assertSpyCallArg,
  assertStrictEquals,
  describe,
  it,
  spy,
} from "./util.ts";

describe("runWithOwner", () => {
  it("should scope function to current scope", () => {
    let scope!: Scope | null;
    createRoot(() => {
      scope = getOwner();
      setContext("id", 10);
    });

    runWithOwner(() => assertStrictEquals(getContext("id"), 10), scope);
  });

  it("should return value", () => {
    assertStrictEquals(
      runWithOwner(() => 100, null),
      100,
    );
  });

  // it("should handle errors", () => {
  //   const error = new Error(),
  //     handler = spy();

  //   let scope!: Scope | null;
  //   createRoot(() => {
  //     scope = getOwner();
  //     onError(handler);
  //   });

  //   runWithOwner(() => {
  //     throw error;
  //   }, scope);

  //   assertSpyCallArg(handler, 0, 0, error);
  // });
});
