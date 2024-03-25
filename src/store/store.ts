import { createSignal } from "~/methods/createSignal.ts";
import { CURRENTOBSERVER } from "~/context.ts";
import {
  DataNode,
  DataNodes,
  SetStoreFunction,
  StoreNode,
  Wrappable,
} from "./types.ts";

export const $STORE = Symbol("Proxy");
export const $RAW = Symbol("ProxyRaw");
export const $NODE = Symbol("ProxyDataNodes");
export const $TRACKTOPLEVEL = Symbol("ProxyTrackTopLevel");

const UNREACTIVE_KEYS = new Set([
  "__proto__",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "prototype",
  "constructor",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toSource",
  "toString",
  "valueOf",
  $NODE,
]);

export function isStore(value: unknown): boolean {
  return typeof value === "object" && value !== null && $STORE in value;
}

export function isWrappable(value: unknown): value is Wrappable {
  if (value === null || typeof value !== "object") {
    return false;
  }

  if ($STORE in value) {
    return true;
  }

  if (Array.isArray(value)) return true;

  const prototype = Reflect.getPrototypeOf(value);

  if (prototype === null) return true;

  return Reflect.getPrototypeOf(prototype) === null;
}

export function unwrap<T>(item: T, set?: Set<unknown>): T;
export function unwrap<T>(item: any, set = new Set()): T {
  if (item !== null) {
    const raw = item[$RAW];

    if (raw != undefined) {
      return raw;
    }
  }

  if (!isWrappable(item) || set.has(item)) {
    return item;
  }

  if (Array.isArray(item)) {
    if (Object.isFrozen(item)) {
      item = item.slice(0);
    } else {
      set.add(item);
    }

    for (let i = 0; i < item.length; i++) {
      const value = item[i];

      const unwrappedValue = unwrap(value, set);

      if (value !== unwrappedValue) {
        item[i] = unwrappedValue;
      }
    }
  } else {
    if (Object.isFrozen(item)) {
      item = Object.assign({}, item);
    } else {
      set.add(item);
    }

    const keys = Object.keys(item);
    const desc = Object.getOwnPropertyDescriptors(item);

    for (const propertyName of keys) {
      if (desc[propertyName].get) {
        continue;
      }

      const value = item[propertyName];

      const unwrappedValue = unwrap(value, set);

      if (value !== unwrappedValue) {
        item[propertyName] = unwrappedValue;
      }
    }
  }

  return item;
}

/**
 * Gets the DataNodes registered on a store or creates them if there are none
 * There is one DataNode, a signal, for each property that has been accessed
 * @param target
 * @returns
 */
function getDataNodes(target: StoreNode): DataNodes {
  let nodes = target[$NODE];

  if (!nodes) {
    nodes = {};
    Reflect.defineProperty(target, $NODE, { value: nodes });
  }

  return nodes;
}

/**
 * Gets a specific DataNode or creates it if it isn't registered already
 * @param nodes The object containing the DataNodes
 * @param property The DataNode's property name
 * @param value The value to initialize the DataNode if it isn't registered as DataNode already
 * @returns
 */
function getDataNode(
  nodes: DataNodes,
  property: PropertyKey,
  value?: any,
): DataNode {
  let node = nodes[property];

  if (!node) {
    node = createSignal(value, {
      equals: false,
    });

    nodes[property] = node;
  }

  return node;
}

function trackTopLevel(target: StoreNode) {
  if (CURRENTOBSERVER) {
    const nodes = getDataNodes(target);

    getDataNode(nodes, $TRACKTOPLEVEL)();
  }
}

const proxyTraps: ProxyHandler<StoreNode> = {
  get(target, property, receiver) {
    if (property === $RAW) {
      return target;
    }

    if (property === $STORE) {
      return receiver;
    }

    if (property === $TRACKTOPLEVEL) {
      trackTopLevel(target);

      return receiver;
    }

    const nodes = getDataNodes(target);

    // check if the property is already tracked, and therefore is registered on the nodes object
    const isTracked = Object.hasOwn(nodes, property);

    let value = isTracked ? nodes[property]!() : Reflect.get(target, property);

    // Some keys like `prototype` we do not want to track and just return the value from the original object
    if (UNREACTIVE_KEYS.has(property)) {
      return value;
    }

    if (!isTracked) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

      // if there is no observer, there is no need to track the property now and we can use the value of the original object we got above
      if (
        CURRENTOBSERVER &&
        (typeof value !== "function" ||
          Object.hasOwn(target, property)) &&
        !(descriptor && descriptor.get)
      ) {
        value = getDataNode(nodes, property, value)();
      }
    }

    // If we are accessing an object or array, we need to deeply track it
    return isWrappable(value) ? wrap(value) : value;
  },
  set() {
    console.warn("Cannot mutate a store directly!");
    return true;
  },
  has(target, property) {
    if (
      ([$RAW, $STORE, $TRACKTOPLEVEL, $NODE] as (string | symbol)[]).includes(
        property,
      ) || UNREACTIVE_KEYS.has(property)
    ) {
      return true;
    }
    trackTopLevel(target);

    this.get!(target, property, target);

    return Reflect.has(target, property);
  },
  deleteProperty() {
    console.warn("Cannot mutate a Store directly");
    return true;
  },
  ownKeys(target) {
    trackTopLevel(target);

    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, property) {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

    if (
      !descriptor ||
      // if there is a getter we don't want to overwrite it
      descriptor.get ||
      // we can only delete `writable` if the descriptor is configurable
      !descriptor.configurable ||
      ([$RAW, $STORE, $TRACKTOPLEVEL, $NODE] as (string | symbol)[]).includes(
        property,
      )
    ) {
      return descriptor;
    }

    // we are only allowed to set a getter if the descriptor has no value and writable properties
    delete descriptor.value;
    delete descriptor.writable;
    descriptor.get = () => target[$STORE][property];

    return descriptor;
  },
};

