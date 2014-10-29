# bem-deps

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

This module reads `deps.js` files from requested bem block recursivly and returns a Stream of [bem objects](https://github.com/floatdrop/gulp-bem#bem-object) which can be queried for files.

`deps.js` file exports object with `require` and/or `expect` property:

```js
// foo.deps.js
export.require = ['one-block', 'two-block', {block: 'three-block'}];
export.expect = ['after'];
```

Required blocks will be added to stream before __foo__ block and expected blocks will be added after __foo__.

All elements of `require` and `expect` are normalized with [deps-normalize](https://github.com/floatdrop/deps-normalize) be default.

## API

### bem(levels, [options])

Returns object with [deps](#deps) method.

#### levels
Type: `Array`

Enumerates level folders, that should be used in blocks search.

#### options
Type: `Object`

 * `normalize` - sets normalization funciton (default: [deps-normalize](https://github.com/floatdrop/deps-normalize))

### deps(bem)
Returns `Stream` of [BEM objects](https://github.com/floatdrop/gulp-bem#bem-object) - all dependencies for `bem` block.

Stream emits dependencies in order, that defined by `require` and `expect` of corresponding BEM objects and levels of declaration.

## License

MIT (c) 2014 Vsevolod Strukchinsky

[npm-url]: https://npmjs.org/package/bem-deps
[npm-image]: http://img.shields.io/npm/v/bem-deps.svg?style=flat

[travis-url]: http://travis-ci.org/floatdrop/bem-deps
[travis-image]: http://img.shields.io/travis/floatdrop/bem-deps.svg?branch=master&style=flat

[depstat-url]: https://david-dm.org/floatdrop/bem-deps
[depstat-image]: http://img.shields.io/david/floatdrop/bem-deps.svg?style=flat

[coveralls-url]: https://coveralls.io/r/floatdrop/bem-deps
[coveralls-image]: http://img.shields.io/coveralls/floatdrop/bem-deps.svg?style=flat
