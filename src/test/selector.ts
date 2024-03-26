import { createMemo, createRoot, createSelector, createSignal } from "#/mod.ts";
import { assertStrictEquals, describe, it } from "./util.ts";

describe("createSelector", () => {
  it("simple selection", () => {
    createRoot(() => {
      const $a = createSignal<number>(),
        isSelected = createSelector($a);
      let count = 0;

      const list = Array.from({ length: 100 }, (_, i) => {
        return createMemo(() => {
          count++;
          return isSelected(i) ? "selected" : "no";
        });
      });

      assertStrictEquals(count, 0);
      assertStrictEquals(list[3](), "no");

      count = 0;
      $a.set(3);
      assertStrictEquals(list[3](), "selected");
      assertStrictEquals(count, 1);

      count = 0;
      $a.set(6);
      assertStrictEquals(list[3](), "no");
      assertStrictEquals(list[6](), "selected");
      assertStrictEquals(count, 2);

      $a.set(undefined);
      assertStrictEquals(list[6](), "no");
      assertStrictEquals(count, 3);

      $a.set(5);
      assertStrictEquals(list[5](), "selected");
      assertStrictEquals(count, 4);
    });
  });

  it("double selection", () => {
    createRoot(() => {
      const $a = createSignal<number>(-1),
        isSelected = createSelector<number, number>($a);
      const list = Array.from({ length: 100 }, (_, i) => [
        createMemo(() => {
          return isSelected(i) ? "selected" : "no";
        }),
        createMemo(() => {
          return isSelected(i) ? "oui" : "non";
        }),
      ]);

      assertStrictEquals(list[3][0](), "no");
      assertStrictEquals(list[3][1](), "non");

      $a.set(3);
      assertStrictEquals(list[3][0](), "selected");
      assertStrictEquals(list[3][1](), "oui");
      $a.set(6);
      assertStrictEquals(list[3][0](), "no");
      assertStrictEquals(list[3][1](), "non");
      assertStrictEquals(list[6][0](), "selected");
      assertStrictEquals(list[6][1](), "oui");
    });
  });

  it("zero index", () => {
    createRoot(() => {
      const $a = createSignal<number>(-1),
        isSelected = createSelector<number, number>($a);
      const list = [
        createMemo(() => {
          return isSelected(0) ? "selected" : "no";
        }),
      ];
      assertStrictEquals(list[0](), "no");
      $a.set(0);
      assertStrictEquals(list[0](), "selected");

      $a.set(-1);
      assertStrictEquals(list[0](), "no");
    });
  });
});
