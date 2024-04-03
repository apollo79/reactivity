/* IMPORT */

import { assertEquals } from "~/test/util.ts";
import { createSignal, createRoot, createMemo } from "#/dist/mod.js";

/* MAIN */

// The following is an implementation of the cellx benchmark https://codesandbox.io/s/cellx-bench-forked-s6kusj

const cellx = (layers) => {
  return new Promise((resolve) => {
    createRoot(() => {
      const start = {
        prop1: createSignal(1),
        prop2: createSignal(2),
        prop3: createSignal(3),
        prop4: createSignal(4),
      };

      let layer = start;

      for (let i = layers; i > 0; i--) {
        layer = ((m) => {
          const s = {
            prop1: createMemo(() => {
              return m.prop2();
            }),
            prop2: createMemo(() => {
              return m.prop1() - m.prop3();
            }),
            prop3: createMemo(() => {
              return m.prop2() + m.prop4();
            }),
            prop4: createMemo(() => {
              return m.prop3();
            }),
          };

          // $.effect ( s.prop1, { sync: true } );
          // $.effect ( s.prop2, { sync: true } );
          // $.effect ( s.prop3, { sync: true } );
          // $.effect ( s.prop4, { sync: true } );

          // $.effect ( s.prop1 );
          // $.effect ( s.prop2 );
          // $.effect ( s.prop3 );
          // $.effect ( s.prop4 );

          // $.memo ( s.prop1 );
          // $.memo ( s.prop2 );
          // $.memo ( s.prop3 );
          // $.memo ( s.prop4 );

          s.prop1();
          s.prop2();
          s.prop3();
          s.prop4();

          return s;
        })(layer);
      }

      const end = layer;

      const startTime = performance.now();

      const before = [end.prop1(), end.prop2(), end.prop3(), end.prop4()];

      start.prop1.set(4);
      start.prop2.set(3);
      start.prop3.set(2);
      start.prop4.set(1);

      const after = [end.prop1(), end.prop2(), end.prop3(), end.prop4()];

      const endTime = performance.now();
      const elapsedTime = endTime - startTime;

      resolve([elapsedTime, before, after]);
    });
  });
};

const benchmark = async () => {
  let total = 0;

  const expected = {
    10: [
      [3, 6, 2, -2],
      [2, 4, -2, -3],
    ],
    20: [
      [2, 4, -1, -6],
      [-2, 1, -4, -4],
    ],
    30: [
      [-1, -2, -3, -4],
      [-4, -3, -2, -1],
    ],
    50: [
      [-2, -4, 1, 6],
      [2, -1, 4, 4],
    ],
    100: [
      [-3, -6, -2, 2],
      [-2, -4, 2, 3],
    ],
    1000: [
      [-3, -6, -2, 2],
      [-2, -4, 2, 3],
    ],
    // 2500: [[-3, -6, -2, 2], [-2, -4, 2, 3]],
    // 5000: [[2, 4, -1, -6], [-2, 1, -4, -4]]
  };

  const results = {};

  const runs = new Array(100).fill(0).map((_, index) => index);

  for (const layers in expected) {
    console.log("----");

    for (const run of runs) {
      const [elapsed, before, after] = await cellx(Number(layers));

      results[layers] = [before, after];

      console.log(`Layers ${layers}: ${elapsed}`);

      total += elapsed;
    }
  }

  console.log("----");
  console.log(`Total: ${total}`);

  assertEquals(results, expected);
  //   assert.deepEqual(results, expected);
};

Deno.bench("cellx", benchmark);
