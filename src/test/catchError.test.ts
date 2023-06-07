/**
 * @see https://github.com/solidjs/solid/blob/main/packages/solid/test/signals.spec.ts#L436
 */

import {
  catchError,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  tick,
} from "#/mod.ts";
import { assertStrictEquals, assertThrows, describe, it } from "./util.ts";

describe("catchError", () => {
  it("No Handler", () => {
    assertThrows(
      () =>
        createRoot(() => {
          throw "fail";
        }),
      "fail",
    );
  });

  it("Top level", () => {
    let errored = false;

    createRoot(() => {
      catchError(
        () => {
          throw "fail";
        },
        () => (errored = true),
      );
    });

    tick();

    assertStrictEquals(errored, true);
  });

  it("In initial effect", () => {
    let errored = false;

    createRoot(() => {
      createEffect(() => {
        catchError(
          () => {
            throw "fail";
          },
          () => (errored = true),
        );
      });
    });

    tick();

    assertStrictEquals(errored, true);
  });

  //   it("With multiple error handlers", () => {
  //     let errored = false;
  //     let errored2 = false;

  //     createRoot(() => {
  //       createEffect(() => {
  //         onError(() => (errored = true));
  //         onError(() => (errored2 = true));
  //         throw "fail";
  //       });
  //     });

  //     assertStrictEquals(errored, true);
  //     assertStrictEquals(errored2, true);
  //   });

  it("In update effect", () => {
    let errored = false;

    createRoot(() => {
      const s = createSignal(0);

      createEffect(() => {
        const v = s();

        catchError(
          () => {
            if (v) {
              throw "fail";
            }
          },
          () => (errored = true),
        );
      });

      s.set(1);
    });

    tick();

    assertStrictEquals(errored, true);
  });

  it("In initial nested effect", () => {
    let errored = false;

    createRoot(() => {
      createEffect(() => {
        createEffect(() => {
          catchError(
            () => {
              throw "fail";
            },
            () => (errored = true),
          );
        });
      });
    });

    tick();
    assertStrictEquals(errored, true);
  });

  it("In nested update effect", () => {
    let errored = false;
    createRoot(() => {
      const s = createSignal(0);

      createEffect(() => {
        createEffect(() => {
          const v = s();

          catchError(
            () => {
              if (v) {
                throw "fail";
              }
            },
            () => (errored = true),
          );
        });
      });

      s.set(1);
    });

    tick();

    assertStrictEquals(errored, true);
  });

  it("In nested update effect different levels", () => {
    let errored = false;
    createRoot(() => {
      const s = createSignal(0);

      createEffect(() => {
        catchError(
          () =>
            createEffect(() => {
              const v = s();

              if (v) {
                throw "fail";
              }
            }),
          () => (errored = true),
        );
      });

      s.set(1);
    });

    tick();

    assertStrictEquals(errored, true);
  });

  it("In nested memo", () => {
    let errored = false;

    createRoot(() => {
      const m = createMemo(() => {
        catchError(
          () => {
            createEffect(() => {});
            throw new Error("fail");
          },
          () => (errored = true),
        );
      });

      m();
    });

    tick();

    assertStrictEquals(errored, true);
  });
});
