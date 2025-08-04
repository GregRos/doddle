# Doddle

[![Doddle workflow status](https://img.shields.io/github/actions/workflow/status/GregRos/doddle/push.yaml?style=for-the-badge)](https://github.com/GregRos/doddle/actions/workflows/push.yaml)
[![Doddle package version](https://img.shields.io/npm/v/doddle?style=for-the-badge)](https://www.npmjs.com/package/doddle)
[![Codacy coverage](https://img.shields.io/codacy/coverage/7650988ddf4741639fe6140bc28ff650?style=for-the-badge)](https://app.codacy.com/gh/GregRos/doddle/coverage)
[![Doddle minified size(gzip)](https://img.shields.io/bundlejs/size/doddle?exports=seq,doddle&style=for-the-badge&label=gzip)](https://bundlejs.com/?q=doddle&treeshake=%5B%7Bseq%2Cdoddle%7D%5D)

[**Reference**](https://gregros.github.io/doddle/)

Doddle is a tiny yet feature-packed (async) iteration toolkit, designed to make working with iterables as simple as possible.

Here are some of its features:

- 🪞 One consistent API shared between sync and async iterables.

- 🤏 Tiny bundle size, without compromising user experience.

- 🔥 Packed with operators from the best APIs in software.

- 🛡️ Strongly typed and extensively validated.

It’s inspired by popular libraries like LINQ, lodash, and rxjs.

Get it now:

```bash
# yarn
yarn add doddle

# npm
npm install doddle
```

## How operators work
Doddle offers its functionality through *operators*. These operators transform or reduce iterables in various ways. There are lots of them, but they all share a set of common principles.

Operators are methods defined on [wrapper objects](#how-wrappers-work) as instance methods, making them easy to find and invoke. There are two of these wrappers:

- **[Seq](https://gregros.github.io/doddle/classes/Seq.html)**, which is used for sync iterables.
- **[ASeq](https://gregros.github.io/doddle/classes/ASeq.html)**, which is used for async iterables.

They have exactly the same members, except that **ASeq** accepts functions (like projections or predicates) that return promises.

To see a complete list of operators, check out the linked API reference documentation.
### All operators are lazy
Operators never do anything directly. Instead, they return objects that must be evaluated. This gives you a lot of control over when side-effects happen.

For example, operators that return Iterables, such as `map`, must be iterated. The function gets called on an element right before iteration reaches it!

```ts
import { seq } from "doddle"
const result = seq([1, 2, 3]).map(x => {
    console.log("I'm a side-effect!")
    return x
})
// Nothing happens until we iterate over it:
for (const x of result) {
    // Repeatedly prints 'I'm a side-effect.'
}
```

Operators that don't return Iterables instead return a lazy primitive called a **Doddle**. You need to call the Doddle’s `pull` method to run to computation and get the result:

```ts
import { seq } from "doddle"
const minimum = seq([3, 2, 1]).each(() => {
    console.log("I'm a side-effect!")
}).minBy(x => x)

// Nothing happens until we pull:
console.log(
    `The minimum value was ${minimum.pull()}`
)
```

We’ll talk more about Doddles later.
### All operators are debuggable
Have you ever stared at a stack trace from an async library and couldn’t understand anything?

Doddle isn’t like that. It produces legible stack traces with one entry per operator, even when minified:

```txt
Error    
    at async ASeq.each (src\seqs\aseq.class.ts:380:21)
    at async ASeq.concatMap (src\seqs\aseq.class.ts:307:30)
    at async ASeq.filter (src\seqs\aseq.class.ts:432:30)
    at async ASeq.each (src\seqs\aseq.class.ts:378:30)
```

Not only that – each operator also validates its inputs and throw descriptive errors that explain three critical things:

- Which operator was involved
- What went wrong
- Where it happened

Here’s how one looks like:

```txt
argument 'projection' of operator 'ASeq.map' must be a function but got "hello world"
```

## How wrappers work
You create wrappers using the functions:

- **[seq](https://gregros.github.io/doddle/functions/seq.html)** for creating the **Seq** wrapper.
- [**aseq**](https://gregros.github.io/doddle/functions/aseq.html) for the **ASeq** wrapper.

Each function is a bit different in what in accepts, since the **seq** function only works with sync inputs. But neither just accepts iterables — they accept generator functions, array-like collections, and other stuff.

**However, neither accepts strings.** This because JavaScript will eagerly convert objects and other values to strings when you least expect it. If these strings are then treated as collections, you end up with lots of hard to track bugs.

Meanwhile, parsing strings using a library like `doddle` doesn’t really make much sense.

```ts
// ‼️ DoddleError: Strings not allowed
seq("this will error")
// TypeScript: Type `string` is not assignable to type ...
```

### seq
Let’s take a look at some of the things **seq** accepts. We’ll start with an Iterable, like an array:

```ts
seq([1, 2, 3])
```

Try a generator function. This works perfectly:

```ts
seq(function* () {
    yield 1
    yield 2
})
```

But generator functions are just functions that return iterables. So you can pass one of those instead:

```ts
seq(() => [1, 2, 3])
```

The function will be called every time the **Seq** is iterated over

You can pass it a **Doddle** that returns an Iterable too:

```ts
const doddle1 = doddle(() => 1)
const doddle123 = doddle(() => [1, 2, 3])
seq(doddle(() => [1, 2, 3]))
```

You can also pass it an array-like object, which works with `NodeList` and similar:

```ts
const s3 = seq({
    0: 1,
    1: 1,
    2: 3,
    length: 3
}) // {1, 2, 3}
```

### aseq
This function accepts everything that **seq** does, as well as async variations on those things.

That means async generator functions:

```ts
aseq(async function* () {
    yield 1
    yield 2
})
```

Async iterables:

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

You can also insert **Doddles** all over the place. **aseq** will flatten all of them.

## The Doddle
The **[Doddle](https://gregros.github.io/doddle/classes/Doddle.html)** is the library’s flagship lazy primitive. It’s simple, flexible, and really expressive. Its API is heavily inspired by Promises.

Lazy primitives are common in most programing languages. They represent values that are only produced when they are needed, as well as computations that only happen once.

You can get a **Doddle** to produce a value by calling its `pull` method:

```ts
const aDoddle = seq([1, 2, 3]).first()
aDoddle.pull()
```

You can create one using the **[doddle](https://gregros.github.io/doddle/functions/doddle.html)** function, which accepts a callback that will be invoked the first time the `pull` method is called.

```ts
doddle(() => {
    // Expensive computation
    return 10 ** 5 / 2 
})
```

The same **Doddle** works for both sync and async computations. An async **Doddle** is one that yields a `Promise`. This variation is lovingly nicknamed `DoddleAsync`:

```ts
type DoddleAsync<T> = Doddle<Promise<T>>
```

**Doddles** chain and flatten both with themselves and with Promises. Here is an example of chaining through several levels of these types:

```ts
await doddle(async () => {
    return doddle(() => 1)
}).pull() // 1

await doddle(() => {
    return doddle(async () => 100)
}).pull() // 100
```

### Operators
**Doddles** support several really useful operators of their own. For example, [map](https://gregros.github.io/doddle/classes/Doddle.html#map) lets you transform the result of a **Doddle** without actually pulling it. It works similarly to `Promise.then`.

```ts
doddle(() => 1).map(x => x + 1).pull() // 2
```

When the input **Doddle** is async, the projection receives the *awaited value* of the **Doddle** rather than the promise itself.

```ts
await doddle(async () => 1).map(x => x + 1).pull() // 2
```

This makes it easy to chain `map` operators even when the input is async:

```ts
await doddle(async () => 1)
    .map(x => x + 1)
    .map(x => `${x}`)
    .pull() // "2"
```

Check out the reference to see all the operators a **[Doddle](https://gregros.github.io/doddle/classes/Doddle.html)** supports.

## More about ASeq
The **ASeq** wrapper is a very powerful tool for working with async iterables, but it’s one designed for ease of use and not robust stream processing. Let’s look at some of its features.

### Full promise support
Any function that is used as an argument for an **ASeq** operator can return a Promise. That includes something like `map`:

```ts
aseq([1, 2, 3]).map(async x => x + 1) // (2, 3, 4)
```

As well as `filter`, `some`, and everything else.

```ts
aseq([1, 2]).filter(async x => x > 1) // (2)
aseq([1, 2]).some(async x => !!x).pull() // true
```

When **ASeq** encounters a Promise like this, it will await it before continuing to iterate over the input. This happens even if the return value of the function isn’t used, like with the `each` operator:

```ts
import { setTimeout } from "timers/promises"

aseq([1, 2, 3]).each(async () => {
    await setTimeout(100)
})
```

This means that **ASeq** is not good at I/O heavy stream processing, since it will just end up awaiting every operation. You’re better off sticking with rxjs for that kind of thing, at least for now.

### Avoiding double async code
You’ll often find yourself using `aseq` inside an async function, after awaiting something.

Here is an example:

```ts
async function example() {
    const strings = await getStrings()
    return aseq(strings).map(x => x.toUpperCase())
}
```

But this code returns a `Promise<ASeq<string>>`, which is really annoying to work with.

There is a better way, though! You can just put the `await` *inside* the definition of the sequence, like this:

```ts
function example() {
    return aseq(async () => {
        const strings = await getStrings()
        return aseq(strings).map(x => x.toUpperCase())
    })
}
```

The `aseq` function will flatten the entire thing, giving you a simple `ASeq<string>`. The async function will only be executed if and when the Iterable is actually used.
