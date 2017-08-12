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
    forOwnEnd = require('@timelaps/n/for/own/end'),
    isValidIndex = require('@timelaps/is/valid-index'),
    toArray = require('@timelaps/to/array'),
    assign = require('@timelaps/object/assign'),
    returnsFirst = require('@timelaps/returns/first'),
    isEqual = require('@timelaps/is/equal'),
    keys = require('@timelaps/n/keys'),
    isUndefined = require('@timelaps/is/undefined'),
    toBoolean = require('@timelaps/hacks/to-boolean'),
    forEach = require('@timelaps/n/for/each'),
    ImmutableObject = module.exports = Classy.extend('ImmutableObject', {
        lifecycle: {
            created: function (supr, value, target) {
                supr();
                var context = this,
                    resolveStructure = context.member('resolveStructure'),
                    resolveArrayLike = context.member('resolveArrayLike'),
                    resolveObject = context.member('resolveObject'),
                    infos = resolveStructure(context, value, resolveArrayLike, resolveObject);
                context.target = target;
                assign(context, infos);
            }
        },
        members: {
            // assume whole thing is in a non mutable state
            // and we're just keeping a reference to it
            resolveStructure: resolveStructure,
            reconcile: reconcile
        },
        methods: {
            is: function (prop, value) {
                return checkEqual(this.mutable()[prop], unwrap(value));
            },
            diffs: function (sets) {
                var immutable = this;
                return reduce(toArray(sets), function (memo, value) {
                    return memo.concat(immutable.diff(value[0], value[1]));
                }, []);
            },
            diff: function (a, b) {
                return checkMany(a, b, differ(this.mutable()));
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
            }
        }
    });

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
    return reduce(key, function (memo, key) {
        return fn(memo, key, value);
    }, []);
}

function reduceObject(object, fn) {
    return reduceOwn(object, function (memo, value, key) {
        return fn(memo, key, value);
    }, []);
}

function differ(object, differences_) {
    var differences = differences_ || [];
    return function differInstance(key, value) {
        var diffs, next, current;
        if ((current = object[key]) === value) {
            return differences;
        } else if (isImmutable(current)) {
            diffs = current.diff(key, value);
            next = current.create(diffs);
            return differences.concat(diffs.length ? [function (clone) {
                clone[key] = next;
            }] : []);
        }
        return differences.concat(current === value ? [] : [function (clone) {
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
                return ImmutableArray(value, parent);
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
                return ImmutableObject(value, parent);
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