var fromTo = require('@timelaps/n/from/to');
var reduceOwn = require('@timelaps/array/reduce/own');
var reduce = require('@timelaps/array/reduce');
var isArrayLike = require('@timelaps/is/array-like');
var isObject = require('@timelaps/is/object');
var constructorName = require('@timelaps/fn/constructor-name');
var isUndefined = require('@timelaps/is/undefined');
var isFalse = require('@timelaps/is/false');
var isNull = require('@timelaps/is/null');
var combinations = require('@timelaps/array/combinations');
var forEach = require('@timelaps/n/for/each');
var isNil = require('@timelaps/is/nil');
var startpoints = {};
var immutable = {
    string: true,
    number: true,
    undefined: true,
    boolean: true
};
module.exports = hash;
var arrayHashKeyValuePairs = hashKeyValuePairs('number');
var objectHashKeyValuePairs = hashKeyValuePairs('string');
hash.array = hashArray;
forEach([type(0), type(''), 'function', type({}), type()], function (type) {
    startpoints[type] = {};
});

function type(object) {
    return typeof object;
}

function isImmutable(value) {
    return !(value ? isUndefined(value.immutableId) : !value);
}

function hash(mutable) {
    return isArrayLike(mutable) ? hashArray(mutable, 0, mutable.length) : (isObject(mutable) ? hashObject(mutable) : simpleHash(null, mutable));
}

function simpleHash(keytype, key, type, value, hashed) {
    return singleHash(type, value, singleHash(keytype, key, hashed));
}

function singleHash(typeofvalue, value, memo) {
    // number or string
    var m = memo || 0;
    var cached = startpoints[typeofvalue] || {};
    if (isNil(value) || isFalse(value)) {
        return m;
    }
    if ((value && !immutable[typeofvalue])) {
        // check if it's actually an object
        // if it is, then go through it again
        // return hashObject(value, memo);
    }
    var list = value + '';
    return fromTo(function (index, memo) {
        return actualHash(memo, list[index]);
    }, m, 0, list.length - 1, 1);
}

function actualHash(hash_, string) {
    var char = string.charCodeAt(0),
        hash = ((hash_ << 5) - hash_) + char;
    return hash & hash; // Convert to 32bit integer
}

function hashImmutableUnder(keytype, key, immutable, memo) {
    return simpleHash(keytype, key, 'immutable', immutable.id, memo);
}

function hashKeyValuePairs(keytype) {
    return function (memo, value, key) {
        if (isImmutable(value)) {
            return hashImmutableUnder(keytype, key, value, memo);
        } else {
            return simpleHash(keytype, key, typeof value, value, memo);
        }
    };
}

function hashObject(mutable, memo) {
    return reduceOwn(mutable, hashKeyValuePairs, memo || 0);
}

function hashArray(mutable, from, to) {
    return singleHash('array', fromTo(function (index, hashed) {
        var value = mutable[index];
        return hashed + ',' + (isNil(value) ? '' : (immutable[(valuetype = typeof value)] ? valuetype.slice(0, 1) + value : ''));
        // return arrayHashKeyValuePairs(hashed, mutable[index], index);
    }, '', from || 0, isUndefined(to) ? mutable.length - 1 : to, 1), singleHash('array', '[', 0));
}