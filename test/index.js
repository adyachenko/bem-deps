/* global describe, it */

var bem = require('..');
var assert = require('stream-assert');
var join = require('path').join;
var should = require('should');

// var debug = require('through2').obj(function (obj, enc, cb) {
//     console.log(obj);
//     cb(null, obj);
// });

describe('levels', function () {
    it('should search block in all levels', function (done) {
        bem(['test/base', 'test/blocks']).deps('test/blocks/foo')
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
            .pipe(assert.length(3))
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
            .pipe(assert.length(3))
            .pipe(assert.end(done));
    });
});

describe('require modifier', function () {
    it('should add required modifier of a block before target', function (done) {
        var b = bem(['test/blocks']);
        b.deps('test/blocks/require-modifier')
            .pipe(assert.first(function (dep) {
                var p = join(b._path(dep), dep.id + '.deps.js');
                return p.should.match(/test\/blocks\/foo\/_mode\/foo_mode_bar.deps.js$/);
            }))
            .pipe(assert.length(2))
            .pipe(assert.end(done));
    });
});
