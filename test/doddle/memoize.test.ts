import { doddle } from "@lib"
import { declare, type, type_of } from "declare-it"
import { lazies } from "./lazies.helper"

declare.it("memoize does not introduce Pulled", expect => {
    const lz = lazies.sync()
    expect(type_of(lz.memoize())).to_equal(type<() => 1>)
})

it("memoize works", () => {
    const func = jest.fn(() => 1)
    const memFunc = doddle(func).memoize()
    expect(memFunc()).toBe(1)
    expect(memFunc()).toBe(1)
    expect(func).toHaveBeenCalledTimes(1)
})
