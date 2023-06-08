import { createSignal } from "~/methods/createSignal.ts";
import { CURRENTOBSERVER } from "~/context.ts";
import {
  DataNode,
  DataNodes,
  SetStoreFunction,
  StoreNode,
  Wrappable,
} from "./types.ts";

export const $PROXY = Symbol("Proxy");
export const $RAW = Symbol("ProxyRaw");
export const $NODE = Symbol("ProxyDataNodes");

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

export function isWrappable(value: unknown): value is Wrappable {
  if (value === null || typeof value !== "object") {
    return false;
  }

  if ($PROXY in value) {
    return true;
  }

  // if (SYMBOL_STORE_UNTRACKED in value) return false;

  // TODO: support for arrays (length property has some tricky parts!)
  if (Array.isArray(value)) return true;

  const prototype = Reflect.getPrototypeOf(value);

  if (prototype === null) return true;

  return Reflect.getPrototypeOf(prototype) === null;
}

function getDataNodes(target: StoreNode): DataNodes {
  let nodes = target[$NODE];

  if (!nodes) {
    nodes = {};
    Reflect.defineProperty(target, $NODE, { value: nodes });
  }

  return nodes;
}

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

const proxyTraps: ProxyHandler<StoreNode> = {
  get(target, property, receiver) {
    if (property === $RAW) {
      return target;
    }

    if (property === $PROXY) {
      return receiver;
    }

    const nodes = getDataNodes(target);

    // deno-lint-ignore no-prototype-builtins
    const isTracked = nodes.hasOwnProperty(property);
    let value = isTracked ? nodes[property]!() : target[property];

    if (UNREACTIVE_KEYS.has(property)) {
      return value;
    }

    if (!isTracked) {
      const descriptor = Object.getOwnPropertyDescriptor(target, property);
      if (
        CURRENTOBSERVER &&
        (typeof value !== "function" ||
          // deno-lint-ignore no-prototype-builtins
          target.hasOwnProperty(property)) &&
        !(descriptor && descriptor.get)
      ) {
        value = getDataNode(nodes, property, value)();
      }
    }

    return isWrappable(value) ? wrap(value) : value;
  },
  set() {
    console.warn("Cannot mutate a store directly!");
    return true;
  },
  deleteProperty() {
    console.warn("Cannot mutate a Store directly");
    return true;
  },
};

function setProperty(current: StoreNode, property: PropertyKey, value: any) {
  // const prevLength = current[property].length;

  if (value === undefined) {
    delete current[property];
  } else {
    const prevValue = current[property];
    current[property] = value;

    const node = getDataNode(getDataNodes(current), property, prevValue);

    // prevent that if value is a function it gets executed as setter function
    node.set(() => value);
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

    const nextLength = next.length;

    for (let i = 0; i < nextLength; i++) {
      const newValue = next[i];
      if (current[i] !== newValue) {
        setProperty(current, i, newValue);
      }
    }

    if (current.length !== nextLength) {
      setProperty(current, "length", nextLength);
    }
  } else {
    mergeStoreNode(current, next);
  }
}

function setStorePath(
  current: StoreNode,
  path: any[],
  traversed?: PropertyKey[],
): void {
  let part;
  let prevValue = current;
  traversed ??= [];

  if (path.length > 1) {
    part = path.shift();

    const partType = typeof part;
    const isArray = Array.isArray(current);

    if (Array.isArray(part)) {
      for (let i = 0; i < part.length; i++) {
        setStorePath(current, [part[i], ...path], [...traversed, i]);
      }

      return;
    } else if (isArray && partType === "function") {
      for (let i = 0; i < current.length; i++) {
        if (part(current[i], i)) {
          setStorePath(current, [i, ...path], [...traversed, i]);
        }
      }

      return;
    } else if (isArray && typeof part === "object") {
      const { from = 0, to = current.length, step = 1 } = part;

      for (let i = from; i < to; i += step) {
        setStorePath(current, [i, ...path], [...traversed, i]);
      }

      return;
    } else if (path.length > 1) {
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

  if (isWrappable(prevValue) && isWrappable(newValue)) {
    mergeStoreNode(prevValue, newValue);
    return;
  }

  setProperty(current, part, newValue);
}

export function wrap<T extends StoreNode>(value: T): T {
  let proxy: T = value[$PROXY];

  if (!proxy) {
    proxy = new Proxy<T>(value, proxyTraps);

    Reflect.defineProperty(value, $PROXY, {
      value: proxy,
    });

    const keys = Object.keys(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const descriptor = descriptors[key];

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
