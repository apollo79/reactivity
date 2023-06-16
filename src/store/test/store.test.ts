import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  on,
} from "#/mod.ts";
import {
  assert,
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
  describe,
  fail,
  it,
} from "~/test/util.ts";
import {
  createStore,
  unwrap,
  //  unwrap, $RAW,
} from "../mod.ts";
import { tick } from "../../methods/tick.ts";
import { $RAW } from "../store.ts";

describe("State immutablity", () => {
  it("Setting a property", () => {
    const [state] = createStore({ name: "John" });
    assertStrictEquals(state.name, "John");
    state.name = "Jake";
    assertStrictEquals(state.name, "John");
  });

  it("Deleting a property", () => {
    const [state] = createStore({ name: "John" });
    assertStrictEquals(state.name, "John");
    // @ts-expect-error can't delete required property
    delete state.name;
    assertStrictEquals(state.name, "John");
  });

  it("Immutable state is not mutable even inside setter", () => {
    const [state, setState] = createStore({ name: "John" });
    assertStrictEquals(state.name, "John");
    setState(() => {
      state.name = "Jake";
    });
    assertStrictEquals(state.name, "John");
  });
});

describe("State Getters", () => {
  it("Testing an update from state", () => {
    // deno-lint-ignore ban-types
    let state: any, setState: Function;
    createRoot(() => {
      [state, setState] = createStore({
        name: "John",
        get greeting(): string {
          return `Hi, ${this.name}`;
        },
      });
    });
    assertStrictEquals(state!.greeting, "Hi, John");
    setState!({ name: "Jake" });
    assertStrictEquals(state!.greeting, "Hi, Jake");
  });

  it("Testing an update from state", () => {
    // deno-lint-ignore ban-types
    let state: any, setState: Function;
    createRoot(() => {
      // deno-lint-ignore prefer-const
      let greeting: () => string;

      [state, setState] = createStore({
        name: "John",
        get greeting(): string {
          return greeting();
        },
      });

      greeting = createMemo(() => `Hi, ${state.name}`);
    });

    assertStrictEquals(state!.greeting, "Hi, John");

    setState!({ name: "Jake" });
    assertStrictEquals(state!.greeting, "Hi, Jake");
  });
});

describe("Simple setState modes", () => {
  it("Simple Key Value", () => {
    const [state, setState] = createStore({ key: "" });
    setState("key", "value");
    assertStrictEquals(state.key, "value");
  });

  it("Top level merge", () => {
    const [state, setState] = createStore({ starting: 1, ending: 1 });
    setState({ ending: 2 });
    assertStrictEquals(state.starting, 1);
    assertStrictEquals(state.ending, 2);
  });

  it("Top level merge no arguments", () => {
    const [state, setState] = createStore({ starting: 1 });
    setState({});
    assertStrictEquals(state.starting, 1);
  });

  it("Top level state function merge", () => {
    const [state, setState] = createStore({ starting: 1, ending: 1 });
    setState((s, t) => {
      assertEquals(t, []);
      return { ending: s.starting + 1 };
    });
    assertStrictEquals(state.starting, 1);
    assertStrictEquals(state.ending, 2);
  });

  it("Nested merge", () => {
    const [state, setState] = createStore({ data: { starting: 1, ending: 1 } });
    setState("data", { ending: 2 });
    assertStrictEquals(state.data.starting, 1);
    assertStrictEquals(state.data.ending, 2);
  });

  it("Nested state function merge", () => {
    const [state, setState] = createStore({ data: { starting: 1, ending: 1 } });
    setState("data", (d, t) => {
      assertEquals(t, ["data"]);
      return { ending: d.starting + 1 };
    });
    assertStrictEquals(state.data.starting, 1);
    assertStrictEquals(state.data.ending, 2);
  });

  it("Test Array", () => {
    const [todos, setTodos] = createStore([
      { id: 1, title: "Go To Work", done: true },
      { id: 2, title: "Eat Lunch", done: false },
    ]);
    setTodos(1, { done: true });
    setTodos([...todos, { id: 3, title: "Go Home", done: false }]);
    setTodos((t) => [...t.slice(1)]);
    assertStrictEquals(Array.isArray(todos), true);
    assertStrictEquals(todos[0].done, true);
    assertStrictEquals(todos[1].title, "Go Home");
  });

  it("Test Array Nested", () => {
    const [state, setState] = createStore({
      todos: [
        { id: 1, title: "Go To Work", done: true },
        { id: 2, title: "Eat Lunch", done: false },
      ],
    });
    setState("todos", 1, { done: true });
    setState("todos", [...state.todos, {
      id: 3,
      title: "Go Home",
      done: false,
    }]);
    assertStrictEquals(Array.isArray(state.todos), true);
    assertStrictEquals(state.todos[1].done, true);
    assertStrictEquals(state.todos[2].title, "Go Home");
  });
});

