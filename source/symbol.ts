import { randomUUID } from "node:crypto";
import { OptionalJSONValue, NestedOptionalJSONArray, NestedOptionalJSONObject } from "types-json";

export type OrSymbol<T extends OptionalJSONValue> = T extends NestedOptionalJSONObject
  ? { [K in keyof T]: T[K] extends OptionalJSONValue ? OrSymbol<T[K]> : never; }
  : T | symbol;

export const symbols = {
  uuid: () => Symbol("uuid"),
  serialID: () => Symbol("serialID"),
  now: () => Symbol("now")
};

function valueAtPath(parent: OptionalJSONValue, path: string[] = []): OptionalJSONValue {
  const field = path[0];
  if(field === undefined) {
    return parent;
  } else if(typeof parent === "object" && parent !== null && parent !== undefined) {
    return valueAtPath((parent as any)[field], path.slice(1));
  } else {
    return undefined;
  }
}

export function now(): string {
  return new Date().toISOString();
}

export function uuid(data: NestedOptionalJSONArray, path: string[] = []): string {
  let result;
  while(result === undefined) {
    const attempt = randomUUID();
    if(data.every((item) => valueAtPath(item, path) !== attempt)) {
      result = attempt;
    }
  }
  return result;
}

export function serialID(data: NestedOptionalJSONArray, path: string[] = []): string {
  const ids = data.map((item) => {
    const value = valueAtPath(item, path);
    return value ? parseInt(value.toString()) : NaN;
  }).filter((id) => !isNaN(id));
  const max = Math.max(0, ...ids);
  return (max + 1).toString();
}