function setProperty(current: StoreNode, property: PropertyKey, value: any) {
  const prevLength = current.length;

  if (value === undefined) {
    delete current[property];
  } else {
    const nodes = getDataNodes(current);
    const prevValue = current[property];
    current[property] = value;

    // get the corresponding DataNode, initialized with the previous value if it doesn't exist
    const node = getDataNode(nodes, property, prevValue);

    // prevent that if value is a function it gets executed as setter function
    node.set(() => value);

    const nextLength = current.length;

    // TODO: Figure out why there are problems with array length
    if (Array.isArray(current) && nextLength !== prevLength) {
      getDataNode(nodes, "length", prevLength).set(nextLength);
    }

    const topLevelNode = getDataNode(nodes, $TRACKTOPLEVEL);

    if (topLevelNode) {
      topLevelNode.set();
    }
  }
}

function mergeStoreNode(current: StoreNode, next: StoreNode) {
  const keys = Object.keys(next);

  // merge the new value with the previous value by setting each property by itself
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    setProperty(current, key, next[key]);
  }
}

function setStoreArray(
  current: StoreNode,
  next:
    | Array<any>
    | Record<string, any>
    | ((prev: StoreNode) => Array<any> | Record<string, any>),
) {
  if (typeof next === "function") {
    next = next(current);
  }

  if (Array.isArray(next)) {
    if (current === next) {
      return;
    }

    // store the array length so if the new array is shorter than the previous one, we can update the length
    const nextLength = next.length;

    for (let i = 0; i < nextLength; i++) {
      const newValue = next[i];
      if (current[i] !== newValue) {
        setProperty(current, i, newValue);
      }
    }

    if (current.length < nextLength) {
      setProperty(current, "length", nextLength);
    }
  } else {
    // if the new value is an object, we need to merge it with the previous one
    mergeStoreNode(current, next);
  }
}

function setStorePath(
  current: StoreNode,
  path: any[],
  traversed?: PropertyKey[],
): void {
  // The current part of the path
  let part;
  let prevValue = current;
  // The already traversed path
  traversed ??= [];

  // The last part of the path is the value we want to set
  if (path.length > 1) {
    part = path.shift();

    const partType = typeof part;
    const isArray = Array.isArray(current);

    // sets the rest of the path for each of the properties or indexes given in the array
    // e.g. setStore("data", [1, 3, 4], "finished", (isFinished) => !isFinished)
    if (Array.isArray(part)) {
      for (let i = 0; i < part.length; i++) {
        setStorePath(current, [part[i], ...path], [...traversed, i]);
      }

      return;
    } // filters an array based on the given function and sets the rest of the path for each of the matching indexes
    // e.g setStore("data", (task) => task.label.indcludes("cook"), "day", "tomorrow")
    else if (isArray && partType === "function") {
      for (let i = 0; i < current.length; i++) {
        if (part(current[i], i)) {
          setStorePath(current, [i, ...path], [...traversed, i]);
        }
      }

      return;
    } // traverses an array from `from` to `to` with the step `step` and sets the rest of the path for the matching indexes
    // e.g. setStore("data", { from: 2, to: 10, step: 2 }, "finished", (isFinished) => !isFinished)
    else if (isArray && typeof part === "object") {
      const { from = 0, to = current.length, step = 1 } = part;

      for (let i = from; i < to; i += step) {
        setStorePath(current, [i, ...path], [...traversed, i]);
      }

      return;
    } // sets the rest of the path for the given property, just goes deeper if the next part of the path is not the last one which means it is the value to set eventually
    else if (path.length > 1) {
      setStorePath(current[part], path, [...traversed, part]);

      return;
    }

    traversed = [...traversed, part];
    prevValue = current[part];
  }

  let newValue = path[0];

  newValue = typeof newValue === "function"
    ? newValue(prevValue, traversed)
    : newValue;

  if (prevValue === newValue) {
    return;
  }

  // merge granuarly if both of the values are wrappable (objects or arrays)
  if (isWrappable(prevValue) && isWrappable(newValue)) {
    mergeStoreNode(prevValue, newValue);
    return;
  }

  setProperty(current, part, newValue);
}

/**
 * wraps an object or array in a proxy
 * @param value the object or array
 * @returns
 */
export function wrap<T extends StoreNode>(value: T): T {
  let proxy: T = value[$STORE];

  if (!proxy) {
    proxy = new Proxy<T>(value, proxyTraps);

    Reflect.defineProperty(value, $STORE, {
      value: proxy,
    });

    const keys = Object.keys(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const descriptor = descriptors[key];

      // if the property is a getter, bind it to the proxy
      if (descriptor.get) {
        Reflect.defineProperty(value, key, {
          enumerable: descriptor.enumerable,
          get: descriptor.get.bind(proxy),
        });
      }
    }
  }

  return proxy;
}

// deno-lint-ignore ban-types
export function createStore<T extends object>(
  object: T,
): [get: T, set: SetStoreFunction<T>] {
  const wrappedStore = wrap(object);
  const setStore = (...path: any[]) => {
    if (Array.isArray(object) && path.length === 1) {
      setStoreArray(object, path[0]);
    } else {
      setStorePath(object, path);
    }
  };

  return [
    wrappedStore,
    setStore,
  ];
}
