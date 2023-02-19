import { createSignal, createEffect } from "./reactivity";

const [count, setCount] = createSignal(0);
const doubleCount = () => count() * 2;

createEffect(() => {
  console.log(count(), doubleCount());
});

setCount(1);
setCount(500);
