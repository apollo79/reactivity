import { Context } from "./createContext";

export function useContext<T>(context: Context<T>): T | undefined {
  return context.get();
}
