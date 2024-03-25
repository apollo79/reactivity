import { createEffect, createRoot, getContext, withContext } from "#/mod.ts";
import { assertStrictEquals, describe, it } from "./util.ts";

describe("context", () => {
  it("should get context value", () => {
    const key = Symbol();
    createRoot(() => {
      withContext({ [key]: 100 }, () => {
        createRoot(() => {
          createRoot(() => {
            withContext({ [key]: 100 }, () => {});
          });

          createEffect(() => {
            assertStrictEquals(getContext(key), 100);
          });
        });
      });
    });
  });

  it("should not throw if no context value is found", () => {
    const key = Symbol();
    createRoot(() => {
      createRoot(() => {
        createEffect(() => {
          assertStrictEquals(getContext(key), undefined);
        });
      });
    });
  });
});
