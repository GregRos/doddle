# Doddle

[![Doddle workflow status](https://img.shields.io/github/actions/workflow/status/GregRos/doddle/push.yaml?style=for-the-badge)](https://github.com/GregRos/doddle/actions/workflows/push.yaml)
[![Doddle package version](https://img.shields.io/npm/v/doddle?style=for-the-badge)](https://www.npmjs.com/package/doddle)
[![Doddle Coveralls](https://img.shields.io/coverallsCoverage/github/GregRos/doddle?style=for-the-badge)](https://coveralls.io/github/GregRos/doddle?branch=master)
[![Doddle minified size(gzip)](<https://img.shields.io/bundlejs/size/doddle?exports=aseq&style=for-the-badge&label=minified%20size%20(gzip)>)](https://bundlejs.com/?q=doddle&treeshake=%5B%7Bseq%2Caseq%7D%5D)

Doddle is a tiny and powerful library for _lazy computation_. It's inspired by `lodash`, `rxjs`, and .NET's `LINQ`.

# Sync and async

**Complete support for async iterables.**

Doddle provides two wrapper types --

-   **`Seq`** --- Manipulates sync iterables, created using the `seq` factory function.
-   **`ASeq`** --- Manipulates async iterables, created using the `aseq` factory function.

While they're different types, they provide a nearly identical API, with the same set of operators, just different return types.

## Seq

```ts
const pairsSync = seq([1, 2, 3, 4])
    .map(x => x + 1)
    .chunk(2)

for (const [a, b] of pairsSync) {
    console.log(`${a}, ${b}`)
}
```

You first convert an existing iterable to a `Seq` using the `seq` factory function. This gives you access to a host of powerful and comprehensively tested operators, implemented as convenient instance methods.

**All operators are lazy** -- which means they have to be evaluated explicitly. This usually means iterating over the `Seq`.

The `seq` factory function accepts a range of other inputs besides iterables. You can give it iterators, generator functions, and just functions that return collections.

```ts
seq([1, 2, 3])

seq(function* () {
    yield 1
    yield 2
    yield 3
})

seq(() => [1, 2, 3])
```

You can **construct** sequences using methods defined on the `seq` factory function itself.

```ts
seq.range(1, 10) // Gives the range 1 .. 10

seq.of(1, 2, 3, 5) // Specify elements explicitly
```

## ASeq

```ts
const pairsAsync = aseq([1, 2, 3, 4])
    .map(x => x + 1)
    .chunk(2)

for await (const [a, b] of pairsAsync) {
    console.log(`${a}, ${b}`)
}
```

This wrapper lets you manipulate async iterables just like sync ones. It supports the same set of methods, just with different return types!

# Laziest of them all

**Doddle is the laziest library.**

Doddle doesn't provide any eager operations. Operators like `find` or `includes`, which normally iterate immediately, instead return Doddle's elegant lazy primitive, so invoking them doesn't do anything by itself.

You have to `pull` the lazy primitive (which is also called a `Doddle`) to evaluate the operator, giving you explicit control over when iteration occurs.

It's perfect for when iteration causes side-effects, such as dealing with binary streams, generator functions, and database query results.

```ts
import { seq, type Doddle } from "doddle"

// This returns the Doddle lazy primitive:
const mySeq: Doddle<number> = seq([1, 2, 3, 4]).includes(2)

// This *pulls* the value out of it:
console.log(mySeq.pull())
```

# Flexible inputs

Doddle works with a wide variety of inputs, which it will carefully normalize

-   Iterable collections
-   Other iterables
-   Generator functions and functions returning

# Instance methods

Here is an example of using Doddle to manipulate an iterable.

```ts
import { seq } from "doddle"
function* iterable() {
    yield* [1, 2, 3, 4, 5, 6]
}
const it = seq(iterable)
    .filter(x => x % 2 == 0)
    .chunk(2)

for (const [a, b] of it) {
    console.log(`First is ${a} second is ${b}`)
}
```

# Doddle is complete

Doddle is a single **complete** package for manipulating sequences. You can't import specific operators like in `rxjs` or `lodash` -- they're all instance methods, more or less entirely contained in several big files.

Doddle can get away with it by being ridiculously small. Tests have shown that making it tree-shakable on that level greatly increases bundle size.

When you use doddle, you don't pick and choose the functionality you expect you need

Doddle aims to be a complete package for manipulating sequences. You don't need to pick the specific functionality you need because the package is so small tree-shaking it on that level will just increase the bundle size.

Doddle consists of three modules that are tree-shakeable

It also introduces a simple yet elegant lazy primitive, the `doddle`. It works for both

Doddle is a tiny but incredibly versatile library for working with collections and iterables, inspired by `LINQ`, `lodash`, `rxjs`, and other libraries. It also introduces its own simple yet elegant lazy primitive, which has many of the same qualities as a promise.

Doddle reproduces much of lodash's functionality for working with collections, but it's absolutely tiny. It offers its operators as instance methods because breaking them up into separate files has been shown to increase bundle size through overhead.

However, becuase it operates on iterables rather than on arrays directly, it will most likely be outperformed by other libraries.

Doddle is extensively tested, with over 1000 individual test cases. It also has a suite of [compile-time tests](https://github.com/GregRos/declare-it) that check the logic of its type definitions.

Doddle has been designed to be debuggable. It produces readable stack traces that mirror the code you write, and you can easily jump to, inspect, and place breakpoints in its source code.
