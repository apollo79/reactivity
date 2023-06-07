import {
  createEffect,
  createRoot,
  getContext,
  getOwner,
  type Owner,
  setContext,
} from "#/mod.ts";
import { tick } from "../methods/tick.ts";
import { assertStrictEquals, describe, it } from "./util.ts";
describe("context", () => {
  it("should get context value", () => {
    const key = Symbol();
    createRoot(() => {
      setContext(key, 100);
      createRoot(() => {
        createRoot(() => {
          setContext(key, 200);
        });

        createEffect(() => {
          assertStrictEquals(getContext(key), 100);
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

  it("should use provided scope", () => {
    let scope!: Owner;
    const key = Symbol();

    createRoot(() => {
      scope = getOwner()!;
      createRoot(() => {
        createEffect(() => {
          setContext(key, 200, scope);
        });
      });
    });

    tick();

    createRoot(() => {
      assertStrictEquals(getContext(key), undefined);
      assertStrictEquals(getContext(key, scope), 200);
    });
  });
});
