import z from "zod";

export type Metadata = {
  [K in keyof typeof metadataSchema]: typeof metadataSchema[K]["_type"];
};

export type MetadataKey = keyof Metadata;

const metadataSchema = {
  _version: z.number()
};

export function isMetadataKey(key: string): key is MetadataKey {
  return Object.keys(metadataSchema).includes(key);
}
