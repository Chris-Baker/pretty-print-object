# Pretty print object

[![License][license-image]][license-url] [![CI][ci-image]][ci-url]

> Convert an object or array into a formatted string

This is a re-write of [stringify-object] in Typescript, modified to inline the dependencies and make it compatible with ES5 out of the box.

Useful for when you want to get the string representation of an object in a formatted way.

It also handles circular references and lets you specify quote type.

## Install

```
$ npm install @base2/pretty-print-object
```

## Usage

```js
import { prettyPrint } from '@base2/pretty-print-object';

const obj = {
    foo: 'bar',
    arr: [1, 2, 3],
    nested: {
        hello: 'world'
    }
};

const pretty = prettyPrint(obj, {
    indent: '  ',
    singleQuotes: false
});

console.log(pretty);
/*
{
    foo: "bar",
    arr: [
        1,
        2,
        3
    ],
    nested: {
        hello: "world"
    }
}
*/
```

## API

### prettyPrint(input, [options])

Invalid dates are printed as `Invalid Date` instead of throwing an exception. Valid dates retain the `new Date('...')` representation.

Circular references will be replaced with `"[Circular]"`.

Object keys are only quoted when necessary, for example, `{'foo-bar': true}`.

#### input

Type: `Object` `Array`

#### options

Type: `Object`

##### indent

Type: `string`<br>
Default: `\t`

Preferred indentation.

##### singleQuotes

Type: `boolean`<br>
Default: `true`

Set to false to get double-quoted strings.

##### filter(obj, prop)

Type: `Function`

Expected to return a `boolean` of whether to include the property `prop` of the object `obj` in the output.

##### transform(obj, prop, originalResult)

Type: `Function`<br>
Default: `undefined`

Expected to return a `string` that transforms the string that resulted from stringifying `obj[prop]`. This can be used to detect special types of objects that need to be stringified in a particular way. The `transform` function might return an alternate string in this case, otherwise returning the `originalResult`.

Here's an example that uses the `transform` option to mask fields named "password":

```js
import { prettyPrint } from '@base2/pretty-print-object';

const obj = {
    user: 'becky',
    password: 'secret'
};

const pretty = prettyPrint(obj, {
    transform: (obj, prop, originalResult) => {
        if (prop === 'password') {
            return originalResult.replace(/\w/g, '*');
        }

        return originalResult;
    }
});

console.log(pretty);
/*
{
    user: 'becky',
    password: '******'
}
*/
```

##### inlineCharacterLimit

Type: `number`

When set, will inline values up to `inlineCharacterLimit` length for the sake of more terse output.

For example, given the example at the top of the README:

```js
import { prettyPrint } from '@base2/pretty-print-object';

const obj = {
    foo: 'bar',
    arr: [1, 2, 3],
    nested: {
        hello: 'world'
    }
};

const pretty = prettyPrint(obj, {
    indent: '  ',
    singleQuotes: false,
    inlineCharacterLimit: 12
});

console.log(pretty);
/*
{
    foo: "bar",
    arr: [1, 2, 3],
    nested: {
        hello: "world"
    }
}
*/
```

As you can see, `arr` was printed as a one-liner because its string was shorter than 12 characters.

[stringify-object]: https://www.npmjs.com/package/stringify-object
[ci-image]: https://github.com/Chris-Baker/pretty-print-object/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/Chris-Baker/pretty-print-object/actions/workflows/ci.yml
[license-url]: https://opensource.org/licenses/BSD-2-Clause
[license-image]: https://img.shields.io/badge/License-BSD%202--Clause-orange.svg

## Development

Use Node.js 24 (`nvm use`), then run:

```sh
npm ci
npm run check
```

`check` runs ESLint, Prettier, TypeScript checking and all Jest tests. CI runs
these checks on every pull request and on pushes to `master`, using Node.js
22, 24 and 26. Tests parse the built JavaScript as ES5 and exercise it with
ES2015 built-ins removed from an isolated runtime.

SWC produces the CommonJS ES5 build. TypeScript emits declarations separately;
its target setting does not control the published JavaScript. TypeScript stays
on the latest version supported by typescript-eslint. The published package
has no runtime dependencies. Symbol properties are included where supported
and skipped in runtimes without symbols.

Run `npm run build` to rebuild `dist`, or `npm pack --dry-run` to inspect the
package contents. Packing also rebuilds the package automatically.
