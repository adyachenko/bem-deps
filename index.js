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

BemDeps.prototype._parentLevels = function _parentLevels(bem) {
    var idx = this.levels.indexOf(bem.level);
    return this.levels.filter(function (e, i) {
        return i <= idx;
    });
};

BemDeps.prototype.deps = function deps(path) {
    var self = this;

    var bem = new object(path, self.options);

    var streams = {
        required: [],
        blocks: [],
        expected: []
    };

    var parents = this._parentLevels(bem);

    parents.map(function (parentLevel) {
        var required = through.obj();
        streams.required.push(required);

        var expected = through.obj();
        streams.expected.push(expected);

        streams.blocks.push(new object(parentLevel + '/' + bem.id));

        rod(join(self.cwd, bem.level, bem.block, bem.id + '.deps.js'), function (err, value) {
            if (err) {
                required.end();
                expected.end();
                return;
                // throw new Error(err);
            }

            glue.obj(self.normalize(value.require || value.mustDeps).map(deps, self)).pipe(required);
            glue.obj(self.normalize(value.expect || value.shouldDeps).map(deps, self)).pipe(expected);
        });
    });

    return glue.obj(streams.required, streams.blocks, streams.expected);
};

module.exports = BemDeps;