describe("Array setState modes", () => {
  it("Update Specific", () => {
    const [state, setState] = createStore([1, 2, 3, 4, 5]);
    setState([1, 3], (r, t) => {
      assertStrictEquals(typeof t[0], "number");

      return r * 2;
    });

    assertStrictEquals(state[0], 1);
    assertStrictEquals(state[1], 4);
    assertStrictEquals(state[2], 3);
    assertStrictEquals(state[3], 8);
    assertStrictEquals(state[4], 5);

    assertEquals(Object.keys(state), ["0", "1", "2", "3", "4"]);
  });

  it("Update Specific Object", () => {
    const [state, setState] = createStore([1, 2, 3, 4, 5]);
    setState({
      1: 4,
      3: 8,
    });

    assertStrictEquals(state[0], 1);
    assertStrictEquals(state[1], 4);
    assertStrictEquals(state[2], 3);
    assertStrictEquals(state[3], 8);
    assertStrictEquals(state[4], 5);

    assertEquals(Object.keys(state), ["0", "1", "2", "3", "4"]);
  });

  it("Update filterFn", () => {
    const [state, setState] = createStore([1, 2, 3, 4, 5]);
    setState(
      (_r, i) => Boolean(i % 2),
      (r, t) => {
        assertStrictEquals(typeof t[0], "number");

        return r * 2;
      },
    );

    assertStrictEquals(state[0], 1);
    assertStrictEquals(state[1], 4);
    assertStrictEquals(state[2], 3);
    assertStrictEquals(state[3], 8);
    assertStrictEquals(state[4], 5);
  });

  it("Update traversal range", () => {
    const [state, setState] = createStore([1, 2, 3, 4, 5]);
    setState({ from: 1, to: 4, step: 2 }, (r, t) => {
      assertStrictEquals(typeof t[0], "number");

      return r * 2;
    });

    assertStrictEquals(state[0], 1);
    assertStrictEquals(state[1], 4);
    assertStrictEquals(state[2], 3);
    assertStrictEquals(state[3], 8);
    assertStrictEquals(state[4], 5);
  });

  it("Update traversal range defaults", () => {
    const [state, setState] = createStore([1, 2, 3, 4, 5]);
    setState({}, (r, t) => {
      assertStrictEquals(typeof t[0], "number");

      return r * 2;
    });
    assertStrictEquals(state[0], 2);
    assertStrictEquals(state[1], 4);
    assertStrictEquals(state[2], 6);
    assertStrictEquals(state[3], 8);
    assertStrictEquals(state[4], 10);
  });
});

describe("Unwrapping Edge Cases", () => {
  it("Unwrap nested frozen state object", () => {
    const [state] = createStore({
      data: Object.freeze({ user: { firstName: "John", lastName: "Snow" } }),
    });

    const unwrapped = unwrap({ ...state });

    assertStrictEquals(unwrapped.data.user.firstName, "John");
    assertStrictEquals(unwrapped.data.user.lastName, "Snow");

    assert(!($RAW in unwrapped.data.user));
  });

  it("Unwrap nested frozen array", () => {
    const [state] = createStore({
      data: [{ user: { firstName: "John", lastName: "Snow" } }],
    });

    const unwrapped = unwrap({ data: state.data.slice(0) });
    assertStrictEquals(unwrapped.data[0].user.firstName, "John");
    assertStrictEquals(unwrapped.data[0].user.lastName, "Snow");

    assert(!($RAW in unwrapped.data[0].user));
  });

  it("Unwrap nested frozen state array", () => {
    const [state] = createStore({
      data: Object.freeze([{ user: { firstName: "John", lastName: "Snow" } }]),
    });

    const unwrapped = unwrap({ ...state });

    assertStrictEquals(unwrapped.data[0].user.firstName, "John");
    assertStrictEquals(unwrapped.data[0].user.lastName, "Snow");

    assert(!($RAW in unwrapped.data[0].user));
  });
});

