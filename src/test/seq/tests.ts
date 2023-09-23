import { seq } from "@lib";

it("dematerializes", () => {
    const source = seq([1, 2, 3]);
    const result = source.dematerialize();
    expect([...result]).toEqual([
        { value: 1, done: false },
        { value: 2, done: false },
        { value: 3, done: false },
        { done: true }
    ]);
});

it("index", () => {
    const source = seq([1, 2, 3]);
    const result = source.index();
    expect([...result]).toEqual([
        [0, 1],
        [1, 2],
        [2, 3]
    ]);
});

it("first", () => {
    const source = seq([1, 2, 3]);
    const result = source.first().pull();
    expect(result).toEqual(1);
});

it("first with predicate", () => {
    const source = seq([1, 2, 3]);
    const result = source.first(x => x > 1).pull();
    expect(result).toEqual(2);
});

it("last", () => {
    const source = seq([1, 2, 3]);
    const result = source.last().pull();
    expect(result).toEqual(3);
});

it("reduce", () => {
    const source = seq([1, 2, 3]);
    const result = source.reduce((acc, x) => acc + x, 0).pull();
    expect(result).toEqual(6);
});

it("reduce without initial", () => {
    const source = seq([1, 2, 3]);
    const result = source.reduce((acc, x) => acc + x).pull();
    expect(result).toEqual(6);
});

it("reduce with empty", () => {
    const source = seq<number>([]);
    const result = source.reduce((acc, x) => acc + x, 0).pull();
    expect(result).toEqual(0);
});

it("reduce with empty without initial", () => {
    const source = seq<number>([]);
    expect(() => source.reduce((acc, x) => acc + x).pull()).toThrow();
});

it("last with predicate", () => {
    const source = seq([1, 2, 3]);
    const result = source.last(x => x < 3).pull();
    expect(result).toEqual(2);
});

it("at", () => {
    const source = seq([1, 2, 3]);
    const result = source.at(1).pull();
    expect(result).toEqual(2);
});

it("some", () => {
    const source = seq([1, 2, 3]);
    const result = source.some(x => x > 1).pull();
    expect(result).toEqual(true);
});

it("every", () => {
    const source = seq([1, 2, 3]);
    const result = source.every(x => x > 1).pull();
    expect(result).toEqual(false);
});

it("count", () => {
    const source = seq([1, 2, 3]);
    const result = source.count().pull();
    expect(result).toEqual(3);
});

it("count with predicate", () => {
    const source = seq([1, 2, 3]);
    const result = source.count(x => x > 1).pull();
    expect(result).toEqual(2);
});

it("includes", () => {
    const source = seq([1, 2, 3]);
    const result = source.includes(2).pull();
    expect(result).toEqual(true);
});

it("take", () => {
    const source = seq([1, 2, 3]);
    const result = source.take(2).toArray().pull();
    expect(result).toEqual([1, 2]);
});

it("skip", () => {
    const source = seq([1, 2, 3]);
    const result = source.skip(2).toArray().pull();
    expect(result).toEqual([3]);
});

it("skipWhile", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .skipWhile(x => x < 3)
        .toArray()
        .pull();
    expect(result).toEqual([3]);
});

it("takeWhile", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .takeWhile(x => x < 3)
        .toArray()
        .pull();
    expect(result).toEqual([1, 2]);
});

it("map", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .map(x => x * 2)
        .toArray()
        .pull();
    expect(result).toEqual([2, 4, 6]);
});

it("map with index", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .map((x, i) => x * i)
        .toArray()
        .pull();
    expect(result).toEqual([0, 2, 6]);
});

it("concatMap", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .concatMap(x => [x, x * 2])
        .toArray()
        .pull();
    expect(result).toEqual([1, 2, 2, 4, 3, 6]);
});

it("concatMap with index", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .concatMap((x, i) => [x, x * i])
        .toArray()
        .pull();
    expect(result).toEqual([1, 0, 2, 2, 3, 6]);
});

it("filter", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .filter(x => x > 1)
        .toArray()
        .pull();
    expect(result).toEqual([2, 3]);
});

it("filter with index", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .filter((x, i) => i > 1)
        .toArray()
        .pull() satisfies number[];
    expect(result).toEqual([3]);
});

it("filter type", () => {
    const source = seq([1, 2, undefined, 3]).as<
        number | undefined
    >() satisfies Iterable<number | undefined>;
    const result = source
        .filterAs<number>((x): x is number => x !== undefined)
        .toArray()
        .pull() satisfies number[];
    expect(result).toEqual([1, 2, 3]);
});

it("ofTypes", () => {
    const source = seq([new Error(), {}, new Array<number>()])
        .ofTypes(Array, Error)
        .map(x => x.constructor)
        .toArray()
        .pull();
    expect(source).toEqual([Error, Array]);
});

it("groupBy", () => {
    const source = seq([1, 2, 3]);
    const result = source.groupBy(x => x % 2).pull();
    expect(result).toEqual(
        new Map([
            [0, [2]],
            [1, [1, 3]]
        ])
    );
});

it("zip", () => {
    const source = seq([1, 2, 3]);
    const zipped = source.zip([4, 5, 6]) satisfies Iterable<[number, number]>;
    const result = zipped.toArray().pull();
    expect(result).toEqual([
        [1, 4],
        [2, 5],
        [3, 6]
    ]);
});

it("orderBy", () => {
    const source = seq([3, 2, 1]);
    const result = source
        .orderBy(x => x)
        .toArray()
        .pull();
    expect(result).toEqual([1, 2, 3]);
});

it("each", () => {
    const source = seq([1, 2, 3]);
    const result: number[] = [];
    source
        .tap(x => result.push(x))
        .toArray()
        .pull();
    expect(result).toEqual([1, 2, 3]);
});

it("cache", () => {
    const source = seq([1, 2, 3]);
    const result = source.cache().take(2).toArray().pull();
    expect(result).toEqual([1, 2]);
});

it("cache sideffects", () => {
    let count = 0;
    const source = seq([1, 2, 3]);
    const withSideEffect = source.tap(x => count++);
    const sides = withSideEffect.cache();
    sides.forEach(x => x);
    sides.forEach(x => x);
    expect(count).toEqual(3);
});

it("scan", () => {
    const source = seq([1, 2, 3]);
    const result = source
        .scan((acc, x) => acc + x, 0)
        .toArray()
        .pull();
    expect(result).toEqual([1, 3, 6]);
});

it("pull", () => {
    const source = seq([1, 2, 3]);
    const result = source.pull();
    let i = 1;
    for (const item of result) {
        expect(item).toBe(i++);
    }
    expect(result.isEmpty.pull()).toBe(true);
});
