/* IMPORT */

import { createEffect, createMemo, createSignal, untrack } from "#/dist/mod.js";

/* MAIN */

// const o = createSignal(0);
// const ro = createMemo(o);
// const fo = createMemo(() => 0);
// const fn = () => o();

// Deno.bench("o", { group: "regular" }, () => {
//   for (let i = 0, l = 2_000_000; i < l; i++) {
//     o();
//   }
// });

// Deno.bench("ro", { group: "regular" }, () => {
//   for (let i = 0, l = 2_000_000; i < l; i++) {
//     ro();
//   }
// });

// Deno.bench("fo", { group: "regular" }, () => {
//   for (let i = 0, l = 2_000_000; i < l; i++) {
//     fo();
//   }
// });

// Deno.bench("fn", { group: "regular" }, () => {
//   for (let i = 0, l = 2_000_000; i < l; i++) {
//     fn();
//   }
// });

// Deno.bench("o", { group: "untrack" }, () => {
//   createEffect(
//     () => {
//       for (let i = 0, l = 100_000; i < l; i++) {
//         untrack(o);
//       }
//     }
//     { sync: true }
//   );
// });

// Deno.bench("ro", { group: "untrack" }, () => {
//   createEffect(
//     () => {
//       for (let i = 0, l = 100_000; i < l; i++) {
//         untrack(ro);
//       }
//     },
//     { sync: true }
//   );
// });

// Deno.bench("fo", { group: "untrack" }, () => {
//   createEffect(
//     () => {
//       for (let i = 0, l = 100_000; i < l; i++) {
//         untrack(fo);
//       }
//     },
//     { sync: true }
//   );
// });

// Deno.bench("fn", { group: "untrack" }, () => {
//   createEffect(
//     () => {
//       for (let i = 0, l = 100_000; i < l; i++) {
//         untrack(fn);
//       }
//     },
//     { sync: true }
//   );
// });

// Deno.bench("o", { group: "untracked" }, () => {
//   untrack(() => {
//     for (let i = 0, l = 2_000_000; i < l; i++) {
//       untrack(o);
//     }
//   });
// });

// Deno.bench("ro", { group: "untracked" }, () => {
//   untrack(() => {
//     for (let i = 0, l = 2_000_000; i < l; i++) {
//       untrack(ro);
//     }
//   });
// });

// Deno.bench("fo", { group: "untracked" }, () => {
//   untrack(() => {
//     for (let i = 0, l = 2_000_000; i < l; i++) {
//       untrack(fo);
//     }
//   });
// });

// Deno.bench("fn", { group: "untracked" }, () => {
//   untrack(() => {
//     for (let i = 0, l = 2_000_000; i < l; i++) {
//       untrack(fn);
//     }
//   });
// });

/* IMPORT */

import benchmark from "npm:benchloop";

/* MAIN */

const o = createSignal(0);
const ro = createMemo(o);
const fo = createMemo(() => 0);
const fn = () => o();

benchmark.config({
  iterations: 1,
});

benchmark.group("regular", () => {
  benchmark({
    name: "o",
    fn: () => {
      for (let i = 0, l = 2_000_000; i < l; i++) {
        o();
      }
    },
  });

  benchmark({
    name: "ro",
    fn: () => {
      for (let i = 0, l = 2_000_000; i < l; i++) {
        ro();
      }
    },
  });

  benchmark({
    name: "fo",
    fn: () => {
      for (let i = 0, l = 2_000_000; i < l; i++) {
        fo();
      }
    },
  });

  benchmark({
    name: "fn",
    fn: () => {
      for (let i = 0, l = 2_000_000; i < l; i++) {
        fn();
      }
    },
  });
});

benchmark.group("untrack", () => {
  benchmark({
    name: "o",
    fn: () => {
      createEffect(
        () => {
          for (let i = 0, l = 2_000_000; i < l; i++) {
            untrack(o);
          }
        },
        { sync: true },
      );
    },
  });

  benchmark({
    name: "ro",
    fn: () => {
      createEffect(
        () => {
          for (let i = 0, l = 2_000_000; i < l; i++) {
            untrack(ro);
          }
        },
        { sync: true },
      );
    },
  });

  benchmark({
    name: "fo",
    fn: () => {
      createEffect(
        () => {
          for (let i = 0, l = 2_000_000; i < l; i++) {
            untrack(fo);
          }
        },
        { sync: true },
      );
    },
  });

  benchmark({
    name: "fn",
    fn: () => {
      createEffect(
        () => {
          for (let i = 0, l = 2_000_000; i < l; i++) {
            untrack(fn);
          }
        },
        { sync: true },
      );
    },
  });
});

benchmark.group("untracked", () => {
  benchmark({
    name: "o",
    fn: () => {
      untrack(() => {
        for (let i = 0, l = 2_000_000; i < l; i++) {
          untrack(o);
        }
      });
    },
  });

  benchmark({
    name: "ro",
    fn: () => {
      untrack(() => {
        for (let i = 0, l = 2_000_000; i < l; i++) {
          untrack(ro);
        }
      });
    },
  });

  benchmark({
    name: "fo",
    fn: () => {
      untrack(() => {
        for (let i = 0, l = 2_000_000; i < l; i++) {
          untrack(fo);
        }
      });
    },
  });

  benchmark({
    name: "fn",
    fn: () => {
      untrack(() => {
        for (let i = 0, l = 2_000_000; i < l; i++) {
          untrack(fn);
        }
      });
    },
  });
});

benchmark.summary();
