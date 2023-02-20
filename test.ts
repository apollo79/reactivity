import { createSignal, createEffect, untrack, batch, createMemo } from ".";

const [count, setCount] = createSignal(0);

let i = 0,
  i2 = 0;

const doubleCount = () => {
  console.log("non-memo: ", i);
  return count() * 2;
};

const doubleCount2 = createMemo(() => {
  console.log("memo: ", i);
  return count() * 2;
});

createEffect(() => {
  doubleCount();
  doubleCount2();
});

createEffect(() => {
  doubleCount();
  doubleCount2();
});

setCount(1);
