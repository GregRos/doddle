# Doddle

[![Doddle workflow status](https://img.shields.io/github/actions/workflow/status/GregRos/doddle/push.yaml?style=for-the-badge)](https://github.com/GregRos/doddle/actions/workflows/push.yaml)
[![Doddle package version](https://img.shields.io/npm/v/doddle?style=for-the-badge)](https://www.npmjs.com/package/doddle)
[![Doddle Coveralls](https://img.shields.io/coverallsCoverage/github/GregRos/doddle?style=for-the-badge)](https://coveralls.io/github/GregRos/doddle?branch=master)
[![Doddle minified size(gzip)](<https://img.shields.io/bundlejs/size/doddle?exports=aseq&style=for-the-badge&label=minified%20size%20(gzip)>)](https://bundlejs.com/?q=doddle&treeshake=%5B%7Bseq%2Caseq%7D%5D)

Doddle is a tiny yet feature-packed library for iteration and lazy evaluation, inspired by `lodash`, `LINQ`, and `rxjs`.

-   🤏 **Miniscule** — Tiny bundle size — without compromising user experience.

-   🧰 **Powerful** — Packed with operators from the best APIs in software.

-   📜 **Friendly** — Strong typing combined with clear and detailed error messages.

-   🪞 **Consistent** — An elegant API shared between sync and async iterables.

-   🔍 **Debuggable** — With _readable_ stack traces and _navigable_ source code.

-   🧪 **Tested** — With over 1000 test cases, ensuring the consistency of both runtime code and type declarations.

-   🛡️ **Immutable** — Works via _composition_, not _mutation_.

Get it now:

```bash
yarn add doddle
```

# Doddle

The library’s general-purpose lazy primitive. Represents a computation that may not have happened yet. You need to _pull_ it to get the value out.

```ts
import { doddle } from "doddle"

const d = doddle(() => {
    console.log("evaluated when pulled")
    return 5
})

d.pull() // 5
```

Commonly used throughout the API. It's simple, elegant, and really comes in handy. [See more](https://github.com/GregRos/doddle/doddle.md)

# Seq

The `Seq` wrapper unifies synchronous iterables and generator functions. You create one using the `seq` constructor function.

This function accepts lots of different inputs that can be interpreted as an Iterable. For example:

```ts
import { seq } from "doddle"

// # Array
const s1 = seq([1, 2, 3]) // {1, 2, 3}

// # Generator function
const s2 = seq(function* () {
    yield 1
    yield 2
    yield 3
}) // {1, 2}

// # Array-like object
const s3 = seq({
    0: 1,
    1: 1,
    2: 3,
    length: 3
}) // {1, 2, 3}
```

Wrapping something using `seq` has no side-effects.

## Operators

The `Seq` wrapper comes with a comprehensive set of operators. These operators all have the same traits:

-   **Instance:** They’re instance methods, making them easier to use and discover.
-   **Careful:** They never iterate more than you tell them to.
-   **Flexible:** Accept flexible inputs, the same way as `seq`. They also interop seamlessly with the Doddle lazy primitive.
-   **Debuggable:** Produce legible stack traces; written in debug-friendly code.

They're also **Lazy**. That means they return one of two things:

-   Another Seq, which needs to be iterated for anything to happen.
-   A [Doddle](https://github.com/GregRos/doddle/blob/master/doddle.md), which needs to be _pulled_.

This separates _defining a computation_ from _executing it_. It also means that many operators work just fine with infinite inputs.

### ⚠️ string inputs

A pretty common bug happens when a string gets passed where a collection is expected. This usually doesn't cause an error,
and instead you get `s,t,u,f,f, ,l,i,k,e, ,t,h,i,s`.

Doddle doesn't do this. Both its type declarations and runtime logic _exclude string inputs_.

If you actually want to process a string by character, convert it into an array first. One of these should work:

```ts
seq("hello world".split(""))
seq([..."abc"])
```

# ASeq

This wrapper is an async version of `Seq`, built for asynchronous iterables and similar objects. You create one using the `aseq` constructor function.

This function accepts everything that `seq` accepts, plus async variations on those things. That includes:

```ts
import { aseq, seq } from "doddle"

// Array
aseq([1, 2, 3]) // {1, 2, 3}

// Generator function
aseq(function* () {
    yield* [1, 2, 3]
}) // {1, 2, 3}

// Async generator function
aseq(async function* () {
    yield* [1, 2, 3]
}) // {1, 2, 3}

// Iterable
aseq(seq([1, 2, 3]))

// Async iterable
aseq(aseq([1, 2, 3]))
```

## Operators

**ASeq** wrapper comes with a carbon copy of all the operators defined on **Seq**, but tweaked for inputs that can be async.

So, for example, `ASeq.map` accepts async functions, flattening them into the resulting async Iterable:

```ts
aseq([1, 2, 3]).map(async x => x + 1) // {2, 3, 4}
```

They're easy to navigate because the operators are named the same and have almost the same signatures.

## Non-concurrent

ASeq will always await all promises before continuing the iteration. This means that something like this will wait 100ms before each element is yielded:

```ts
function sleep(t: number) {
    return new Promise(resolve => setTimeout(resolve, t))
}
await aseq([1, 2, 3])
    .map(async x => {
        await sleep(100)
        return x
    })
    .toArray()
    .pull()
```

As opposed to something like this, which will wait only 100ms in total:

```ts
await Promise.all(
    [1, 2, 3].map(async x => {
        await sleep(100)
        return x
    })
)
```

This is by design, since it has several advantages:

-   Elements will never be yielded out of order.
-   It doesn’t require a cache to keep concurrent promises.
-   The logic of each operator is identical to its sync counterpart, enabling code reuse.
-   Legible stack traces and debuggable code.

That does mean that `aseq` can’t be used for concurrent processing in the same way as `rxjs`.

That functionality is saved for a future out-of-order, highly concurrent version of `aseq` that's currently in the works.
