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

BemDeps.prototype.deps = function deps(path) {
    var self = this;

    var bem = new object(path, self.options);
    var output = through.obj();

    // TODO: block could be in upper levels
    // TODO: deps.js file could be not in strict directory
    rod(join(self.cwd, bem.level, bem.block, bem.id + '.deps.js'), function (err, value) {
        if (err) { return output.emit('error', err); }

        var required = self.normalize(value.require || value.mustDeps)
            .map(deps, self);

        var expected = self.normalize(value.expect || value.shouldDeps)
            .map(deps, self);

        glue(required, bem, expected).pipe(output);
    });

    return output;
};

module.exports = BemDeps;
