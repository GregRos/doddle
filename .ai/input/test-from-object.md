I've added the #sym:fromObject and #sym:fromObject factory functions. They produce a Seq or ASeq froman object like Object.entries.

Create two test files based on the pattern in the `from` folder.

Make sure to test the following for both sync and async versions:

1. Works on empty input
2. Works on single key input
3. Works on larger object
4. Does not produce symbol keys
5. Does not produce non-enumerable kvps
6. Does not produce inherited kvps
7. Values are produced lazily
8. No side-effects after call
9. Array input produces e.g. `{["0", "a"], ["1", "b"]}` etc.
