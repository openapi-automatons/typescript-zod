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
Each model becomes a `XxxSchema` plus an inferred `type Xxx`. The most natural place to use them
is the boundary where **untrusted data enters your app** — i.e. the request body you are about to
send (form input), validated at mutation time:

```ts
import { NewPetSchema, type NewPet } from "./models";

// validate user/form input before sending it
const body: NewPet = NewPetSchema.parse(formValues); // or .safeParse for non-throwing
await api.createPet(body);
```

It drops straight into react-hook-form…

```ts
const form = useForm<NewPet>({ resolver: zodResolver(NewPetSchema) });
```

…and pairs with the generated mutation from
[`@automatons/typescript-client-react-query`](https://github.com/openapi-automatons/typescript-client-react-query):

```ts
const { mutate } = useCreatePet();
const onSubmit = (values: unknown) => mutate([NewPetSchema.parse(values)]);
```

The same schemas can also be used **defensively on responses** to catch backend / contract drift
(optional — the generated client already types responses from the spec):

```ts
const pet = PetSchema.parse(await response.json());
```

## How can I use @automatons/typescript-zod?
This library is designed to be used by [openapi-automatons](https://github.com/openapi-automatons/openapi-automatons).
Please read the [readme](https://github.com/openapi-automatons/openapi-automatons/blob/main/README.md) of [openapi-automatons](https://github.com/openapi-automatons/openapi-automatons) for how to use it.
