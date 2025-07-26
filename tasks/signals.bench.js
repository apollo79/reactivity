import { createEffect, createSignal } from "#/dist/keep-sources/mod.js";

const signalArray = [];

for (let i = 0; i < 10_000; i++) {
  signalArray.push(createSignal(i));
}

Deno.bench("reading 10", () => {
  createEffect(
    () => {
      for (let i = 0; i < 10; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );
});

Deno.bench("reading 100", ({ end }) => {
  const dispose = createEffect(
    () => {
      for (let i = 0; i < 100; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );
  end();
  dispose();
});
Deno.bench("reading 1000", ({ end }) => {
  const dispose = createEffect(
    () => {
      for (let i = 0; i < 1000; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );
  end();
  dispose();
});

Deno.bench("reading 10000", ({ end }) => {
  const dispose = createEffect(
    () => {
      for (let i = 0; i < 10000; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );
  end();
  dispose();
});

Deno.bench("updating 1 of 10", () => {
  createEffect(
    () => {
      for (let i = 0; i < 10; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );

  signalArray[10].set(Math.random());
});

Deno.bench("updating 1 of 100", ({ end }) => {
  const dispose = createEffect(
    () => {
      for (let i = 0; i < 100; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );

  signalArray[10].set(Math.random());

  end();
  dispose();
});
Deno.bench("updating 1 of 1000", ({ end }) => {
  const dispose = createEffect(
    () => {
      for (let i = 0; i < 1000; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );

  signalArray[10].set(Math.random());

  end();
  dispose();
});

Deno.bench("updating 1 of 10000", ({ end }) => {
  const dispose = createEffect(
    () => {
      for (let i = 0; i < 10000; i++) {
        signalArray[i]();
      }
    },
    undefined,
    {
      sync: true,
    },
  );

  signalArray[10].set(Math.random());

  end();
  dispose();
});
