module.exports = ArrayTrie;
ArrayTrie.Leaf = ArrayLeaf;
ArrayTrie.Branch = ArrayBranch;
var u, repeat = require('@timelaps/string/base/repeat');
var MAX = 32;
var binaryLength = MAX.toString(2).length;
var zerostring = repeat('0', binaryLength);
var fromTo = require('@timelaps/n/from/to');
var isUndefined = require('@timelaps/is/undefined');
var assign = require('@timelaps/object/assign');
var create = require('@timelaps/object/create');
var reduce = require('@timelaps/array/reduce');
// function chunkBinary(binary, size) {
//     var chunk = currentChunk(binary, size);
//     return chunk.length >= binaryLength ? chunk : zerostring.slice(chunk.length - 1) + chunk;
// }
function currentChunk(binary, size) {
    var filled = binary;
    var binLength = binary.length;
    var sizeLength = size.length;
    var cutoff = sizeLength - binaryLength;
    var delta = binLength - cutoff;
    if (delta <= binaryLength) {
        return zerostring;
    } else if (!delta) {
        return filled;
    } else {
        return zerostring.slice(0, binaryLength) + filled;
    }
}

function binaryToIndex(binary) {
    return parseInt(binary, 2);
}

function nextChunk(binary) {
    return binary.slice(binaryLength);
}

function toBinary(number) {
    return parseInt(number).toString(2);
}

function isGreaterThanMax(binary) {
    return binary.length > binaryLength;
}
ArrayLeafPrototype = ArrayLeaf.prototype = {
    get: function (binary) {
        // var index = binaryToIndex(binary);
        var current = binary[0];
        return current ? index > MAX ? u : this.value[index] : u;
    },
    set: function (binary, value) {
        var temp, current, index = binaryToIndex(binary);
        if (index > MAX) {
            // wasteful
            temp = new ArrayBranch([this]);
            return temp.set(index, value);
        } else {
            if (value === (current = this.value[index])) {
                return this;
            }
            copy = this.copy();
            copy[index] = value;
            return this.create(copy);
        }
    },
    create: function (array) {
        return new ArrayLeaf(array);
    },
    copy: function () {
        return this.value.slice(0);
    }
};

function ArrayLeaf(array) {
    this.value = array.length === MAX ? (array) : fill(array);
}

function fill(array, memo) {
    var m = memo || appropriatelySized(),
        length = array.length;
    if (length === MAX) {
        return array;
    } else if (length === 1) {
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

function appropriatelySized() {
    return new Array(MAX);
}

function ArrayTrie(array, forceBranch) {
    return !forceBranch && array.length <= MAX ? new ArrayLeaf(array) : new ArrayBranch(array);
}
ArrayBranch.prototype = assign(create(ArrayLeafPrototype), {
    get: function (binary) {
        var item = this.retreive(binary[0]);
        // we can do this because
        return item instanceof ArrayLeaf ? item.get(binary.slice(1)) : u;
    },
    copy: function () {},
    set: function (binary, pointer) {
        var next, length = binary.length,
            values = this.value,
            key = binary.slice(0, binaryLength),
            index = parseInt(key, 2);
        if (length <= binaryLength) {
            // key = chunkBinary(binary);
            // i can set
        } else {
            next = new ArrayBranch();
            return next;
        }
    },
    retreive: function (binary) {
        return this.value[binaryToIndex(binary)];
    },
    bunch: function () {
        // restructure to fit more in array
        var next = appropriatelySized();
        var current = this.value;
        next[0] = current;
        this.value = next;
    }
});

function build(branch, array, size) {
    // debugger;
    return fromTo(function (index, newarray) {
        newarray[index / size] = ArrayTrie(array.slice(index, index + MAX));
        return newarray;
    }, appropriatelySized(), 0, MAX - 1, size);
}

function computeDepth(length) {
    return length > MAX ? 1 + computeDepth(length / MAX) : 0;
}

function ArrayBranch(array, size) {
    var length = array.length,
        depth = this.depth = isUndefined(size) ? computeDepth(length) : size;
    this.size = length.toString(2);
    this.value = length > MAX ? build(this, array, MAX * depth) : fill(array);
}