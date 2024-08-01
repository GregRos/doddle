import { lazy } from "../"

test("iterates as singleton when value non-iterable", () => {
    expect([...lazy(() => 1)]).toEqual([1])
})

test("iterates inner elements when value iterable", () => {
    expect([...lazy(() => [1, 2, 3])]).toEqual([1, 2, 3])
})

test("iterates inner elements when value iterable and nested", () => {
    expect([...lazy(() => lazy(() => [1, 2, 3]))]).toEqual([1, 2, 3])
})

test("iterates elements when nested array", () => {
    expect([
        ...lazy(() => [
            [1, 2],
            [3, 4]
        ])
    ]).toEqual([
        [1, 2],
        [3, 4]
    ])
})
