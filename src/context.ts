import type { Owner } from "~/objects/owner.ts";
import type { Observer } from "~/objects/observer.ts";
import { AsyncScheduler, SyncScheduler } from "~/scheduler.ts";
import { Contexts } from "~/types.ts";

let CURRENTOWNER: Owner | undefined;
let CURRENTOBSERVER: Observer<any> | undefined;
let BATCH: Promise<void> | undefined;
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

export const EMPTY_CONTEXT: Contexts = {};

export const ERRORHANDLER_SYMBOL = Symbol("Errorhandler");
export const ERRORTHROWN_SYMBOL = Symbol("Error thrown");

export const SUSPENSE_SYMBOL = Symbol("Suspense");
