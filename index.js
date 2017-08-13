var Classy = require('@timelaps/classy'),
    map = require('@timelaps/n/map'),
    mapValues = require('@timelaps/n/map/values'),
    maker = require('@timelaps/fn/intended/maker'),
    checkMany = maker(reduceArrayLike, reduceObject),
    isArrayLike = require('@timelaps/is/array-like'),
    isObject = require('@timelaps/is/object'),
    has = require('@timelaps/n/has/shallow'),
    get = require('@timelaps/n/get/shallow'),
    set = require('@timelaps/n/set/shallow'),
    del = require('@timelaps/n/del/shallow'),
    setDeep = require('@timelaps/n/set/deep'),
    forOwnEnd = require('@timelaps/n/for/own/end'),
    isValidIndex = require('@timelaps/is/valid-index'),
    toArrayFromArrayLike = require('@timelaps/to/array/from/array-like'),
    assign = require('@timelaps/object/assign'),
    returnsFirst = require('@timelaps/returns/first'),
    isEqual = require('@timelaps/is/equal'),
    keys = require('@timelaps/n/keys'),
    isUndefined = require('@timelaps/is/undefined'),
    toBoolean = require('@timelaps/hacks/to-boolean'),
    forEach = require('@timelaps/n/for/each'),
    reduceOwn = require('@timelaps/array/reduce/own'),
    reduce = require('@timelaps/array/reduce'),
    generator = require('@timelaps/fn/generator'),
    isNumber = require('@timelaps/is/number'),
    counter = 0,
    b = require('@timelaps/batterie'),
    ImmutableObject = module.exports = Classy.extend('ImmutableObject', {
        constructor: function (supr, args) {
            supr(args);
            var context = this,
                structure = args[0],
                identifier = args[1] || (counter += 1),
                resolveStructure = context.member('resolveStructure'),
                resolveArrayLike = context.member('resolveArrayLike'),
                resolveObject = context.member('resolveObject'),
                // normalize data
                infos = resolveStructure(context, structure, resolveArrayLike, resolveObject),
                hasher = this.member('hasher'),
                pointers = this.member('pointers'),
                hashed = hasher(identifier, infos.value),
                pointer = pointers[hashed];
            if (pointer) {
                // return another pointer
                return pointer;
            }
            assign(context, infos);
            context.id = hashed;
            // save pointer in map to be used next time
            // this structure is created
            pointers[hashed] = context;
            // returns this automatically
        },
        members: {
            // assume whole thing is in a non mutable state
            // and we're just keeping a reference to it
            resolveStructure: resolveStructure,
            reconcile: reconcile,
            hasher: hash,
            pointers: {}
        },
        methods: {
            is: function (prop, value) {
                return checkEqual(this.mutable()[prop], unwrap(value));
            },
            diffs: function (sets) {
                var immutable = this;
                return reduce(toArrayFromArrayLike(sets), function (memo, value) {
                    return memo.concat(immutable.diff(value[0], value[1]));
                }, []);
            },
            diff: function (a, b, differences) {
                return checkMany(a, b, differ(this.mutable(), differences || []));
            },
            hash: function () {
                return this.id;
            },
            create: function (diffs) {
                var immutable = this;
                var reconciler = immutable.member('reconcile');
                var mutable = immutable.mutable();
                var reconciled = reconciler(immutable, diffs, returnsFirst);
                return immutable.__constructor__(reconciled);
            },
            mutable: function () {
                return this.value;
            },
            has: singleProxy(has),
            get: singleProxy(get),
            del: singleProxy(del),
            set: function (prop, value) {
                var diffs, structure = this.mutable();
                if (!(diffs = this.diff(prop, value)).length) {
                    return this;
                }
                // get the latest constructor, not just Hash
                return this.create(diffs);
            },
            getDeep: function (chain) {
                return reduce(chain, function (branch, key) {
                    return branch && branch.get(key);
                }, this);
            },
            setDeep: function (chain, value) {
                return this.set(toStructure(chain, value));
            },
            matches: function (object) {
                return computeDifferences(object, this.mutable());
            },
            isValueOf: function (object) {
                var alreadychecked = {};
                if (this.mutable() === object) {
                    return true;
                } else if (!isObject(object)) {
                    return false;
                } else {
                    return checkBothSidesForDifferences(this, b);
                }
            },
            isIterable: function () {
                return isIterable(this);
            },
            isRoot: function () {
                return !this.parent;
            },
            isLeaf: function () {
                return !this.isIterable();
            },
            isArray: function () {
                return this.isArrayLike();
            },
            isArrayLike: function () {
                return !this.keys;
            },
            toJSON: function () {
                return this.mutable();
            }
        }
    });
ImmutableObject.of = function of() {
    return this(toArrayFromArrayLike(arguments));
};

function decideWhichStructure(key) {
    return isValidIndex(key) && isNumber(key) ? [] : {};
}

function toStructure(path, value_) {
    var first = path[0];
    var value = value_;
    if (!isUndefined(first)) {
        value = decideWhichStructure(first);
        value[first] = toStructure(path.slice(1), value_);
    }
    return value;
}

function register(immutable, hash) {
    var id = immutable.id;
    if (isUndefined(id)) {
        id = immutable.id = immutable.member('hash')(immutable.mutable());
    }
    return id;
}

