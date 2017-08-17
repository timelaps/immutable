module.exports = ArrayTrie;
ArrayTrie.Leaf = ArrayLeaf;
ArrayTrie.Branch = ArrayBranch;
var u, repeat = require('@timelaps/string/base/repeat');
var MAX = 64;
var maxBinaryBlockLength = MAX.toString(2).length - 1;
var zerostring = repeat('0', maxBinaryBlockLength);
var fromTo = require('@timelaps/n/from/to');
var isUndefined = require('@timelaps/is/undefined');
var assign = require('@timelaps/object/assign');
var create = require('@timelaps/object/create');
var reduce = require('@timelaps/array/reduce');
var isArray = require('@timelaps/is/array');
var isNumber = require('@timelaps/is/number');
var clamp = require('@timelaps/number/clamp');
var hash = require('../../hash');
var hashArray = hash.array;

function fullBinary(binary) {
    var filled = binary;
    var length = binary.length;
    var needs = Math.ceil(length / maxBinaryBlockLength) * maxBinaryBlockLength;
    var delta = needs - length;
    return delta ? (zerostring.slice(0, delta) + binary) : binary;
}

function binaryToIndex(binary) {
    return parseInt(binary, 2);
}

function nextChunk(binary) {
    return binary.slice(1);
}

function toBinary(number) {
    return parseInt(number).toString(2);
}

function isGreaterThanMax(binary) {
    return binary.length > maxBinaryBlockLength;
}
var ImmutableLeafHash = {
    //
};
ArrayLeafPrototype = ArrayLeaf.prototype = {
    constructor: ArrayLeaf,
    get: function (binary, isindexpath) {
        return this.retreive(binaryToIndex(isindexpath ? binary[0] : toIndexPath(binary, 0)[0]));
    },
    set: function (binary, value) {
        var temp, current, index = binaryToIndex(binary);
        if (index > MAX) {
            // wasteful
            // temp = new ArrayBranch([this]);
            // return temp.set(index, value);
        } else {
            if (value === (current = this.value[index])) {
                return this;
            }
            copy = this.copy();
            copy[index] = value;
            return this.create(copy);
        }
    },
    retreive: function (index) {
        return this.value[index];
    },
    create: function (array) {
        return new ArrayLeaf(array);
    },
    copy: function () {
        return this.value.slice(0);
    }
};

function ArrayLeaf(array, immutableId) {
    this.immutableId = immutableId;
    this.value = fill(array);
}

function fill(array, memo) {
    var length = array.length;
    if (length === MAX) {
        return array;
    }
    var m = memo || appropriatelySized();
    if (length === 1) {
        m[0] = array[0];
        return m;
    } else {
        return reduce(array, mutate, m);
    }
}

function mutate(memo, value, index) {
    memo[index] = value;
    return memo;
}

function appropriatelySized(length) {
    return new Array(length || MAX);
}

function pow(base, exp) {
    return Math.pow(base, exp);
}

function keepChurning(array, absoluteMax, inclusiveMin, exclusiveMax, depth, length) {
    var blockSize = pow(MAX, depth);
    return fromTo(function (index, memo) {
        var idx = (index / blockSize) % MAX;
        memo.value[idx] = churn(array, absoluteMax, index, index + blockSize, depth - 1);
        return memo;
    }, new ArrayBranch(depth), inclusiveMin, clamp(exclusiveMax, 0, absoluteMax) - 1, blockSize);
}

function finishChurning(array, inclusiveMin, exclusiveMax) {
    // debugger;
    var cached, immutableId = hashArray(array, inclusiveMin, exclusiveMax - 1);
    if (!isUndefined(cached = ImmutableLeafHash[immutableId])) {
        return cached;
    }
    var newish = new ArrayLeaf(array.slice(inclusiveMin, exclusiveMax), immutableId);
    ImmutableLeafHash[immutableId] = newish;
    return newish;
}

function churn(array, absoluteMax, inclusiveMin, exclusiveMax, depth) {
    var length = exclusiveMax - inclusiveMin;
    if (length > MAX) {
        return keepChurning(array, absoluteMax, inclusiveMin, exclusiveMax, depth, length);
    } else {
        return finishChurning(array, inclusiveMin, exclusiveMax);
    }
}

function ArrayTrie(array) {
    var length = array.length;
    return churn(array, length, 0, length, computeDepth(length));
}

function binaryToPathIndex(index, depth) {
    var binary = fullBinary(index);
    var length = binary.length / maxBinaryBlockLength;
    var result = fromTo(function (i, memo) {
        var start = i * maxBinaryBlockLength;
        memo[i] = binary.slice(start, start + maxBinaryBlockLength);
        return memo;
    }, appropriatelySized(length), 0, length - 1, 1);
    while (result.length <= depth) {
        result = [zerostring].concat(result);
    }
    return result;
}

function numberToIndexPath(index, depth) {
    return binaryToPathIndex(toBinary(index), depth);
}

function toIndexPath(index, depth) {
    return isArray(index) ? index : isNumber(index) ? numberToIndexPath(index, depth) : binaryToPathIndex(index, depth);
}
ArrayBranch.prototype = assign(create(ArrayLeafPrototype), {
    get: function (binary, isindexpath) {
        var path = toIndexPath(binary, this.depth);
        var item = this.retreive(binaryToIndex(path[0]));
        // we can do this because
        return item instanceof ArrayLeaf ? item.get(nextChunk(path), true) : u;
    },
    copy: function () {},
    set: function (binary, pointer) {
        var next, length = binary.length,
            values = this.value,
            key = binary.slice(0, maxBinaryBlockLength),
            index = parseInt(key, 2);
        if (length <= maxBinaryBlockLength) {
            // key = chunkBinary(binary);
            // i can set
        } else {
            // next = new ArrayBranch();
            return next;
        }
    },
    bunch: function () {
        // restructure to fit more in array
        var next = appropriatelySized();
        var current = this.value;
        next[0] = current;
        this.value = next;
    }
});

function computeDepth(length) {
    return length > MAX ? 1 + computeDepth(length / MAX) : 0;
}

function ArrayBranch(depth) {
    // this.size = fullBinary(length.toString(2));
    this.depth = depth;
    this.value = appropriatelySized();
}