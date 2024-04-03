/* IMPORT */

import { createRoot, createEffect, createSignal } from "#/dist/mod.js";
import process from "node:process";

/* MAIN */

const observables = [];

console.time("create");

createRoot(() => {
  for (let i = 0, l = 50000; i < l; i++) {
    createEffect(
      () => {
        // Effect, should be more memory efficient as it returns nothing
        // $.memo ( () => { // Memo, should be less memory efficient as it returns an observable
        const observable = createSignal(Math.random());
        observables.push(observable);
        observable();
      },
      { sync: true }
    );
  }
});

console.timeEnd("create");

globalThis.observables = observables;

console.log(process.memoryUsage().heapUsed);

// debugger;
