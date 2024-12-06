# stdlazy

A TypeScript-first lazy primitive that brings all the best bits of promises to lazy evaluation.

-   🦥 On-demand evaluation.
-   ⌚ Support for async initializers.
-   ⚙️ Multiple strongly-typed operators.
-   🫥 Use the `Lazy` type directly or return it as a `() => T` for a cleaner API.

## Install

Using yarn:

```typescript
yarn add stdlazy
```

Or npm:

```typescript
npm install --save stdlazy
```

## Pullables

A _Pullable_ is an object that provides a `pull()` that returns a value, which is also called its _pull value_. The `pull` method is **idempotent** – calling it more than once should return the same result and cause no additional side-effects.

Like a _Thenable_, a _Pullable_ will never produce another _Pullable_. If this would happen, it will instead **pull** it by invoking the `pull()` method, and return whatever it returns. This means _Pullables_ can be chained transparently, just like promises.

The type operator that gives the _pull value_ of a type `T` (which might be a _Pullable_) is `Pulled<T>`. It works just like `Awaited<T>`

The `Lazy` object offered by `stdlazy` is a _Pullable_, but has a lot more functionality besides.

## Construction

Use the `lazy` factory function to wrap another function. This function can be sync or async, and can even return another _Pullable_ that will be flattened.

```typescript
import { lazy } from "stdlazy"

const lz = lazy(() => 1) satisfies Lazy<number>

const lzLz = (lazy(() => lazy1).pull() + 1) satisfies number

const lzAsync = lazy(async () => 1) satisfies LazyAsync<number>
```

`stdlazy` uses the same type – `Lazy<T>` – to represent both sync and async lazy values. An async lazy value is just a `Lazy<Promise<T>>`, which is also referred under the alias `LazyAsync<T>`.

This is also known as its **FINAL FORM**. The factory function will flatten all standard compositions of the `Lazy` and `Promise` types into this **FINAL FORM**.

```typescript
lazy(async () => {
    return lazy(async () => {
        return 5
    })
}) satisfies LazyAsync<number>
```

## Operators

The `Lazy` type implements several operators for working with lazy values.

### Map

_Project the (awaited) pull value of a Lazy instance._

```typescript
// The operator projects the Pulled value of a Lazy:
const lz = lazy(() => 1).map(x => x + 1)
console.log(lz.pull()) // 2

// If the lazy is async, it projects that Pulled and Awaited value instead, cutting through both container types.
const asyncLz = lazy(async () => 1).map(x + 1)
console.log(await lz.pull()) // 2
```

The `map` operator creates a new `Lazy` value, backed by an existing one. When it’s **pulled**, it will **pull** the existing instance and project its (awaited) pull value using a function.

This callback won’t be executed until the `pull()` method on the outermost `Lazy` instance is called and, if it returns a Promise, that Promise resolves.

If the projection returns another _Pullable_, its `pull()` method will be called automatically. This allows chaining _Pullables_ just like chaining promises.

If either the current `Lazy` instance or the projection is async, the result will be a `LazyAsync`.

-   [`Array#map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
-   [`Promise#then`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)

### Do

_Perform an action with the (awaited) pull value of a Lazy instance._

```typescript
const lz = lazy(() => 1).do(console.log)
console.log(lz.pull()) // 1
```

The `do` operator produces a new `Lazy` instance, backed by an existing one. When it’s **pulled**, it will **pull** the existing instance and invoke the given callback before producing the value unchanged.

-   [`rxjs/do`](https://www.learnrxjs.io/learn-rxjs/operators/utility/do)

If either the current `Lazy` instance or the callback is async, the result will be `LazyAsync`.

### Zip

_Combines a `Lazy` with one or more other Pullables into a single `Lazy` value._

```typescript
const lz1 = lazy(() => 1)
const lz2 = lazy(() => 2)
const zipped = lz1.zip(lz2)
console.log(zipped.pull()) // [1, 2]
```

The `zip` operator zips together an existing `Lazy` value with other _Pullables_, producing a single `Lazy` producing an array of their values, in the order in which they were specified.

-   [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
-   [`_.zip`](https://lodash.com/docs/4.17.15#zip)
-   [`rxjs/zip`](https://www.learnrxjs.io/learn-rxjs/operators/combination/zip)
-   Python [`zip`](https://docs.python.org/3.3/library/functions.html#zip)

If any of the `Lazy` instances involved are async, the result will be a `LazyAsync`.

### Assemble

_Combine multiple pullables into a single pullable returning an object_

```typescript
const lz1 = lazy(() => 1)
const lz2 = lazy(() => "hello")
const assembled = lz1.assemble({
    other: lz2
})
console.log(assembled.pull()) // {this: 1, other: "hello"}
```

The `assemble` operator combines an existing `Lazy` instance with other _Pullables_, given as an object with _Pullable_ values. It returns a single `Lazy` instance with the same keys and the values replaced by the pull values of each of them _Pullables_

The `Lazy` instance on which the operation was performed is considered to have the key `this`

If any of hte `Lazy` instances involved are async, the result will be `LazyAsync`.
