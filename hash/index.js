var STRUCTURE = 'Structure',
    has = require('@timelaps/n/has/shallow'),
    get = require('@timelaps/n/get/shallow'),
    set = require('@timelaps/n/set/shallow'),
    del = require('@timelaps/n/del/shallow'),
    Classy = require('@timelaps/classy'),
    HASH = 'Hash',
    forEachEnd = require('@timelaps/n/for/each/end'),
    reverseParams = require('@timelaps/fn/reverse-params'),
    forOwnEnd = require('@timelaps/n/for/own/end'),
    intended = require('@timelaps/fn/intended'),
    maker = require('@timelaps/fn/intended/maker'),
    assign = require('@timelaps/object/assign'),
    isValidIndex = require('@timelaps/is/valid-index'),
    toArray = require('@timelaps/to/array'),
    returnsFirst = require('@timelaps/returns/first'),
    isStrictlyEqual = require('@timelaps/is/strictly-equal'),
    checkHash = maker(function (key, value, fn) {
        return isValidIndex(forEachEnd(key, function (key) {
            return fn(key, value);
        }));
    }, function (obj, fn) {
        return isValidIndex(forOwnEnd(obj, reverseParams(fn)));
    }),
    Immutable = require('..'),
    Hash = module.exports = Immutable.extend(HASH, {
        // lifecycle: {
        //     created: function (supr, value) {
        //         supr();
        //         reset(this, value);
        //     },
        //     destroyed: function (supr) {
        //         supr();
        //         reset(this);
        //     }
        // },
        methods: {
            // has: function (key) {
            //     return has(this.structure, key);
            // },
            // get: function (key) {
            //     return get(this.structure, key);
            // },
            // set: function (prop, value) {
            //     var diffs, structure = this.structure;
            //     if (!(diffs = this.diffs([prop, value])).length) {
            //         return this;
            //     }
            //     // get the latest constructor, not just Hash
            //     return this.create(diffs);
            // },
            // del: function (key) {
            //     return del(this.structure, key);
            // }
        }
    });


function resolveValue(value) {
    return value.valueOf ? value.valueOf() : value;
}

function hashPathway() {}

function reconcile(object, differences, swapper) {}

function copy(structure, prop, value) {
    var clone = assign({}, structure);
    intended(prop, value, function (prop, value) {
        clone[prop] = value;
    });
    return clone;
}
