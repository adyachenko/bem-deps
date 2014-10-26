var rod = require('require-or-die');
var object = require('bem-object');
var glue = require('glue-streams');
var join = require('path').join;
var through = require('through2');
var normalize = require('deps-normalize');

function BemDeps(levels, options) {

    if (!(this instanceof BemDeps)) {
        return new BemDeps(levels, options);
    }

    options = options || {};

    this.levels = levels;
    this.normalize = options.normalize || normalize;
    this.cwd = options.cwd;
}

function patchLevel(level) {
    return function (bem) {
        bem.level = level;
        return bem;
    };
}

BemDeps.prototype._parentLevels = function _parentLevels(bem) {
    var idx = this.levels.indexOf(bem.level);
    return this.levels.filter(function (e, i) {
        return i <= idx;
    });
};

BemDeps.prototype.deps = function deps(path) {
    var self = this;
    var bem = new object(path, self.options);

    var parents = this._parentLevels(bem);

    var streams = {
        required: [],
        blocks: [],
        expected: []
    };

    parents.map(function (level) {
        var required = through.obj();
        streams.required.push(required);

        var expected = through.obj();
        streams.expected.push(expected);

        streams.blocks.push(new object(level + '/' + bem.id));

        rod(join(self.cwd, level, bem.block, bem.id + '.deps.js'), function (err, value) {
            if (err) {
                // No deps.js file -> no dependencies
                required.end();
                expected.end();
                return;
            }

            var normalizedRequire = self.normalize(value.require || value.mustDeps || []).map(patchLevel(level));
            var requireDeps = normalizedRequire.map(self.deps, self);
            glue.obj.apply(glue, requireDeps).pipe(required);

            var normalizedExpect = self.normalize(value.expect || value.shouldDeps || []).map(patchLevel(level));
            var expectDeps = normalizedExpect.map(self.deps, self);
            glue.obj.apply(glue, expectDeps).pipe(expected);
        });
    });

    return glue.obj.apply(glue, streams.required.concat(streams.blocks).concat(streams.expected));
};

module.exports = BemDeps;
