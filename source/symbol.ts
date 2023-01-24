import { JSONObject } from "types-json";
import { OptionalJSONValue } from "./utils.js";

export type OrSymbol<T extends OptionalJSONValue> = T extends JSONObject
  ? { [K in keyof T]: T[K] extends OptionalJSONValue ? OrSymbol<T[K]> : never; }
  : T | symbol;

export const symbols = {
  uuid: () => Symbol("uuid"),
  serialID: () => Symbol("serialID"),
  now: () => Symbol("now")
};

export function valueAtPath(parent: OptionalJSONValue, path: string[] = []): OptionalJSONValue {
  const field = path[0];
  if(field === undefined) {
    return parent;
  } else if(typeof parent === "object" && parent !== null && parent !== undefined) {
    return valueAtPath((parent as any)[field], path.slice(1));
  } else {
    return undefined;
  }
}
