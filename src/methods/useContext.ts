import { Context } from "~/methods/createContext.ts";

export function useContext<T>(context: Context<T>): T | undefined {
  return context.get();
}
