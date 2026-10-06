# Changelog

## 1.0.3

- Fix invalid Date values throwing during printing (issue #22, contributed by
  Victor Markov in PR #24), with an ES5-compatible validity check.
- Support object printing in runtimes without `Object.getOwnPropertySymbols`.
- Update development dependencies and replace the Babel test transform with SWC.
- Build ES5 CommonJS JavaScript with SWC and declarations with TypeScript,
  retaining zero runtime dependencies.
- Add pull request CI across Node.js 22, 24 and 26, including lint, formatting,
  type checks, tests, package inspection and ES5 compatibility checks.
- Remove the vulnerable `sprintf-js` dependency chain with a scoped, tested
  override for the coverage configuration loader.
- Require dependencies to be at least seven days old and pass a full audit
  before CI installs them. Refresh the lockfile to meet that age policy.
