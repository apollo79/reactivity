import { ASYNCSCHEDULER, setBatch } from "~/context.ts";

export function batch(fn: () => void): void {
  setBatch([]);
  try {
    fn();

    ASYNCSCHEDULER.runEffects();
  } finally {
    setBatch(undefined);
  }
}