describe("Tracking State changes", () => {
  it("Track a state change", () => {
    const [state, setState] = createStore({ data: 2 });
    createRoot(() => {
      let executionCount = 0;

      createEffect(() => {
        if (executionCount === 0) {
          assertStrictEquals(state.data, 2);
        } else if (executionCount === 1) {
          assertStrictEquals(state.data, 5);
        } else {
          fail("should never get here");
        }

        executionCount++;
      });
    });

    tick();

    setState({ data: 5 });

    // same value again should not retrigger
    setState({ data: 5 });
  });

  it("Track a nested state change", () => {
    const [state, setState] = createStore({
      user: { firstName: "John", lastName: "Smith" },
    });

    createRoot(() => {
      let executionCount = 0;

      createEffect(() => {
        if (executionCount === 0) {
          assertStrictEquals(state.user.firstName, "John");
        } else if (executionCount === 1) {
          assertStrictEquals(state.user.firstName, "Jake");
        } else {
          fail("should never get here");
        }

        executionCount++;
      });
    });

    tick();

    setState("user", "firstName", "Jake");
  });

  // it("Tracking Top-Level Array iteration", () => {
  //   const [state, setState] = createStore(["hi"]);
  //   let executionCount = 0;
  //   let executionCount2 = 0;
  //   let executionCount3 = 0;

  //   createRoot(() => {
  //     createEffect(() => {
  //       for (let i = 0; i < state.length; i++) {
  //         state[i];
  //       }
  //       untrack(() => {
  //         if (executionCount === 0) {
  //           assertStrictEquals(state.length, 1);
  //         }
  //         else if (executionCount === 1) {
  //           assertStrictEquals(state.length, 2);
  //           assertStrictEquals(state[1], "item");
  //         } else if (executionCount === 2) {
  //           assertStrictEquals(state.length, 2);
  //           assertStrictEquals(state[1], "new");
  //         } else if (executionCount === 3) {
  //           assertStrictEquals(state.length, 1);
  //         } else {
  //           fail("should never get here");
  //         }
  //       });

  //       executionCount++;
  //     });

  //     createEffect(() => {
  //       for (const _item of state);

  //       untrack(() => {
  //         if (executionCount2 === 0) {
  //           assertStrictEquals(state.length, 1);
  //         }
  //         else if (executionCount2 === 1) {
  //           assertStrictEquals(state.length, 2);
  //           assertStrictEquals(state[1], "item");
  //         } else if (executionCount2 === 2) {
  //           assertStrictEquals(state.length, 2);
  //           assertStrictEquals(state[1], "new");
  //         } else if (executionCount2 === 3) {
  //           assertStrictEquals(state.length, 1);
  //         } else {
  //           fail("should never get here");
  //         }
  //       });
  //       executionCount2++;
  //     });

  //     const mapped = mapArray(
  //       () => state,
  //       (item) => item,
  //     );

  //     createEffect(() => {
  //       mapped();
  //       untrack(() => {
  //         if (executionCount3 === 0) {
  //           assertStrictEquals(state.length, 1);
  //         }
  //         else if (executionCount3 === 1) {
  //           assertStrictEquals(state.length, 2);
  //           assertStrictEquals(state[1], "item");
  //         } else if (executionCount3 === 2) {
  //           assertStrictEquals(state.length, 2);
  //           assertStrictEquals(state[1], "new");
  //         } else if (executionCount3 === 3) {
  //           assertStrictEquals(state.length, 1);
  //         } else {
  //           fail("should never get here");
  //         }
  //       });

  //       executionCount3++;
  //     });
  //   });
  //   // add
  //   setState(1, "item");

  //   // update
  //   setState(1, "new");

  //   // delete
  //   setState((s) => [s[0]]);
  // });

  it("Tracking iteration Object key addition/removal", () => {
    const [state, setState] = createStore<{ obj: { item?: number } }>({
      obj: {},
    });

    let executionCount = 0;

    let executionCount2 = 0;

    createRoot(() => {
      createEffect(() => {
        const keys = Object.keys(state.obj);

        if (executionCount === 0) {
          assertStrictEquals(keys.length, 0);
        } else if (executionCount === 1) {
          assertStrictEquals(keys.length, 1);
          assertStrictEquals(keys[0], "item");
        } else if (executionCount === 2) {
          assertStrictEquals(keys.length, 0);
        } else {
          fail("should never get here");
        }

        executionCount++;
      });

      createEffect(() => {
        for (const key in state.obj) {
          key;
        }

        const u = unwrap(state.obj);

        if (executionCount2 === 0) {
          assertStrictEquals(u.item, undefined);
        } else if (executionCount2 === 1) {
          assertStrictEquals(u.item, 5);
        } else if (executionCount2 === 2) {
          assertStrictEquals(u.item, undefined);
        } else {
          fail("should never get here");
        }

        executionCount2++;
      });
    });

    tick();

    // add
    setState("obj", "item", 5);
    tick();
    // update
    // setState("obj", "item", 10);

    // delete
    setState("obj", "item", undefined);
  });

  it("Doesn't trigger object on addition/removal", () => {
    const [state, setState] = createStore<{ obj: { item?: number } }>({
      obj: {},
    });

    let executionCount = 0;

    createRoot(() => {
      createEffect(
        on(
          () => state.obj,
          (v) => {
            if (executionCount === 0) {
              assertStrictEquals(v.item, undefined);
            } else if (executionCount === 1) {
              assertStrictEquals(v.item, 5);
            } else {
              fail("should never get here");
            }

            executionCount++;
          },
        ),
      );
    });

    tick();

    // add
    setState("obj", "item", 5);
    tick();

    // delete
    setState("obj", "item", undefined);
  });

  it("Tracking Top level iteration Object key addition/removal", () => {
    const [state, setState] = createStore<{ item?: number }>({});

    let executionCount = 0;
    let executionCount2 = 0;

    createRoot(() => {
      createEffect(() => {
        const keys = Object.keys(state);

        if (executionCount === 0) {
          assertStrictEquals(keys.length, 0);
        } else if (executionCount === 1) {
          assertStrictEquals(keys.length, 1);
          assertStrictEquals(keys[0], "item");
        } else if (executionCount === 2) {
          assertStrictEquals(keys.length, 0);
        } else {
          fail("should never get here");
        }

        executionCount++;
      });

      createEffect(() => {
        for (const key in state) {
          key;
        }

        const u = unwrap(state);

        if (executionCount2 === 0) {
          assertStrictEquals(u.item, undefined);
        } else if (executionCount2 === 1) {
          assertStrictEquals(u.item, 5);
        } else if (executionCount2 === 2) {
          assertStrictEquals(u.item, undefined);
        } else {
          fail("should never get here");
        }

        executionCount2++;
      });
    });

    tick();

    // add
    setState("item", 5);
    tick();

    // delete
    setState("item", undefined);
  });

  it("Not Tracking Top level key addition/removal", () => {
    const [state, setState] = createStore<{ item?: number; item2?: number }>(
      {},
    );

    let executionCount = 0;

    createRoot(() => {
      createEffect(() => {
        if (executionCount === 0) {
          assertStrictEquals(state.item2, undefined);
        } else {
          fail("should never get here");
        }

        executionCount++;
      });
    });

    // add
    setState("item", 5);

    // delete
    setState("item", undefined);
  });
});

