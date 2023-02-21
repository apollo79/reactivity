import { CONTEXT } from "../context";

export type Context<T> = {
  id: symbol;
  defaultValue: T;
  get: () => T | undefined;
  set: (value: T) => void;
};

export function createContext<T>(defaultValue: T): Context<T> | undefined {
  if (CONTEXT.OWNER === null) {
    return;
  }

  const id = Symbol();

  const context = {
    id,
    defaultValue,
    get: (): T | undefined => CONTEXT.OWNER?.get(id) ?? defaultValue,
    set: (value: T): void => CONTEXT.OWNER?.set(id, value),
  };

  return context;
}
