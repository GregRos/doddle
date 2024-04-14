/* eslint-disable prefer-arrow-callback */
import { expect } from "@assertive-ts/core"
import { lazy } from "@lib"

it("no name normalizes to null", () => {
    const lz = lazy(() => 1)
    expect(lz.info.name).toBeEqual(null)
})

it("name is recovered", () => {
    const lz = lazy(function foo() {
        return 1
    })
    expect(lz.info.name).toBeEqual("foo")
    expect(lz.toString()).toBeEqual("lazy(foo) <pending>")
})

it("starts out pending", () => {
    const lz = lazy(() => 1)
    expect(lz.info).toBeEqual({
        name: null,
        stage: "pending",
        syncness: "pending"
    })
})

it("pulling changes stage (in sync)", () => {
    const lz = lazy(() => {
        expect(lz.info.stage).toBeEqual("pulled")
    })
    lz.pull()
    expect(lz.info.stage).toBeEqual("ready")
})

it("pulling changes stage (in async)", async () => {
    const lz = lazy(async () => {
        expect(lz.info.stage).toBeEqual("pulled")
        expect(lz.toString()).toBeEqual("lazy <pulled>")
        return 5
    })
    const p = lz.pull()
    expect(lz.info.stage).toBeEqual("pulled")
    await p
    expect(lz.info.stage).toBeEqual("ready")
    expect(lz.toString()).toBeEqual("lazy async number")
})

it("pulling changes syncness (in sync)", () => {
    const lz = lazy(() => {
        expect(lz.info.syncness).toBeEqual("pending")
    })
    lz.pull()
    expect(lz.toString()).toBeEqual("lazy sync undefined")
    expect(lz.info.syncness).toBeEqual("sync")
})

it("pulling changes syncness (in async)", async () => {
    const lz = lazy(async () => {
        expect(lz.info.syncness).toBeEqual("pending")
        expect(lz.toString()).toBeEqual("lazy <pulled>")
    })
    const p = lz.pull()
    expect(lz.info.syncness).toBeEqual("async")
    expect(lz.toString()).toBeEqual("lazy async <pulled>")
    await p
    expect(lz.info.syncness).toBeEqual("async")
})