describe("Handling functions in state", () => {
  it("Array Native Methods: Array.Filter", () => {
    createRoot(() => {
      const [state] = createStore({ list: [0, 1, 2] }),
        getFiltered = createMemo(() => state.list.filter((i) => i % 2));

      assertEquals(getFiltered(), [1]);
    });
  });

  it("Track function change", () => {
    createRoot(() => {
      const [state, setState] = createStore<{ fn: () => number }>({
          fn: () => 1,
        }),
        getValue = createMemo(() => state.fn());

      setState({ fn: () => 2 });

      assertStrictEquals(getValue(), 2);
    });
  });
});

describe("Setting state from Effects", () => {
  it("Setting state from signal", () => {
    const data = createSignal("init"),
      [state, setState] = createStore({ data: "" });

    createRoot(() => {
      createEffect(() => setState("data", data()));
    });
    tick();

    data.set("signal");
    tick();
    assertStrictEquals(state.data, "signal");
  });

  it("Select Promise", () =>
    new Promise((resolve) => {
      createRoot(async () => {
        const p = new Promise<string>((resolve) => {
          setTimeout(resolve, 20, "promised");
        });

        const [state, setState] = createStore({ data: "" });

        p.then((v) => setState("data", v));
        await p;

        assertStrictEquals(state.data, "promised");

        resolve();
      });
    }));
});

