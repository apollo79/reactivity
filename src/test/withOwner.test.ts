import { createRoot, getContext, withOwner, catchError } from "#/mod.ts";
import { withContext } from "~/methods/withContext.ts";
import {
  assertStrictEquals,
  describe,
  it,
  spy,
  assertSpyCallArg,
} from "./util.ts";

describe("runWithOwner", () => {
  it("should scope function to current scope", () => {
    let runWith: ReturnType<typeof withOwner>;

    withContext({ id: 10 }, () => {
      runWith = withOwner();
    });

    runWith!(() => assertStrictEquals(getContext("id"), 10));
  });

  it("should return value", () => {
    assertStrictEquals(
      withOwner()(() => 100),
      100
    );
  });

  it("should handle errors", () => {
    const error = new Error(),
      handler = spy();

    let runWith: ReturnType<typeof withOwner>;

    catchError(() => {
      runWith = withOwner();
    }, handler);

    runWith!(() => {
      throw error;
    });

    assertSpyCallArg(handler, 0, 0, error);
  });
});