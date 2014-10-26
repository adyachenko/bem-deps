var rod = require('require-or-die');
var object = require('bem-object');
var glue = require('glue-streams');
var join = require('path').join;
var through = require('through2');

function BemDeps(levels, options) {

    if (!(this instanceof BemDeps)) {
        return new BemDeps(levels, options);
    }

    options = options || {};
    this.levels = levels;
    this.normalize = options.normalize;
}

BemDeps.prototype.deps = function deps(path) {
    var bem = new object(path, this.options);
    var output = through.obj();

    // TODO: block could be in upper levels
    // TODO: deps.js file could be not in strict directory
    rod(join(bem.level, bem.id + '.deps.js'), function (err, value) {
        if (err) { return output.emit('error', err); }

        var required = this.normalize(value.require || value.mustDeps).map(deps, this);
        var expected = this.normalize(value.expect || value.shouldDeps).map(deps, this);

        glue(required, bem, expected).pipe(output);
    });

    return output;
};

module.exports = BemDeps;