// describe("Batching", () => {
//   it("Respects batch", () => {
//     let data = 1;
//     const [state, setState] = createStore({ data: 1 });
//     const memo = createRoot(() => createMemo(() => (data = state.data)));

//     batch(() => {
//       assertStrictEquals(state.data, 1);
//       assertStrictEquals(memo(), 1);
//       assertStrictEquals(data, 1);
//       setState("data", 2);
//       assertStrictEquals(state.data, 2);
//       assertStrictEquals(data, 1);
//       assertStrictEquals(memo(), 2);
//       assertStrictEquals(data, 2);
//     });

//     expect(state.data).toBe(2);
//     expect(memo!()).toBe(2);
//     expect(data).toBe(2);
//   });

//   it("Respects batch in array", () => {
//     let data = 1;
//     const [state, setState] = createStore([1]);
//     const memo = createRoot(() => createMemo(() => (data = state[0])));
//     batch(() => {
//       expect(state[0]).toBe(1);
//       expect(memo()).toBe(1);
//       expect(data).toBe(1);
//       setState(0, 2);
//       expect(state[0]).toBe(2);
//       expect(data).toBe(1);
//       expect(memo()).toBe(2);
//       expect(data).toBe(2);
//     });
//     expect(state[0]).toBe(2);
//     expect(memo()).toBe(2);
//     expect(data).toBe(2);
//   });

//   it("Respects batch in array mutate", () => {
//     let data = 1;
//     const [state, setState] = createStore([1]);
//     const memo = createRoot(() => createMemo(() => (data = state.length)));
//     batch(() => {
//       expect(state.length).toBe(1);
//       expect(memo()).toBe(1);
//       expect(data).toBe(1);
//       setState([...state, 2]);
//       expect(state.length).toBe(2);
//       expect(data).toBe(1);
//       expect(memo()).toBe(2);
//       expect(data).toBe(2);
//     });
//     expect(state.length).toBe(2);
//     expect(memo()).toBe(2);
//     expect(data).toBe(2);
//   });
// });

describe("State wrapping", () => {
  it("Setting plain object", () => {
    const data = { withProperty: "y" },
      [state] = createStore({ data });
    // not wrapped
    assertNotStrictEquals(state.data, data);
  });

  it("Setting plain array", () => {
    const data = [1, 2, 3],
      [state] = createStore({ data });
    // not wrapped
    assertNotStrictEquals(state.data, data);
  });

  it("Setting non-wrappable", () => {
    const date = new Date(),
      [state] = createStore({ time: date });
    // not wrapped
    assertStrictEquals(state.time, date);
  });
});

describe("Array length", () => {
  it("Setting plain object", () => {
    const [state, setState] = createStore<{ list: number[] }>({ list: [] });
    let length;
    // isolate length tracking
    const list = state.list;

    createRoot(() => {
      createEffect(() => {
        length = list.length;
      });
    });

    tick();
    assertStrictEquals(length, 0);

    // insert at index 0
    setState("list", 0, 1);
    tick();
    assertStrictEquals(length, 1);
  });
});

describe("State recursion", () => {
  it("there is no infinite loop", () => {
    const x: { a: number; b: any } = { a: 1, b: undefined };
    x.b = x;

    const [state] = createStore(x);
    assertEquals(state.a, state.b.a);
  });
});

