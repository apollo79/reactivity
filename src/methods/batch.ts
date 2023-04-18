import { SCHEDULER, setBatch } from "~/context.ts";

export function batch(fn: () => void): void {
  setBatch([]);
  try {
    fn();

    SCHEDULER.runEffects();
  } finally {
    setBatch(null);
  }
}
