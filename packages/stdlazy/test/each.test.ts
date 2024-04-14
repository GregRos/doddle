import { expect } from "@assertive-ts/core"
import { lazy, Lazy, LazyAsync } from "@lib"

const lz = lazy(() => 1) satisfies Lazy<number>
const lza = lazy(async () => 1) satisfies LazyAsync<number>

it("lazy do doThing", () => {
    let i = ""
    expect(
        lazy(() => (i += "a"))
            .do(x => {
                expect(x).toBe("a")
                i += "b"
            })
            .pull()
    ).toBe("a")
    expect(i).toBe("ab")
})

it("lazy async do doThing", async () => {
    let i = ""
    await expect(
        lazy(async () => (i += "a"))
            .do(x => {
                expect(i).toBe("a")
                i += "b"
                return lazy(() => (i += "c"))
            })
            .pull()
    ).toBeResolvedWith("a")
    expect(i).toBe("abc")
})

it("lazy do doThing", async () => {
    let i = ""
    await expect(
        lazy(() => (i += "a"))
            .do(async x => {
                expect(x).toBe("a")
                i += "b"
                return lazy(() => (i += "c"))
            })
            .pull()
    ).toBeResolvedWith("a")
    expect(i).toBe("abc")
})

it("lazy async do doThing", async () => {
    let i = ""
    await lazy(async () => (i += "a"))
        .do(async x => {
            expect(x).toBe("a")
            i += "b"
            return lazy(() => (i += "c"))
        })
        .pull()
    expect(i).toBe("abc")
})

it("lazy do doThing", () => {
    let i = ""
    lazy(() => (i += "a"))
        .do(x => {
            expect(x).toBe("a")
            i += "b"
            return lazy(() => (i += "c"))
        })
        .pull()
    expect(i).toBe("abc")
})