describe("Nested Classes", () => {
  it("wrapped nested class", () => {
    class CustomThing {
      a: number;
      b: number;
      constructor(value: number) {
        this.a = value;
        this.b = 10;
      }
    }

    const [inner] = createStore(new CustomThing(1));
    const [store, setStore] = createStore({ inner });

    assertStrictEquals(store.inner.a, 1);
    assertStrictEquals(store.inner.b, 10);

    let sum;
    createRoot(() => {
      createEffect(() => {
        sum = store.inner.a + store.inner.b;
      });
    });

    tick();
    assertStrictEquals(sum, 11);

    setStore("inner", "a", 10);
    tick();
    assertStrictEquals(sum, 20);

    setStore("inner", "b", 5);
    tick();
    assertStrictEquals(sum, 15);
  });

  it("not wrapped nested class", () => {
    class CustomThing {
      a: number;
      b: number;
      constructor(value: number) {
        this.a = value;
        this.b = 10;
      }
    }

    const [store, setStore] = createStore({ inner: new CustomThing(1) });

    assertStrictEquals(store.inner.a, 1);
    assertStrictEquals(store.inner.b, 10);

    let sum;
    createRoot(() => {
      createEffect(() => {
        sum = store.inner.a + store.inner.b;
      });
    });

    tick();
    assertStrictEquals(sum, 11);

    setStore("inner", "a", 10);
    tick();
    assertStrictEquals(sum, 11);

    setStore("inner", "b", 5);
    tick();
    assertStrictEquals(sum, 11);
  });
});

// type tests

// NotWrappable keys are ignored
//   () => {
//     const [, setStore] = createStore<{
//       a?:
//         | undefined
//         | {
//             b: null | { c: number | { d: bigint | { e: Function | { f: symbol | { g: string } } } } };
//           };
//     }>({});
//     setStore("a", "b", "c", "d", "e", "f", "g", "h");
//   };

//   // Cannot update readonly keys
//   () => {
//     const [, setK1] = createStore({} as { readonly i: number });
//     // @ts-expect-error i is readonly
//     setK1("i", 2);
//     const [, setK2] = createStore({} as { i: { readonly j: number } });
//     // @ts-expect-error j is readonly
//     setK2("i", "j", 3);
//     const [, setK3] = createStore({} as { i: { j: { readonly k: number } } });
//     // @ts-expect-error k is readonly
//     setK3("i", "j", "k", 4);
//     const [, setK4] = createStore({} as { i: { j: { k: { readonly l: number } } } });
//     // @ts-expect-error l is readonly
//     setK4("i", "j", "k", "l", 5);
//     const [, setK5] = createStore({} as { i: { j: { k: { l: { readonly m: number } } } } });
//     // @ts-expect-error m is readonly
//     setK5("i", "j", "k", "l", "m", 6);
//     const [, setK6] = createStore({} as { i: { j: { k: { l: { m: { readonly n: number } } } } } });
//     // @ts-expect-error n is readonly, but has unreadable error due to method overloading
//     setK6("i", "j", "k", "l", "m", "n", 7);
//     const [, setK7] = createStore(
//       {} as { i: { j: { k: { l: { m: { n: { readonly o: number } } } } } } }
//     );
//     // @ts-expect-error o is readonly, but has unreadable error due to method overloading
//     setK7("i", "j", "k", "l", "m", "n", "o", 8);
//     const [, setKn] = createStore(
//       {} as { i: { j: { k: { l: { m: { n: { o: { readonly p: number } } } } } } } }
//     );
//     // @ts-expect-error p is readonly
//     setKn("i", "j", "k", "l", "m", "n", "o", "p", 9);
//   };

//   // keys are narrowed
//   () => {
//     const [store, setStore] = createStore({ a: { b: 1 }, c: { d: 2 } });
//     setStore("a", "b", 3);
//     setStore("c", "d", 4);
//     // @ts-expect-error a.d is not valid
//     setStore("a", "d", 5);
//     // @ts-expect-error a.d is not valid
//     store.a.d;
//     // @ts-expect-error c.b is not valid
//     setStore("c", "b", 6);
//     // @ts-expect-error c.b is not valid
//     store.c.b;
//   };

//   // array key types are inferred
//   () => {
//     const [, setStore] = createStore({ list: [1, 2, 3] });
//     setStore(
//       "list",
//       (v, i) => i === 0,
//       (v, t) => v * 2
//     );
//     setStore("list", { from: 1, to: 2 }, 4);
//     setStore("list", [2, 3], 4);
//   };

