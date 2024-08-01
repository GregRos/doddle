/* eslint-disable prefer-arrow-callback */

import { lazy } from "../"

it("no name normalizes to null", () => {
    const lz = lazy(() => 1)
    expect(lz.info.name).toEqual(null)
})

it("name is recovered", () => {
    const lz = lazy(function foo() {
        return 1
    })
    expect(lz.info.name).toEqual("foo")
    expect(lz.toString()).toEqual("lazy(foo) <untouched>")
})

it("starts out untouched", () => {
    const lz = lazy(() => 1)
    expect(lz.info).toEqual({
        name: null,
        stage: "untouched",
        syncness: "untouched"
    })
})

it("pulling changes stage (in sync)", () => {
    const lz = lazy(() => {
        expect(lz.info.stage).toEqual("executing")
    })
    lz.pull()
    expect(lz.info.stage).toEqual("done")
})

it("pulling changes stage (in async)", async () => {
    const lz = lazy(async () => {
        expect(lz.info.stage).toEqual("executing")
        expect(lz.toString()).toEqual("lazy <executing>")
        return 5
    })
    const p = lz.pull()
    expect(lz.info.stage).toEqual("executing")
    await p
    expect(lz.info.stage).toEqual("done")
    expect(lz.toString()).toEqual("lazy async number")
})

it("pulling changes syncness (in sync)", () => {
    const lz = lazy(() => {
        expect(lz.info.syncness).toEqual("untouched")
    })
    lz.pull()
    expect(lz.toString()).toEqual("lazy sync undefined")
    expect(lz.info.syncness).toEqual("sync")
})

it("pulling changes syncness (in async)", async () => {
    const lz = lazy(async () => {
        expect(lz.info.syncness).toEqual("untouched")
        expect(lz.toString()).toEqual("lazy <executing>")
    })
    const p = lz.pull()
    expect(lz.info.syncness).toEqual("async")
    expect(lz.toString()).toEqual("lazy async <executing>")
    await p
    expect(lz.info.syncness).toEqual("async")
})
