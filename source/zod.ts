import z from "zod";
import { JSONValue } from "types-json";

type InnerSchema = z.ZodType<JSONValue> | {
  [key: string]: z.ZodType<JSONValue>;
};

type TableItemResult<I extends InnerSchema> = I extends z.ZodRawShape ? z.ZodObject<I> : I;

export function arrayTable<I extends InnerSchema>(schema: I): z.ZodArray<TableItemResult<I>> {
  if(schema instanceof z.ZodType) {
    return z.array(schema) as z.ZodArray<TableItemResult<I>>;
  } else {
    return z.array(z.object(schema)) as z.ZodArray<TableItemResult<I>>;
  }
}

export function recordTable<I extends InnerSchema>(schema: I): z.ZodRecord<z.ZodString, TableItemResult<I>> {
  if(schema instanceof z.ZodType) {
    return z.record(schema) as z.ZodRecord<z.ZodString, TableItemResult<I>>;
  } else {
    return z.record(z.object(schema)) as z.ZodRecord<z.ZodString, TableItemResult<I>>;
  }
}
