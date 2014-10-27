var rod = require('require-or-die');
var object = require('bem-object');
var glue = require('glue-streams');
var join = require('path').join;
var resolve = require('path').resolve;
var through = require('through2');
var normalize = require('deps-normalize');

function BemDeps(levels, options) {
    if (!(this instanceof BemDeps)) {
        return new BemDeps(levels, options);
    }

    options = options || {};
    options.cwd = options.cwd || '';

    this.levels = levels.map(function (l) { return resolve(options.cwd, l); });
    this.normalize = options.normalize || normalize;
}

BemDeps.prototype._parentLevels = function _parentLevels(bem) {
    var idx = this.levels.indexOf(bem.level);
    return this.levels.filter(function (e, i) {
        return i <= idx;
    });
};

BemDeps.prototype.required = function required(value, level) {
    var self = this;
    value.require = value.require || value.mustDeps || [];
    return self.normalize(value.require.map(function (req) {
        if (typeof req === 'string') { req = new object(req, self.options); }
        req.level = level;
        return req;
    }));
};

BemDeps.prototype.expected = function expected(value, level) {
    var self = this;
    value.expect = value.expect || value.shouldDeps || [];
    return self.normalize(value.expect.map(function (exp) {
        if (typeof exp === 'string') { exp = new object(exp, self.options); }
        exp.level = level;
        return exp;
    }));
};

BemDeps.prototype.deps = function deps(path, options) {
    var self = this;

    options = options || {};
    options.cwd = options.cwd || '';

    if (typeof path === 'string') {
        path = resolve(options.cwd, path);
    }

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

        streams.blocks.push(new object(join(level, bem.id)));

        rod(join(level, bem.block, bem.id + '.deps.js'), function (err, value) {
            if (err) {
                // No deps.js file -> no dependencies
                required.end();
                expected.end();
                return;
            }

            glue.obj.apply(glue, self.required(value, level).map(self.deps, self)).pipe(required);
            glue.obj.apply(glue, self.expected(value, level).map(self.deps, self)).pipe(expected);
        });
    });

    return glue.obj.apply(glue, streams.required.concat(streams.blocks).concat(streams.expected));
};

module.exports = BemDeps;
