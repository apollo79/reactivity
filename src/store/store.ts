import { createSignal } from "~/methods/createSignal.ts";

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

// eslint-disable-next-line @typescript-eslint/ban-types
type NotWrappable =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | Function
  | null
  | undefined;

export function isWrappable<T>(value: T | NotWrappable): value is T {
  if (value === null || typeof value !== "object") {
    return false;
  }

  if ($PROXY in value) {
    return true;
  }

  // if (SYMBOL_STORE_UNTRACKED in value) return false;

  // if (isArray(value)) return true;

  const prototype = Object.getPrototypeOf(value);

  if (prototype === null) return true;

  return Object.getPrototypeOf(prototype) === null;
}

function getDataNodes(target: StoreNode): DataNodes {
  let nodes = target[$NODE];

  if (!nodes) {
    nodes = Object.create(null);
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

    const trackedProp = nodes[property];

    if (UNREACTIVE_KEYS.has(property)) {
      return target[property];
    }

    const value = trackedProp
      ? trackedProp()
      : getDataNode(nodes, property, target[property])();

    return isWrappable(value) ? wrap(value) : value;
  },
};

function setPath(current: StoreNode, path: [...string[], any]): void {
  const part = path.shift();

  if (path.length === 1) {
    const prev = current[part];
    let newValue = path[0];

    if (typeof newValue === "function") {
      newValue = newValue(prev);
    }

    if (prev === newValue) {
      return;
    }

    const node = getDataNode(getDataNodes(current), part);

    node.set(path[0]);

    return;
  } else {
    setPath(current[part], path);
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
