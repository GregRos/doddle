import { seq } from "../../lib/seq/seq";

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
        .pull();
    expect(result).toEqual([3]);
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
