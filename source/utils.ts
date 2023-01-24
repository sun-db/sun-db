import { JSONValue } from "types-json";

export type Optional<T> = T | undefined;

export type OptionalJSONArray = OptionalJSONValue[];
export type OptionalJSONObject = { [key: string]: OptionalJSONValue };

export type OptionalJSONValue = Optional<JSONValue | OptionalJSONArray | OptionalJSONObject>;
