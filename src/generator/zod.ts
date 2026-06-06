import {Schema} from "@automatons/parser";

/** A property name is safe as a bare object key when it is a valid JS identifier. */
const quoteKey = (name: string): string => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : `"${name}"`);

const nullable = (expr: string, schema: {nullable?: boolean}): string =>
  schema.nullable ? `${expr}.nullable()` : expr;

/**
 * Render a parser Schema (a discriminated union) as a zod schema expression string.
 * Mirrors schemaToType in the client generators, but targets runtime zod schemas.
 */
export const schemaToZod = (schema: Schema): string => {
  switch (schema.type) {
    case "model":
      return nullable(`${schema.name}Schema`, schema);
    case "object": {
      if (schema.properties && schema.properties.length) {
        const props = schema.properties
          .map((property) => {
            const value = schemaToZod(property.schema);
            return `${quoteKey(property.name)}: ${property.required ? value : `${value}.optional()`},`;
          })
          .join("\n");
        return nullable(`z.object({\n${props}\n})`, schema);
      }
      return nullable("z.record(z.string(), z.any())", schema);
    }
    case "allOf": {
      const [first, ...rest] = schema.schemas.map(schemaToZod);
      const base = rest.reduce((acc, current) => `${acc}.and(${current})`, first ?? "z.unknown()");
      return nullable(rest.length ? `(${base})` : base, schema);
    }
    case "oneOf":
    case "anyOf": {
      const parts = schema.schemas.map(schemaToZod);
      const expr = parts.length > 1 ? `z.union([${parts.join(", ")}])` : (parts[0] ?? "z.unknown()");
      return nullable(expr, schema);
    }
    case "array": {
      const items = schema.items ? schemaToZod(schema.items) : "z.any()";
      let expr = `z.array(${items})`;
      if (schema.minItems !== undefined) expr += `.min(${schema.minItems})`;
      if (schema.maxItems !== undefined) expr += `.max(${schema.maxItems})`;
      return nullable(expr, schema);
    }
    case "boolean":
      return nullable("z.boolean()", schema);
    case "string": {
      if (schema.enum && schema.enum.length) {
        return nullable(`z.enum([${schema.enum.map((value) => `"${value}"`).join(", ")}])`, schema);
      }
      if (schema.format === "date" || schema.format === "date-time") {
        return nullable("z.coerce.date()", schema);
      }
      let expr = "z.string()";
      if (schema.format === "url") expr += ".url()";
      if (schema.minLength !== undefined) expr += `.min(${schema.minLength})`;
      if (schema.maxLength !== undefined) expr += `.max(${schema.maxLength})`;
      if (schema.pattern) expr += `.regex(new RegExp(${JSON.stringify(schema.pattern)}))`;
      return nullable(expr, schema);
    }
    case "integer":
    case "number": {
      if (schema.enum && schema.enum.length) {
        const expr =
          schema.enum.length > 1
            ? `z.union([${schema.enum.map((value) => `z.literal(${value})`).join(", ")}])`
            : `z.literal(${schema.enum[0]})`;
        return nullable(expr, schema);
      }
      let expr = "z.number()";
      if (schema.type === "integer") expr += ".int()";
      if (schema.minimum !== undefined) expr += schema.exclusiveMinimum ? `.gt(${schema.minimum})` : `.min(${schema.minimum})`;
      if (schema.maximum !== undefined) expr += schema.exclusiveMaximum ? `.lt(${schema.maximum})` : `.max(${schema.maximum})`;
      if (schema.multipleOf !== undefined) expr += `.multipleOf(${schema.multipleOf})`;
      return nullable(expr, schema);
    }
    default:
      throw new Error(`Unsupported schema type: ${(schema as {type: string}).type}`);
  }
};
