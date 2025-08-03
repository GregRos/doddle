# Doddle

Doddle offers a lazy primitive, called the `Doddle`, which is a key part of many APIs. However, it’s designed for general use, and you might find using it a lot in your own code.

Here’s how you make one:

```ts
import { doddle } from "doddle"

const lazy = doddle(() => {
    console.log("evaluated when pulled")
    return 5
})
```

A `Doddle` represents a computation that hasn’t happened yet. It’s kind of like a function, but it follows additional rules:

- **Nullary:** It doesn’t accept any arguments.
- **Memoized:** The computation is only ever executed once. The result is cached.
- **Chained:** Like a promise, a `Doddle` doesn’t nest. It always chains or flattens. We’ll see how that works a bit later.

To get the value from a `Doddle`, possibly invoking the computation in the process, you use the `pull` method or a function with the same name:

```ts
import { pull } from "doddle"
const d = doddle(() => 5)
const r1 = d.pull()
const r2 = pull(d)
```

Doddles are inspired by promises, and do kind of resemble them. Specifically, they **flatten** or **chain**.

This means that something like this doesn’t result in a nested `Doddle`. It just results in a `Doddle` that resolves to `5`:

```ts
doddle(() => {
    return doddle(() => 5)
}).pull() // 5
```

Unlike a `Promise`, though, a `Doddle` can be either sync or async.

## Async doddles

An async `Doddle` is just a `Doddle` that yields a `Promise`. It’s also aliased as `DoddleAsync<T>`.

The simplest way to make one is to call `doddle` on an async function. To get the resolved value, you’ll need to both `pull` and `await` the Doddle:

```ts
const thisIsAsync: DoddleAsync<number> = doddle(async () => 5)

const r1: number = await thisIsAsync.pull()
```

To keep things simple, the library will normalize all other nestings of `Promise` and `Doddle` to `DoddleAsync<T>`. So you won’t have to worry about something like `Promise<Doddle<T>>`.

## Operators

Promises support operators like `then` and `catch`; Doddles support operators too. These operators never actually pull the `Doddle`, so they never cause the computation to occur. They just project the result in some way.

The classic example is the `map` operator, which is the equivalent of `Promise.then`. It projects the result of a `Doddle` using a function. When the resulting `Doddle` is pulled, the source is pulled as well.

```ts
doddle(() => 5)
    .map(x => x + 1)
    .pull() // 6
```

All operators flatten Doddles, so something like this won’t result in nesting:

```ts
const d1 = doddle(() => 5)
const d2 = doddle(() => 6)
const d3 = d1.map(() => d2)
d3.pull() // 6
```

### Async cases

Operators work somewhat differently for async Doddles.

Instead of projecting the actual value (which is a Promise), operators always project the _awaited_ value. This makes a lot of sense and is almost always what you want.

Take a look:

```ts
const d1 = doddle(async () => 5) // async Doddle
const d2 = d1.map(x => x + 1) // increment
await d2.pull() // 6
```

You can also use async functions wherever you’d use non-async functions. If your Doddle was originally sync, it will become async.

```ts
const d1 = doddle(() => 5)
const d2 = d1.map(async x => x + 1)
await d.pull() // 6
```

For operators accepting multiple Doddles and/or functions, the result will be async if any of the inputs is async. Like this:

```ts
const d1 = doddle(() => 1)
const d2 = doddle(async () => 2)

// When zipped together, the result is async:
const d3 = d1.zip(d2)

await d3.pull() // [1, 2]
```
