/* global describe, it */

var graph = require('..');
var assert = require('stream-assert');

describe('levels', function () {
    it('should search block in all levels', function (done) {
        graph(['base', 'blocks']).deps('blocks/based')
            .pipe(assert.first(function (e) {
                return e.level === 'base';
            }))
            .pipe(assert.length(1))
            .pipe(assert.end(done));
    });
});

describe('require', function () {
    it('should add required blocks before target', function (done) {
        graph(['blocks']).deps('blocks/page')
            .pipe(assert.first(function (e) {
                return e.name === 'required';
            }))
            .pipe(assert.length(2))
            .pipe(assert.end(done));
    });

    it('should add required blocks from levels', function (done) {
        graph(['base', 'blocks']).deps('blocks/page')
            .pipe(assert.first(function (e) {
                return e.level === 'base';
            }))
            .pipe(assert.length(3))
            .pipe(assert.end(done));
    });
});

describe('expect', function () {
    it('should add expected blocks after target', function (done) {
        graph(['blocks']).deps('blocks/page')
            .pipe(assert.second(function (e) {
                return e.name === 'required';
            }))
            .pipe(assert.length(2))
            .pipe(assert.end(done));
    });

    it('should add expect blocks from levels', function (done) {
        graph(['base', 'blocks']).deps('blocks/page')
            .pipe(assert.second(function (e) {
                return e.level === 'base';
            }))
            .pipe(assert.length(3))
            .pipe(assert.end(done));
    });
});
