var rod = require('require-or-die');
var object = require('bem-object');
var join = require('path').join;
var resolve = require('path').resolve;
var normalize = require('deps-normalize');
var fs = require('fs');
var flatit = require('flatit');
var array = require('stream-array');

function BemDeps(levels, options) {
    if (!(this instanceof BemDeps)) {
        return new BemDeps(levels, options);
    }

    options = options || {};
    options.cwd = options.cwd || '';

    if (!levels) { throw new Error('levels argument is requried'); }
    if (typeof levels === 'string') { levels = [ levels ]; }

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
    if (!Array.isArray(value.require)) { value.require = [value.require]; }
    return self.normalize(value.require.map(function (req) {
        if (typeof req === 'string') { req = new object(req, self.options); }
        req.level = level;
        return req;
    }));
};

BemDeps.prototype.expected = function expected(value, level) {
    var self = this;
    value.expect = value.expect || value.shouldDeps || [];
    if (!Array.isArray(value.expect)) { value.expect = [value.expect]; }
    return self.normalize(value.expect.map(function (exp) {
        if (typeof exp === 'string') { exp = new object(exp, self.options); }
        exp.level = level;
        return exp;
    }));
};

function setParent(parent) {
    return function (bem) {
        bem.parent = parent;
        parent.copy(bem);
        return bem;
    };
}

BemDeps.prototype._deps = function _deps(path, options) {
    var self = this;

    options = options || {};
    options.cwd = options.cwd || '';

    if (typeof path === 'string') {
        path = resolve(options.cwd, path);
    }

    var bem = new object(path, self.options);
    var parents = this._parentLevels(bem);

    var required = [];
    var blocks = [];
    var expected = [];

    parents.map(function (level) {
        // Temporary hack to filter out non-existent entities
        if (!fs.existsSync(join(level, bem.block))) {
            return;
        }

        var parent = new object(join(level, bem.id));
        blocks.push(parent);

        var depsFile = join(level, bem.block, bem.id + '.deps.js');

        if (!fs.existsSync(depsFile)) {
            return;
        }

        var value = rod.sync(depsFile);
        required = required.concat(
            self.required(value, level)
                .map(setParent(parent))
                .map(self._deps, self)
        );

        expected = expected.concat(
            self.expected(value, level)
                .map(setParent(parent))
                .map(self._deps, self)
        );
    });

    return flatit([required, blocks, expected]);
};

BemDeps.prototype.deps = function deps(path, options) {
    return array(this._deps(path, options));
};

module.exports = BemDeps;
