/* IMPORT */

import {
  createEffect,
  createMemo,
  createRoot,
  createSelector,
  createSignal,
} from "#/dist/mod.js";

/* MAIN */

const selected = createSignal();
const isSelected = createSelector(selected);
const isSelectedDisposed = createSelector(createMemo(() => {}));

Deno.bench("cleanup", () => {
  createRoot((dispose) => {
    console.time("create");

    const isSelected2 = createSelector(selected);
    const isSelectedDisposed2 = createSelector(createMemo(() => {}));

    const global = createSignal();

    const memoVoid = createMemo(() => {});

    const items = [];

    for (let i = 0, l = 1000000; i < l; i++) {
      items.push(createSignal());
    }

    const disposers = [];

    for (let i = 0, l = 1000000; i < l; i++) {
      createRoot((dispose) => {
        global();

        disposers.push(dispose);

        const memo = createMemo(() => {
          global();
          items[i]();
          isSelected(i);
          isSelected2(i);
          isSelectedDisposed(i);
          isSelectedDisposed2(i);
        });

        createEffect(
          () => {
            global();
            items[i]();
            memo();
            memoVoid();
          },
          { sync: true },
        );

        createEffect(
          () => {
            global();
            items[i]();
            memo();
            memoVoid();
          },
          { sync: true },
        );
      });
    }

    console.timeEnd("create");

    console.time("cleanup");

    dispose();

    disposers.forEach((dispose) => dispose());

    console.timeEnd("cleanup");
  });

  // debugger;
});
