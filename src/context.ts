import type { Owner } from "~/objects/owner.ts";
import { Effect } from "~/objects/effect.ts";
import { Observer } from "../mod.ts";
import { AsyncScheduler, SyncScheduler } from "./scheduler.ts";

let CURRENTOWNER: Owner | undefined;
let CURRENTOBSERVER: Observer<any> | undefined;
let BATCH: Effect<any>[] | undefined;
const ASYNCSCHEDULER = new AsyncScheduler();
const SYNCSCHEDULER = new SyncScheduler();

export { ASYNCSCHEDULER, BATCH, CURRENTOBSERVER, CURRENTOWNER, SYNCSCHEDULER };

function setOwner(owner: typeof CURRENTOWNER) {
  CURRENTOWNER = owner;
}

function setObserver(observer: typeof CURRENTOBSERVER) {
  CURRENTOBSERVER = observer;
}

function setBatch(batch: typeof BATCH) {
  BATCH = batch;
}

export { setBatch, setObserver, setOwner };

export const STATE_CLEAN = 1;
export const STATE_CHECK = 2;
export const STATE_DIRTY = 3;
export const STATE_DISPOSED = 4;

export type CacheState =
  | typeof STATE_CLEAN
  | typeof STATE_CHECK
  | typeof STATE_DIRTY
  | typeof STATE_DISPOSED;

export const ERRORHANDLER_SYMBOL = Symbol("Errorhandler");
export const ERRORTHROWN_SYMBOL = Symbol("Error thrown");

// Magic type that when used at sites where generic types are inferred from, will prevent those sites from being involved in the inference.
// https://github.com/microsoft/TypeScript/issues/14829
// TypeScript Discord conversation: https://discord.com/channels/508357248330760243/508357248330760249/911266491024949328
// deno-lint-ignore no-explicit-any
export type NoInfer<T extends any> = [T][T extends any ? 0 : never];