//   // fallback overload correctly infers keys and setter
//   () => {
//     const [, setStore] = createStore({
//       a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: 1 } } } } } } } } } }
//     });
//     setStore("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", (v, t) => ({
//       k: 2
//     }));
//     setStore("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", 2);
//   };

//   // same as the above but with strings which have more types of keys
//   () => {
//     const [, setStore] = createStore({
//       a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: "l" } } } } } } } } } }
//     });
//     setStore("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "m");
//     setStore("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", (v, t) => ({
//       k: "m"
//     }));
//   };

//   // tuples are correctly typed
//   () => {
//     const [, setStore] = createStore({ data: ["a", 1] as [string, number] });
//     setStore("data", 0, "hello");
//     setStore("data", 1, 2);
//     // @ts-expect-error number not assignable to string
//     setStore("data", 0, 3);
//     // @ts-expect-error string not assignable to number
//     setStore("data", 1, "world");
//   };

//   // // cannot mutate a store directly
//   // () => {
//   //   const [store, setStore] = createStore({ a: 1, nested: { a: 1 } });
//   //   // @ts-expect-error cannot set
//   //   store.a = 1;
//   //   // @ts-expect-error cannot set
//   //   store.nested.a = 1;
//   //   // @ts-expect-error cannot delete
//   //   delete store.a;
//   //   // @ts-expect-error cannot delete
//   //   delete store.nested.a;
//   //   // @ts-expect-error cannot set in setter
//   //   setStore(s => (s.a = 1));
//   //   // @ts-expect-error cannot set in setter
//   //   setStore(s => (s.nested.a = 1));
//   // };

//   // cannot mutate unnested classes
//   () => {
//     const [store, setStore] = createStore({ inner: new Uint8Array() });
//     // TODO @ts-expect-error
//     setStore("inner", 0, 2);
//     const [inner] = createStore(new Uint8Array());
//     const [, setNested] = createStore({ inner });
//     setNested("inner", 0, 2);
//   };

//   // createStore initial value
//   () => {
//     createStore();
//     createStore<{ a?: { b: 1 } }>();
//     createStore(() => 1);
//     // @ts-expect-error cannot create store from null
//     createStore(null);
//     // @ts-expect-error cannot create store from number
//     createStore(1);
//     // @ts-expect-error cannot create store from string
//     createStore("a");
//     // @ts-expect-error cannot create store from symbol
//     createStore(Symbol());
//     // @ts-expect-error cannot create store from bigint
//     createStore(BigInt(0));
//     // @ts-expect-error must provide initial value if {} cannot be assigned to it
//     createStore<{ a: 1 }>();
//   };

//   // recursive
//   () => {
//     type Recursive = { a: Recursive };
//     const [store, setStore] = createStore({} as Recursive);
//     setStore("a", "a", "a", "a", {});
//     // @ts-expect-error TODO should work with recursive types even at rest depth
//     setStore("a", "a", "a", "a", "a", "a", "a", "a", "a", "a", {});
//     store.a.a.a.a.a.a.a.a.a;
//   };

//   // TODO Wrappable instead of NotWrappable
//   () => {
//     type User = {
//       name: string;
//       data: number[];
//     };
//     let user: User = { name: "Jake", data: [1, 2, 3] };
//     // @ts-expect-error plain objects are wrappable
//     let a: NotWrappable = user;
//     let b: NotWrappable = 1;
//     let c: NotWrappable = "string";
//     let d: NotWrappable = BigInt(0);
//     let e: NotWrappable = Symbol();
//     let f: NotWrappable = undefined;
//     let g: NotWrappable = null;
//     let h: NotWrappable = () => 1;
//     // @ts-expect-error TODO classes are not wrappable
//     let i: NotWrappable = new Uint8Array();
//   };

//   // interactions with `any`
//   () => {
//     const [, setStore] = createStore<{ a: any; b?: { c: string } }>({ a: {} });
//     // allows anything when accessing `any`
//     setStore("a", "b", "c", "d", "e", "f", "g", "h", "i");
//     setStore("a", 1, "c", Symbol(), 2, 1, 2, 3, 4, 5, 6, 1, 2, 3, "a", Symbol());
//     // still infers correctly on other paths
//     setStore("b", "c", "d");
//     // @ts-expect-error
//     setStore("b", 2);
//     setStore("b", "c", v => v);
//   };

