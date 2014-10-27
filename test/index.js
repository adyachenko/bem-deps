/* global describe, it */

var bem = require('..');
var assert = require('stream-assert');
// var debug = require('through2').obj(function (obj, enc, cb) {
//     console.log(obj);
//     cb(null, obj);
// });

describe('levels', function () {
    it('should search block in all levels', function (done) {
        bem(['test/base', 'test/blocks']).deps('test/blocks/based')
            .pipe(assert.first(function (e) {
                return e.level === 'base';
            }))
            .pipe(assert.second(function (e) {
                return e.level === 'blocks';
            }))
            .pipe(assert.length(2))
            .pipe(assert.end(done));
    });
});

describe('require', function () {
    it('should add required blocks before target', function (done) {
        bem(['test/blocks']).deps('test/blocks/require')
            .pipe(assert.first(function (e) {
                return e.name === 'required';
            }))
            .pipe(assert.length(2))
            .pipe(assert.end(done));
    });

    it('should add required blocks from levels', function (done) {
        bem(['test/base', 'test/blocks']).deps('test/blocks/require')
            .pipe(assert.first(function (e) {
                return e.level === 'base';
            }))
            .pipe(assert.length(4))
            .pipe(assert.end(done));
    });
});

describe('expect', function () {
    it('should add expected blocks after target', function (done) {
        bem(['test/blocks']).deps('test/blocks/expect')
            .pipe(assert.second(function (e) {
                return e.name === 'required';
            }))
            .pipe(assert.length(2))
            .pipe(assert.end(done));
    });

    it('should add expect blocks from levels', function (done) {
        bem(['test/base', 'test/blocks']).deps('test/blocks/expect')
            .pipe(assert.second(function (e) {
                return e.level === 'base';
            }))
            .pipe(assert.length(4))
            .pipe(assert.end(done));
    });
});
