/* IMPORT */

import { createEffect, createMemo, createSignal, tick } from "#/dist/mod.js";

/* MAIN */

const avoidablePropagation = () => {
  const head = createSignal(0);
  const memo1 = createMemo(() => head());
  const memo2 = createMemo(() => Math.min(0, memo1()));
  const memo3 = createMemo(() => memo2() + 1);
  const memo4 = createMemo(() => memo3() + 2);
  const memo5 = createMemo(() => memo4() + 3);

  createEffect(memo5);

  head(1);
  tick();

  console.assert(memo5() === 6);
  for (let i = 0; i < 1_000; i++) {
    head(i);
    tick();
    console.assert(memo5() === 6);
  }
};

const createComputations1to1 = () => {
  const o = createSignal(0);
  createMemo(() => o());
};

/* RUNNING */

Deno.bench("avoidable propagation", () => {
  for (let i = 0; i < 100; i++) {
    avoidablePropagation();
  }
});

Deno.bench("create computations 1 to 1", () => {
  for (let i = 0; i < 1000; i++) {
    createComputations1to1();
  }
});
