# Doddle

[![Doddle workflow status](https://img.shields.io/github/actions/workflow/status/GregRos/doddle/push.yaml?style=for-the-badge)](https://github.com/GregRos/doddle/actions/workflows/push.yaml)
[![Doddle package version](https://img.shields.io/npm/v/doddle?style=for-the-badge)](https://www.npmjs.com/package/doddle)
[![Doddle Coveralls](https://img.shields.io/coverallsCoverage/github/GregRos/doddle?style=for-the-badge)](https://coveralls.io/github/GregRos/doddle?branch=master)
[![Doddle minified size(gzip)](<https://img.shields.io/bundlejs/size/doddle?exports=aseq&style=for-the-badge&label=minified%20size%20(gzip)>)](https://bundlejs.com/?q=doddle&treeshake=%5B%7Bseq%2Caseq%7D%5D)

Doddle is a tiny but incredibly versatile library for working with collections and iterables, inspired by `LINQ`, `lodash`, `rxjs`, and other libraries. It also introduces its own simple yet elegant lazy primitive, which has many of the same qualities as a promise.

Doddle reproduces much of lodash's functionality for working with collections, but it's absolutely tiny. It offers its operators as instance methods because breaking them up into separate files has been shown to increase bundle size through overhead.

However, becuase it operates on iterables rather than on arrays directly, it will most likely be outperformed by other libraries.

Doddle is extensively tested, with over 1000 individual test cases. It also has a suite of [compile-time tests](https://github.com/GregRos/declare-it) that check the logic of its type definitions.

Doddle has been designed to be debuggable. It produces readable stack traces that mirror the code you write, and you can easily jump to, inspect, and place breakpoints in its source code.
