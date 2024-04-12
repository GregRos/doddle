import { expect } from "@assertive-ts/core";
import { lazy, Lazy, LazyAsync, Pulled, PulledAwaited } from "@lib";

const lz = lazy(() => 1) satisfies Lazy<number>;
const lza = lazy(async () => 1) satisfies LazyAsync<number>;

it("lazy each doThing", () => {
    let i = "";
    expect(
        lazy(() => (i += "a"))
            .each(x => {
                expect(x).toBe("a");
                i += "b";
            })
            .pull()
    ).toBe("a");
    expect(i).toBe("ab");
});

it("lazy async each doThing", async () => {
    let i = "";
    await expect(
        lazy(async () => (i += "a"))
            .each(x => {
                expect(i).toBe("a");
                i += "b";
                return lazy(() => (i += "c"));
            })
            .pull()
    ).toBeResolvedWith("a");
    expect(i).toBe("abc");
});

it("lazy each doThing", async () => {
    let i = "";
    await expect(
        lazy(() => (i += "a"))
            .each(async x => {
                expect(x).toBe("a");
                i += "b";
                return lazy(() => (i += "c"));
            })
            .pull()
    ).toBe("a");
    expect(i).toBe("abc");
});

it("lazy async each doThing", async () => {
    let i = "";
    await lazy(async () => (i += "a"))
        .each(async x => {
            expect(x).toBe("a");
            i += "b";
            return lazy(() => (i += "c"));
        })
        .pull();
    expect(i).toBe("abc");
});

it("lazy each doThing", () => {
    let i = "";
    lazy(() => (i += "a"))
        .each(x => {
            expect(x).toBe("a");
            i += "b";
            return lazy(() => (i += "c"));
        })
        .pull();
    expect(i).toBe("abc");
});
