import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  type Memo,
  onError,
  setScheduling,
} from "#/mod.ts";

import {
  assertStrictEquals,
  assertThrows,
  beforeAll,
  describe,
  it,
} from "./util.ts";

describe("onError", () => {
  beforeAll(() => {
    setScheduling("sync");
  });

  it("No Handler", () => {
    assertThrows(() => {
      createRoot(() => {
        throw "fail";
      }),
        Error,
        "fail";
    });
  });

  it("Top level", () => {
    let errored = false;
    createRoot(() => {
      onError(() => (errored = true));
      throw "fail";
    });

    assertStrictEquals(errored, true);
  });

  it("In initial effect", () => {
    let errored = false;
    createRoot(() => {
      createEffect(() => {
        onError(() => (errored = true));
        throw "fail";
      });
    });

    assertStrictEquals(errored, true);
  });

  it("With multiple error handlers", () => {
    let errored = false;
    let errored2 = false;

    createRoot(() => {
      createEffect(() => {
        onError(() => (errored = true));
        onError(() => (errored2 = true));

        throw "fail";
      });
    });

    assertStrictEquals(errored, true);
    assertStrictEquals(errored2, true);
  });

  it("In update effect", () => {
    let errored = false;

    createRoot(() => {
      const s = createSignal(0);

      createEffect(() => {
        const v = s();

        onError(() => (errored = true));

        if (v) {
          throw "fail";
        }
      });

      s.set(1);
    });

    assertStrictEquals(errored, true);
  });

  it("In initial nested effect", () => {
    let errored = false;

    createRoot(() => {
      createEffect(() => {
        createEffect(() => {
          onError(() => (errored = true));

          throw "fail";
        });
      });
    });

    assertStrictEquals(errored, true);
  });

  it("In nested update effect", () => {
    let errored = false;

    createRoot(() => {
      const s = createSignal(0);

      createEffect(() => {
        createEffect(() => {
          const v = s();

          onError(() => (errored = true));

          if (v) {
            throw "fail";
          }
        });
      });

      s.set(1);
    });

    assertStrictEquals(errored, true);
  });

  it("In nested update effect different levels", () => {
    let errored = false;

    createRoot(() => {
      const s = createSignal(0);

      createEffect(() => {
        onError(() => (errored = true));

        createEffect(() => {
          const v = s();

          if (v) {
            throw "fail";
          }
        });
      });

      s.set(1);
    });

    assertStrictEquals(errored, true);
  });

  it("In nested memo", () => {
    let errored = false;
    let memo: Memo<void>;

    createRoot(() => {
      memo = createMemo(() => {
        onError(() => (errored = true));

        createEffect(() => {});

        throw new Error("fail");
      });
    });

    memo!();

    assertStrictEquals(errored, true);
  });
});
