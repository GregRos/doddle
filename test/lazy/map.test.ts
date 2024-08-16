import { lazy, Lazy, type LazyAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

const sync = lazy(() => 1)
const asy = lazy(async () => 1)

declare.it("sync + sync callback = sync", expect => {
    expect(type_of(sync.map(x => x))).to_equal(type<Lazy<number>>)
})

declare.it("sync + async callback = async", expect => {
    expect(type_of(sync.map(async x => x))).to_equal(type<LazyAsync<number>>)
})

declare.it("async + sync callback = async", expect => {
    expect(type_of(asy.map(x => x))).to_equal(type<LazyAsync<number>>)
})

declare.it("async + async callback = async", expect => {
    expect(type_of(asy.map(async x => x))).to_equal(type<LazyAsync<number>>)
})

declare.it("mixed + sync callback = mixed", expect => {
    const mixed = lazy(() => null! as Promise<1> | 1)
    const mapped = mixed.map(x => x)
    expect(type_of(mapped)).to_equal(type<Lazy<1 | Promise<1>>>)
    const mappedToDifferntType = mixed.map(x => `${x}`)
    expect(type_of(mappedToDifferntType)).to_equal(type<Lazy<string | Promise<string>>>)
})

declare.it("mixed + async callback = async", expect => {
    const mixed = lazy(() => null! as Promise<1> | 1)
    const mapped = mixed.map(async x => x)
    expect(type_of(mapped)).to_equal(type<LazyAsync<1>>)
    const mappedToDifferntType = mixed.map(async x => `${x}`)
    expect(type_of(mappedToDifferntType)).to_equal(type<LazyAsync<string>>)
})
