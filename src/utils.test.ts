import { getClassName } from "./utils.js"

it("gets name of object with constructor.name", () => {
    expect(getClassName(new Error())).toBe("Error")
})

it("gets name of object without constructor.name, with Symbol.toStringTag", () => {
    expect(
        getClassName({
            constructor: undefined,
            [Symbol.toStringTag]: "thingy"
        })
    ).toBe("thingy")
})

it("gives 'Object' for objects without constructor.name or Symbol.toStringTag", () => {
    expect(
        getClassName({
            constructor: undefined,
            [Symbol.toStringTag]: undefined
        })
    ).toBe("Object")
})
