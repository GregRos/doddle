# Doddle

[![Doddle workflow status](https://img.shields.io/github/actions/workflow/status/GregRos/doddle/push.yaml?style=for-the-badge)](https://github.com/GregRos/doddle/actions/workflows/push.yaml)
[![Doddle package version](https://img.shields.io/npm/v/doddle?style=for-the-badge)](https://www.npmjs.com/package/doddle)
[![Doddle Coveralls](https://img.shields.io/coverallsCoverage/github/GregRos/doddle?style=for-the-badge)](https://coveralls.io/github/GregRos/doddle?branch=master)
[![Doddle minified size(gzip)](<https://img.shields.io/bundlejs/size/doddle?exports=aseq&style=for-the-badge&label=minified%20size%20(gzip)>)](https://bundlejs.com/?q=doddle&treeshake=%5B%7Bseq%2Caseq%7D%5D)

Doddle is a tiny yet feature-packed library for iteration and lazy evaluation, inspired by `lodash`, `LINQ`, and `rxjs`.

-   🤏 Obsessively optimized for bundle size.

-   🧰 Packed with functionality, including operators from the best APIs in software.

-   📜 Comprehensive error reporting, with clear and detailed error messages.

-   🔍 Built for debuggability, with _readable_ stack traces and _navigable_ source code.

-   🧪 With over 1000 test cases, ensuring the consistency of both runtime code and type declarations.

Get it now:

```bash
yarn add doddle
```

# Doddle

The library’s flagship lazy primitive. Commonly used throughout the API, but designed to be as convenient as possible.

Represents a computation that may not have happened yet. To make it produce a value you call its `pull` method.

[More Info...](https://github.com/GregRos/doddle/doddle.md)

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
-   **Flexible:** Accept flexible inputs, the same way as `seq`. They also interop seamlessly with the [[doddle]] lazy primitive.
-   **Debuggable:** Produce legible stack traces; written in debug-friendly code.

In addition, all operators are **Lazy**. The return one of two things:

-   Another Seq, which has to be iterated for anything to happen.
-   A [[doddle|lazy primitive]], which must be _pulled_ explicitly to compute the operation.

This separates _defining a computation_ from _executing it_. It also means that many operators work just fine with infinite inputs.

# ASeq

This wrapper is an async version of `Seq`, built for asynchronous iterables and similar objects. You create one using the `aseq` constructor function.

This function also accepts everything that `seq` accepts, plus async variations on those things. That includes:

```ts
import { aseq, seq } from "doddle"

// An array
aseq([1, 2, 3]) // {1, 2, 3}

// Generator function
aseq(function* () {
    yield* [1, 2, 3]
}) // {1, 2, 3}

// Async generator function
aseq(async function* () {
    yield* [1, 2, 3]
}) // {1, 2, 3}

// Function returning an array
aseq(() => [1, 2, 3])

// Async function returning an array
aseq(async () => [1, 2, 3])
```

## Operators

**ASeq** wrapper comes with a carbon copy of all the operators defined on **Seq**, but tweaked for inputs that can be async.

So, for example, `ASeq.map` accepts async functions, flattening them into the resulting async Iterable:

```ts
aseq([1, 2, 3]).map(async x => x + 1) // {2, 3, 4}
```

These operators have the same names and functionality, with the bonus of accepting async variations.

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
-   It results in legible stack traces and debuggable code.

It does mean that `aseq` can’t be used for concurrent processing, like sending a bunch of requests at the same time.

That functionality is saved for a future out-of-order, highly concurrent version of `aseq` that’s currently in the works.

It will have similar operators, minus the ordering, and come with very different logic that probably won’t be as friendly.
