import { useReducer } from "react";

type ArrayReducerAction<V> =
  | { type: "create"; value: V }
  | { type: "delete"; value: V }
  | { type: "replace"; value: Array<V> };

function arrayReducer<V>() {
  return (itemArray: Array<V>, action: ArrayReducerAction<V>) => {
    switch (action.type) {
      case "create": {
        return new Array(...itemArray, action.value);
      }
      case "delete": {
        const newCollection = new Array(...itemArray);
        newCollection.filter((v) => v === action.value);
        return newCollection;
      }
      case "replace": {
        return action.value;
      }
      default:
        throw Error("Unknown action");
    }
  };
}

export function useArrayReducer<V>(array?: Array<V>) {
  return useReducer(arrayReducer<V>(), array || new Array<V>());
}

export type MapReducerAction<K, V> =
  | { type: "create"; key: K; value: V }
  | { type: "delete"; key: K }
  | { type: "replace"; value: Map<K, V> };

function mapReducer<K, V>() {
  return (itemMap: Map<K, V>, action: MapReducerAction<K, V>) => {
    switch (action.type) {
      case "create": {
        return new Map([...itemMap.entries()]).set(action.key, action.value);
      }
      case "delete": {
        const newCollection = new Map([...itemMap.entries()]);
        newCollection.delete(action.key);
        return newCollection;
      }
      case "replace": {
        return action.value;
      }
      default:
        throw Error("Unknown action");
    }
  };
}

export function useMapReducer<K, V>(map?: Map<K, V>) {
  return useReducer(mapReducer<K, V>(), map || new Map<K, V>());
}

type SetReducerAction<V> =
  | { type: "create"; value: V }
  | { type: "delete"; value: V }
  | { type: "replace"; value: Set<V> };

function setReducer<V>() {
  return (itemSet: Set<V>, action: SetReducerAction<V>) => {
    switch (action.type) {
      case "create": {
        return new Set(itemSet).add(action.value);
      }
      case "delete": {
        const newCollection = new Set(itemSet);
        newCollection.delete(action.value);
        return newCollection;
      }
      case "replace": {
        return action.value;
      }
      default:
        throw Error("Unknown action");
    }
  };
}

export function useSetReducer<V>(set?: Set<V>) {
  return useReducer(setReducer<V>(), set || new Set<V>());
}

/* type RecursiveMap<K, V> = Map<K, V | RecursiveMap<K, V>>; */
export function mapEquals(first: Map<string, any>, second: Map<string, any>) {
  if (first.size != second.size) return false;
  for (const [key, value] of first) {
    if (value !== second.get(key)) return false;
  }
  return true;
}

export function convertToType(value: string, type: string) {
  switch (type) {
    case "string":
      return value as string;
    case "number":
      return Number.parseInt(value);
    case "boolean":
      return !!value;
    case "array":
      return value.split(",");
    default:
      throw new Error("Invalid type!");
  }
}
