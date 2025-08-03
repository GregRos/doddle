# Doddle

[![Doddle workflow status](https://img.shields.io/github/actions/workflow/status/GregRos/doddle/push.yaml?style=for-the-badge)](https://github.com/GregRos/doddle/actions/workflows/push.yaml)
[![Doddle package version](https://img.shields.io/npm/v/doddle?style=for-the-badge)](https://www.npmjs.com/package/doddle)
[![Codacy coverage](https://img.shields.io/codacy/coverage/7650988ddf4741639fe6140bc28ff650?style=for-the-badge)](https://app.codacy.com/gh/GregRos/doddle/coverage)
[![Doddle minified size(gzip)](https://img.shields.io/bundlejs/size/doddle?exports=seq,doddle&style=for-the-badge&label=gzip)](https://bundlejs.com/?q=doddle&treeshake=%5B%7Bseq%2Cdoddle%7D%5D)
[![Codacy grade](https://img.shields.io/codacy/grade/7650988ddf4741639fe6140bc28ff650?style=for-the-badge)](https://app.codacy.com/gh/GregRos/doddle/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

Doddle is a tiny yet feature-packed iteration toolkit. It’s inspired by LINQ, lodash, and rxjs.

Here are some of its features:

-   🤏 Tiny bundle size, without compromising user experience.
-   🔥 Packed with operators from the best APIs in software.
-   🤗 Strongly typed and extensively validated. Throws meaningful errors too.
-   🪞 One consistent API shared between sync and async iterables.
-   🔍 Produces concise, readable stack traces.

Get it now:

```bash
# yarn
yarn add doddle

# npm
npm install doddle
```

## The Doddle

The Doddle is the library’s lazy primitive. It represents a delayed computation, just like a function.

When a Doddle is _pulled_, it’s evaluated and the result is cached. Evaluation only happens once.

The Doddle is designed like a Promise. It chains, flattens, and supports several useful operators. Its key method is `pull()`. It’s designed for both sync and async computations.

You can create one using the `doddle` function, passing it a function that will produce the value. This function can return a Promise.

```ts
import { doddle } from "doddle"

const d = doddle(() => {
    console.log("evaluated when pulled")
    return 5
})

d.pull() // 5
```

Doddles are used throughout the sequence API, but they really come in handy outside it too. [Read more!](https://github.com/GregRos/doddle/doddle.md)

## Seq

This wrapper unifies iterables and generator functions. You create one using the `seq` function.

You can pass this function an Iterable, like an array:

```ts
seq([1, 2, 3])
```

Or a generator function:

```ts
seq(function* () {
    yield 1
    yield 2
})
```

`seq` is a lot more flexible than that, though. You can even pass it a function that returns an array instead of a generator:

```ts
seq(() => [1, 2, 3])
```

You can pass it a `Doddle` that returns an Iterable too:

```ts
const doddle1 = doddle(() => 1)
const doddle123 = doddle(() => [1, 2, 3])
seq(doddle(() => [1, 2, 3]))
```

You can also pass it an array-like object:

```ts
const s3 = seq({
    0: 1,
    1: 1,
    2: 3,
    length: 3
}) // {1, 2, 3}
```

But you **can’t** pass it a string!

Although strings are iterable, they’re rarely used that way, and treating them as collections just causes lots of bugs.

`seq` doesn’t accept strings and trying to pass one will error both during compilation and at runtime:

```ts
// ‼️ DoddleError: Strings not allowed
seq("this will error")
// TypeScript: Type `string` is not assignable to type ...
```

### Operators

The `Seq` wrapper comes with a comprehensive set of operators. These are all instance methods, making them easy to discover and call.

They never iterate more than they need to and they produce legible stack traces (there is almost always one entry per operator).

They're also **Lazy**. That means they return one of two things:

-   Another Seq, which needs to be iterated for anything to happen.
-   A [Doddle](https://github.com/GregRos/doddle/blob/master/doddle.md), which needs to be _pulled_.

This lets you control exactly when the operation is computed.

## ASeq

This wrapper unifies **async iterables** and **async generator functions**, while also supporting any input that [Seq](#Seq) supports. You create one using the `aseq` function.

You can pass it an async generator:

```ts
aseq(async function* () {
    yield 1
    yield 2
})
```

An array:

```ts
aseq([1, 2, 3])
```

An async iterable:

```ts
aseq(aseq([1]))
```

An async function that returns an array:

```ts
aseq(async () => [1, 2, 3])
```

Or even an async function that returns an async Iterable:

```ts
aseq(async () => aseq([1, 2, 3]))
```

### Operators

The **ASeq** wrapper has the same API as **Seq**, except that all inputs can be async. That means:

-   You can pass async iterables instead of regular ones.
-   You can pass functions that return promises.

**ASeq** wrapper comes with a carbon copy of all the operators defined on **Seq**, but tweaked for inputs that can be async.

So, for example, `ASeq.map` accepts async functions and automatically flattens the resulting promise:

```ts
const example = aseq([1, 2, 3]).map(async x => x + 1)

for await (const x of example) {
    // 1, 2, 3
    console.log(x)
}
```

### Using in async code

You’ll often find yourself using `aseq` inside an async function, after awaiting something.

Here is an example:

```ts
async function example() {
    const strings = await getStrings()
    return aseq(strings).map(x => x.toUpperCase())
}
```

But this code returns a `Promise<ASeq<string>>`, which is really annoying to work with.

There is a better way, though! You can just put the `await` _inside_ the definition of the sequence, like this:

```ts
function example() {
    return aseq(async () => {
        const strings = await getStrings()
        return aseq(strings).map(x => x.toUpperCase())
    })
}
```

The `aseq` function will flatten the entire thing, giving you a simple `ASeq<string>`.

### Sequential

Lots of **ASeq** operators, like `ASeq.map` and `ASeq.each`, support functions that return promises.

When **ASeq** encounters one, it will await the resulting promise before continuing to iterate over the input. This happens even if the return value of the function isn’t used, like with the `each` operator:

```ts
import { setTimeout } from "timers/promises"

aseq([1, 2, 3]).each(async x => {
    await setTimeout(100)
})
```

This makes **ASeq** much easier to work with than observables, since stack traces will always point to where the error occurred and elements will always be yielded in the same order.

However, it does mean that **ASeq** is bad at async processing with I/O that can be parallelized, like this:

```ts
import { got } from "got"

// Don't do this if you care about performance
aseq([url1, url2, url3]).map(url => got(url))
```