//   // interactions with `unknown`
//   () => {
//     const [, setStore] = createStore<{ a: unknown }>({ a: {} });
//     // allows any setter
//     setStore("a", "a");
//     setStore("a", () => ({ a: { b: 1 } }));

//     // @ts-expect-error doesn't allow string
//     setStore("a", "b", 1);
//     // @ts-expect-error doesn't allow number
//     setStore("a", 1, 1);
//     // @ts-expect-error doesn't allow symbol
//     setStore("a", Symbol(), 1);
//   };

//   // interactions with generics
//   <T extends string>(v: T) => {
//     type A = { a: T; b: Record<string, string>; c: Record<T, string> };
//     const a = {} as A;
//     const [store, setStore] = createStore<A>(a);
//     // should allow
//     setStore("a", v);
//     setStore("b", "a", "c");
//     setStore("b", v, "c");
//     // @ts-expect-error TODO generic should index Record
//     setStore("c", v, "c");
//     const b = store.c[v];
//     const c: typeof b = "1";
//     const d = a.c[v];
//     const e: typeof d = "1";
//   };

//   // traversed contains the correct types of keys
//   () => {
//     const [, setStore] = createStore({ a: [{ b: 1 }] });
//     setStore((v, t) => {
//       const expectedT: [] = t;
//       t = [] as [];
//       return v;
//     });
//     setStore("a", (v, t) => {
//       const expectedT: ["a"] = t;
//       t = ["a"];
//       return v;
//     });
//     setStore("a", 0, (v, t) => {
//       const expectedT: [0, "a"] = t;
//       t = [0, "a"];
//       return v;
//     });
//     // array of keys
//     setStore(["a"], [0], (v, t) => {
//       const expectedT: [0, "a"] = t;
//       t = [0, "a"];
//       return v;
//     });
//     // callback
//     setStore(
//       ["a"],
//       () => true,
//       (v, t) => {
//         const expectedT: [number, "a"] = t;
//         t = [0, "a"];
//         return v;
//       }
//     );
//     // { from, to, by }
//     setStore(["a"], {}, (v, t) => {
//       const expectedT: [number, "a"] = t;
//       t = [0, "a"];
//       return v;
//     });
//   };

//   // types with a string index signature are not wrongly assumed to be arrays in setStore
//   () => {
//     const [store, setStore] = createStore<{ [x: string]: number }>({});
//     // @ts-expect-error filter function not allowed for objects
//     setStore(() => true, 1);
//     // @ts-expect-error from to by not allowed for objects
//     setStore({ from: 0, to: 10, by: 3 }, 1);
//   };

//   // can set overly complex? types
//   () => {
//     const [store, setStore] = createStore<{ el?: Element }>({});
//     setStore("el", {} as Element);
//   };

//   // can set tuple indices
//   () => {
//     const [store, setStore] = createStore({ list: [0] as [number, number?] });
//     setStore("list", { 0: 1, 1: 2 });
//     setStore("list", { 0: 1 });
//     setStore("list", { 1: 2 });
//     setStore("list", {});
//     // @ts-expect-error tuple only contains two items
//     setStore("list", { 2: 3 });
//   };

//   // can set array indices
//   () => {
//     const [store, setStore] = createStore({ list: [0] as number[] });
//     setStore("list", { 0: 1, 1: 2 });
//     setStore("list", { 0: 1 });
//     setStore("list", { 1: 2 });
//     setStore("list", { 99: 100 });
//   };

//   // can set top-level tuple indices
//   () => {
//     const [store, setStore] = createStore([0] as [number, number?]);
//     setStore({ 0: 1, 1: 2 });
//     setStore({ 0: 1 });
//     setStore({ 1: 2 });
//     setStore({});
//     // @ts-expect-error tuple only contains two items
//     setStore({ 2: 3 });
//   };

//   // can set top-level array indices
//   () => {
//     const [store, setStore] = createStore([0] as number[]);
//     setStore({ 0: 1, 1: 2 });
//     setStore({ 0: 1 });
//     setStore({ 1: 2 });
//     setStore({ 99: 100 });
//   };
