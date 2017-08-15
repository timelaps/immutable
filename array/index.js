module.exports = ArrayTrie;
var repeat = require('@timelaps/string/base/repeat');
var MAX = 32;
var binaryLength = MAX.toString(2).length;
var zerostring = repeat('0', binaryLength);
var fromTo = require('@timelaps/n/from/to');

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

function currentIndex(binary, size) {
    return parseInt(currentChunk(binary, size), 2);
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
        var index = currentIndex(binary);
        return index > MAX ? u : this.value[index];
    },
    set: function (binary, value) {
        var temp, current, index = currentIndex(binary);
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

function ArrayTrie(array) {
    return array.length <= MAX ? ArrayLeaf(array) : ArrayBranch(array);
}
ArrayBranch.prototype = assign(create(ArrayLeafPrototype), {
    get: function (binary) {
        var item = this.retreive(binary);
        return item instanceof ArrayLeaf ? item.get(nextChunk(binary)) : u;
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
        return this.value[currentIndex(binary, this.size)];
    },
    bunch: function () {
        // restructure to fit more in array
        var next = appropriatelySized();
        var current = this.value;
        next[0] = current;
        this.value = next;
    }
});

function build(branch, array) {
    fromTo(array, function (value, index, array) {
        var slice = array.slice(index, index + MAX);
        var next = array;
    }, 0, array.length, MAX);
}

function ArrayBranch(array, mutating, index, value) {
    var length = array.length;
    if (length > MAX) {
        this.value = appropriatelySized();
        this.size = length.toString(2);
        build(this, array);
    } else {
        this.value = fill(array);
    }
}