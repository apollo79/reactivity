import { createSignal } from "~/methods/createSignal.ts";
import { CURRENTOBSERVER } from "../context.ts";

const $PROXY = Symbol("Proxy");
const $NODE = Symbol("DataNodes");

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

interface DataNode {
  (): any;
  set: (value?: any) => void;
}

type DataNodes = Record<PropertyKey, DataNode | undefined>;

interface StoreNode {
  [$NODE]?: DataNodes;
  [key: PropertyKey]: any;
}

export type Wrappable = Record<string | number | symbol, any>;

export function isWrappable(value: unknown): value is Wrappable {
  if (value === null || typeof value !== "object") {
    return false;
  }

  if ($PROXY in value) {
    return true;
  }

  // if (SYMBOL_STORE_UNTRACKED in value) return false;

  // TODO: support for arrays (length property has some tricky parts!)
  if (Array.isArray(value)) return false;

  const prototype = Reflect.getPrototypeOf(value);

  if (prototype === null) return true;

  return Reflect.getPrototypeOf(prototype) === null;
}

function getDataNodes(target: StoreNode): DataNodes {
  let nodes = target[$NODE];

  if (!nodes) {
    nodes = {};
    Reflect.defineProperty(target, $NODE, { value: nodes as DataNodes });
  }

  return nodes as DataNodes;
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

const proxyTraps: ProxyHandler<any> = {
  get(target, property, receiver) {
    if (property === $PROXY) return receiver;

    const nodes = getDataNodes(target);

    const isTracked = nodes.hasOwnProperty(property);
    let value = isTracked ? nodes[property]!() : target[property];

    if (UNREACTIVE_KEYS.has(property)) {
      return value;
    }

    if (!isTracked) {
      const descriptor = Object.getOwnPropertyDescriptor(target, property);
      if (
        CURRENTOBSERVER &&
        (typeof value !== "function" || target.hasOwnProperty(property)) &&
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
  if (value === undefined) {
    delete current[property];
  } else {
    const prevValue = current[property];
    current[property] = value;

    const node = getDataNode(getDataNodes(current), property, prevValue);

    node.set(() => value);
  }
}

function setPath(
  current: StoreNode,
  path: [...string[], any],
  traversed?: string[],
): void {
  const part = path.shift();
  traversed ??= [];

  if (path.length <= 1) {
    let prevValue;
    let newValue;

    // when setting a property
    if (path.length === 1) {
      prevValue = current[part];
      newValue = path.shift();
      traversed = [...traversed, part];
    } 
    // when doing a top level merge
    else {
      prevValue = current;
      newValue = part;
    }

    newValue = typeof newValue === "function"
      ? newValue(prevValue, traversed)
      : newValue;

    if (prevValue === newValue) {
      return;
    }

    if (isWrappable(prevValue) && isWrappable(newValue)) {
      const keys = Object.keys(newValue);

      // merge the new value with the previous value by setting each property by itself
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        setProperty(prevValue, key, newValue[key]);
      }

      return;
    }

    // prevent that if newValue is a function it gets executed as setter function
    setProperty(current, part, newValue);
  } else {
    setPath(current[part], path, [...traversed, part]);
  }
}

export function wrap<T extends StoreNode>(value: T): T {
  let p: T = value[$PROXY];

  if (!p) {
    p = new Proxy(value, proxyTraps);

    Reflect.defineProperty(value, $PROXY, {
      value: p,
    });

    const keys = Object.keys(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const descriptor = descriptors[key];

      if (descriptor.get) {
        Reflect.defineProperty(value, key, {
          enumerable: descriptor.enumerable,
          get: descriptor.get.bind(p),
        });
      }
    }
  }

  return p;
}

export function createStore<T extends object>(
  object: T,
): [T, (...path: [...string[], any]) => void] {
  const wrappedStore = wrap(object);

  return [wrappedStore, (...path: [...string[], any]) => setPath(object, path)];
}