function hash(id, mutable) {
    return isArrayLike(mutable) ? hashArray(id, mutable) : (isObject(mutable) ? hashObject(id, mutable) : simpleHash(id, null, mutable));
}

function simpleHash(id, key, value) {
    // number or string
    return reduce((tv(key) + tv(value)).split(''), actualHash, 0);

    function tv(value) {
        return typeof value + value;
    }
}

function actualHash(hash_, string) {
    var char = string.charCodeAt(0),
        hash = ((hash_ << 5) - hash_) + char;
    return hash & hash; // Convert to 32bit integer
}

function hashObject(id, mutable) {
    return reduceOwn(mutable, function (memo, value, key) {
        if (isImmutable(value)) {
            return memo + simpleHash(id, key, 'immutable' + value.id);
        } else {
            return memo + simpleHash(id, key, value);
        }
    }, 0);
}

function hashArray(mutable) {}

function applyDifferences(mutable) {
    return function (delta) {
        delta(mutable);
    };
}

function reconcileItem(differences, item) {
    forEach(differences, applyDifferences(item));
    return item;
}

function makeObjectCopy(object) {
    // slow implementation for now
    return assign({}, object);
}

function makeArrayCopy(array) {
    // slow implementation for now
    return array.slice(0);
}

function reconcile(immutable, differences, swapper) {
    var mutable = immutable.mutable();
    if (immutable.isArray()) {
        return reconcileItem(differences, makeArrayCopy(mutable));
    } else {
        return reconcileItem(differences, makeObjectCopy(mutable));
    }
}

function singleProxy(fn) {
    return function (key) {
        return fn(this.mutable(), key);
    };
}

function checkBothSidesForDifferences(a, b) {
    var alreadychecked = {};
    var aKeys, bKeys, _a = a,
        _b = b;
    if (!isArrayLike(a)) {
        _a = keys(a);
        _b = keys(b);
    }
    if (_a.length !== _b.length) {
        return false;
    }
    return checkForDifferences(this, object, alreadychecked) && checkForDifferences(object, this, alreadychecked);
}

function checkForDifferences(a, b, alreadychecked, sameLengths) {
    return !isValidIndex(forOwnEnd(a, spotDifference(b, alreadychecked)));
}

function spotDifference(immutable, alreadychecked) {
    var mutable = immutable.mutable();
    return function (value, key) {
        var current = mutable[key];
        var valueIsImmutable = isImmutable(value);
        if (isImmutable(current)) {
            return current.matches(valueIsImmutable ? value.mutable() : value);
        } else if (valueIsImmutable) {
            return value.isValueOf(current);
        } else {
            return isValueEqual(current, value);
        }
    };
}

function isImmutable(item) {
    return ImmutableObject.isInstance(item);
}

function unwrap(value) {
    return isImmutable(value) ? value.mutable() : value;
}

function checkEqual(current, value) {
    if (isImmutable(current) && isObject(value)) {
        return current.findDifference(value);
    }
    return current === value;
}

function runFullImmutableCheck(current, value) {}

function traverse(prop) {}

function reduceArrayLike(key, value, fn) {
    return reduceOwn(key, function (memo, key) {
        return memo.concat(fn(key, value));
    }, []);
}

function reduceObject(object, fn) {
    return reduceOwn(object, function (memo, value, key) {
        return memo.concat(fn(key, value));
    }, []);
}

function differ(object, differences) {
    return function differInstance(key, value) {
        var fn, nu, diffs, current;
        if ((current = object[key]) === value) {
            return differences;
        } else if (isImmutable(current)) {
            if (isObject(value)) {
                nu = current.set(value);
            }
            if (nu === current) {
                return differences;
            } else if (!nu) {
                fn = function (clone) {
                    clone[key] = value;
                };
            } else {
                fn = function (clone) {
                    clone[key] = nu;
                };
            }
            return differences.concat([fn]);
        }
        return differences.concat([function (clone) {
            clone[key] = value;
        }]);
    };
}

function resolveArrayLikeStructure(array, parent) {
    return {
        length: array.length,
        value: map(array, function (value) {
            if (!isObject(value)) {
                return value;
            } else {
                return parent.__constructor__(value, parent);
            }
        })
    };
}

function resolveObjectStructure(object, parent) {
    // push because we're already
    // getting keys inside of mapValues
    var k = [];
    return {
        keys: k,
        value: mapValues(object, function (value_, key) {
            var matchesImmutable, value = value_;
            k.push(key);
            if (!isObject(value)) {
                // non object values are immutable
                return value;
            } else {
                return parent.__constructor__(value, parent);
            }
        }),
        length: k.length
    };
}

function isIterable(branch) {
    return !isUndefined(branch.length);
}

function leaf(item) {
    return {
        value: item
    };
}

function resolveStructure(context, item, resolveArrayLike_, resolveObject_) {
    var resolveArrayLike = resolveArrayLike_ || resolveArrayLikeStructure,
        resolveObject = resolveObject_ || resolveObjectStructure;
    // branches
    if (isImmutable(item)) {
        return item;
    } else if (isArrayLike(item)) {
        // should just array
        return resolveArrayLikeStructure(item, context);
    } else if (isObject(item)) {
        return resolveObjectStructure(item, context);
    } else {
        // leaf
        return leaf(item);
    }

    function resolve(item) {
        return resolveStructure(context, item, resolveArrayLike, resolveObject);
    }
}