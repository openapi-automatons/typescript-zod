# @automatons/typescript-zod
[![CI/CD](https://github.com/openapi-automatons/typescript-zod/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/openapi-automatons/typescript-zod/actions/workflows/ci-cd.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm downloads](https://img.shields.io/npm/dw/@automatons/typescript-zod)](https://www.npmjs.com/package/@automatons/typescript-zod)

## What is @automatons/typescript-zod
This is a generator that emits [zod](https://zod.dev) schemas from an OpenAPI document's component schemas.
Only use openapi-automatons.

This package is **ESM-only** and requires **Node.js >= 22**.

For every model it emits a `XxxSchema` zod schema plus a `type Xxx = z.infer<typeof XxxSchema>`,
so the inferred static type and the runtime validator never drift apart.

`zod` is a peer dependency — install it alongside the generated output (`zod@^3 || ^4`).

## Generated schemas
```ts
import { PetSchema, type Pet } from "./models";

// runtime-validate an unknown payload
const pet: Pet = PetSchema.parse(await response.json());

// or non-throwing
const result = PetSchema.safeParse(payload);
if (!result.success) {
  // result.error
}
```

## How can I use @automatons/typescript-zod?
This library is designed to be used by [openapi-automatons](https://github.com/openapi-automatons/openapi-automatons).
Please read the [readme](https://github.com/openapi-automatons/openapi-automatons/blob/main/README.md) of [openapi-automatons](https://github.com/openapi-automatons/openapi-automatons) for how to use it.
