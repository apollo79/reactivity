import { assertSpyCalls, describe, it, spy } from "./util.ts";
import {
  createEffect,
  createRoot,
  createSignal,
  tick,
  withSuspense,
} from "#/mod.ts";

describe("suspense", () => {
  it("should stop effects from running", () => {
    const effect1 = spy(() => {
        dependency();
      }),
      effect2 = spy(() => {
        dependency();
      });

    const suspended = createSignal(true);
    const dependency = createSignal(0);

    withSuspense(suspended, () => {
      createEffect(effect1);
      createEffect(effect2);
    });

    tick();

    assertSpyCalls(effect1, 0);
    assertSpyCalls(effect2, 0);

    dependency.set(1);
    tick();

    assertSpyCalls(effect1, 0);
    assertSpyCalls(effect2, 0);
  });

  it("should stop nested effects", () => {
    const effect1 = spy(() => {
        dependency();
      }),
      effect2 = spy(() => {
        dependency();
      });

    const suspended = createSignal(true);
    const dependency = createSignal(0);

    withSuspense(suspended, () => {
      createRoot(() => {
        createEffect(effect1);
      });

      createEffect(effect2);
    });

    tick();

    assertSpyCalls(effect1, 0);
    assertSpyCalls(effect2, 0);

    dependency.set(1);
    tick();

    assertSpyCalls(effect1, 0);
    assertSpyCalls(effect2, 0);
  });

  it("should run effects if unsuspended", () => {
    const effect = spy(() => {
      dependency();
    });

    const suspended = createSignal(false);
    const dependency = createSignal(0);

    withSuspense(suspended, () => {
      createEffect(effect);
    });

    tick();

    assertSpyCalls(effect, 1);

    dependency.set(1);
    tick();

    assertSpyCalls(effect, 2);

    suspended.set(true);
    dependency.set(2);
    tick();

    assertSpyCalls(effect, 2);
  });

  it("should run effects if they are dirty because a signal changed while they were suspended", () => {
    const effect = spy(() => {
      dependency();
    });

    const suspended = createSignal(false);
    const dependency = createSignal(0);

    withSuspense(suspended, () => {
      createEffect(effect);
    });

    tick();

    assertSpyCalls(effect, 1);

    suspended.set(true);
    tick();

    assertSpyCalls(effect, 1);

    suspended.set(false);
    tick();

    assertSpyCalls(effect, 1);

    suspended.set(true);

    dependency.set(1);
    suspended.set(false);
    tick();

    assertSpyCalls(effect, 2);
  });

  it("should suspend children suspenses", () => {
    const effect1 = spy(),
      effect2 = spy();

    const suspended1 = createSignal(true);
    const suspended2 = createSignal(true);

    withSuspense(suspended1, () => {
      createEffect(effect1);

      withSuspense(suspended2, () => {
        createEffect(effect2);
      });
    });

    tick();

    assertSpyCalls(effect1, 0);
    assertSpyCalls(effect2, 0);

    suspended2.set(false);
    tick();

    assertSpyCalls(effect1, 0);
    assertSpyCalls(effect2, 0);

    suspended1.set(false);
    tick();

    assertSpyCalls(effect1, 1);
    assertSpyCalls(effect2, 1);
  });

  it("should stop a sync effect", () => {
    const effect = spy();

    const suspended = createSignal(true);

    withSuspense(suspended, () => {
      createEffect(effect, undefined, {
        sync: true,
      });
    });

    assertSpyCalls(effect, 0);
  });

  it("should immediately update a sync effect", () => {
    const effect = spy(() => {
      dependency();
    });

    const suspended = createSignal(true);
    const dependency = createSignal(0);

    withSuspense(suspended, () => {
      createEffect(effect, undefined, {
        sync: true,
      });
    });

    assertSpyCalls(effect, 0);

    suspended.set(false);
    assertSpyCalls(effect, 1);

    suspended.set(true);
    dependency.set(1);
    suspended.set(false);
    assertSpyCalls(effect, 2);
  });
});
