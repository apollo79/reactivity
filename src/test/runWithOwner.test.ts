import {
  createRoot,
  getContext,
  getOwner,
  type Owner,
  runWithOwner,
  setContext,
} from "#/mod.ts";
import { assertStrictEquals, describe, it } from "./util.ts";

describe("runWithOwner", () => {
  it("should scope function to current scope", () => {
    let scope!: Owner | null;
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
