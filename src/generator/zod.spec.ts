import {describe, expect, it} from "vitest";
import {schemaToZod} from "./zod";

describe("schemaToZod", () => {
  it("renders primitives", () => {
    expect(schemaToZod({type: "string"})).toBe("z.string()");
    expect(schemaToZod({type: "number"})).toBe("z.number()");
    expect(schemaToZod({type: "integer"})).toBe("z.number().int()");
    expect(schemaToZod({type: "boolean"})).toBe("z.boolean()");
  });

  it("renders string formats and enums", () => {
    expect(schemaToZod({type: "string", format: "date"})).toBe("z.coerce.date()");
    expect(schemaToZod({type: "string", format: "date-time"})).toBe("z.coerce.date()");
    expect(schemaToZod({type: "string", format: "url"})).toBe("z.string().url()");
    expect(schemaToZod({type: "string", enum: ["a", "b"]})).toBe('z.enum(["a", "b"])');
  });

  it("renders string constraints", () => {
    expect(schemaToZod({type: "string", minLength: 1, maxLength: 5})).toBe("z.string().min(1).max(5)");
    expect(schemaToZod({type: "string", pattern: "^a$"})).toBe('z.string().regex(new RegExp("^a$"))');
  });

  it("renders number constraints and enums", () => {
    expect(schemaToZod({type: "number", minimum: 0, maximum: 5})).toBe("z.number().min(0).max(5)");
    expect(schemaToZod({type: "integer", minimum: 1, exclusiveMinimum: true})).toBe("z.number().int().gt(1)");
    expect(schemaToZod({type: "number", enum: [1, 2]})).toBe("z.union([z.literal(1), z.literal(2)])");
    expect(schemaToZod({type: "integer", enum: [42]})).toBe("z.literal(42)");
  });

  it("applies nullable", () => {
    expect(schemaToZod({type: "string", nullable: true})).toBe("z.string().nullable()");
    expect(schemaToZod({type: "boolean", nullable: true})).toBe("z.boolean().nullable()");
  });

  it("renders arrays", () => {
    expect(schemaToZod({type: "array", items: {type: "string"}})).toBe("z.array(z.string())");
    expect(schemaToZod({type: "array"})).toBe("z.array(z.any())");
    expect(schemaToZod({type: "array", items: {type: "number"}, minItems: 1})).toBe("z.array(z.number()).min(1)");
  });

  it("renders model references", () => {
    expect(schemaToZod({type: "model", name: "Pet"})).toBe("PetSchema");
    expect(schemaToZod({type: "model", name: "Pet", nullable: true})).toBe("PetSchema.nullable()");
  });

  it("renders allOf, oneOf and anyOf", () => {
    expect(schemaToZod({type: "allOf", schemas: [{type: "model", name: "A"}, {type: "model", name: "B"}]})).toBe(
      "(ASchema.and(BSchema))",
    );
    expect(schemaToZod({type: "oneOf", schemas: [{type: "model", name: "A"}, {type: "model", name: "B"}]})).toBe(
      "z.union([ASchema, BSchema])",
    );
    expect(schemaToZod({type: "anyOf", schemas: [{type: "model", name: "A"}, {type: "model", name: "B"}]})).toBe(
      "z.union([ASchema, BSchema])",
    );
  });

  it("renders objects with properties", () => {
    const expr = schemaToZod({
      type: "object",
      properties: [
        {name: "id", required: true, schema: {type: "number"}},
        {name: "tag", required: false, schema: {type: "string"}},
        {name: "x-trace", required: false, schema: {type: "string"}},
      ],
    });
    expect(expr).toContain("id: z.number(),");
    expect(expr).toContain("tag: z.string().optional(),");
    expect(expr).toContain('"x-trace": z.string().optional(),');
    expect(expr.startsWith("z.object({")).toBe(true);
  });

  it("renders free-form objects", () => {
    expect(schemaToZod({type: "object"})).toBe("z.record(z.string(), z.any())");
  });

  it("renders an Xquik search request model", () => {
    const expr = schemaToZod({
      type: "object",
      properties: [
        {name: "q", required: true, schema: {type: "string", minLength: 1}},
        {name: "queryType", required: false, schema: {type: "string", enum: ["Latest", "Top"]}},
        {name: "limit", required: false, schema: {type: "integer", minimum: 1, maximum: 100}},
        {name: "x-api-key", required: false, schema: {type: "string"}},
      ],
    });

    expect(expr).toContain("q: z.string().min(1),");
    expect(expr).toContain('queryType: z.enum(["Latest", "Top"]).optional(),');
    expect(expr).toContain("limit: z.number().int().min(1).max(100).optional(),");
    expect(expr).toContain('"x-api-key": z.string().optional(),');
  });
});
