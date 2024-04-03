/* IMPORT */

import { createMemo, createSignal } from "#/dist/mod.js";

/* MAIN */

console.time("create");

const a = createSignal(0);
const b = createSignal(0);
const m = new Array(100_000);

for (let i = 0, l = 100_000; i < l; i++) {
  m[i] = createMemo(() => {
    a();
    // b ();
  });
}

console.timeEnd("create");

console.time("updates");

for (let i = 1, l = 100; i < l; i++) {
  a(i);
}

console.timeEnd("updates");

console.time("pulls");

for (let i = 0, l = 100_000; i < l; i++) {
  m[i]();
}

console.timeEnd("pulls");

console.log(process.memoryUsage().heapUsed);

debugger;
