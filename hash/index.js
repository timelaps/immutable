var STRUCTURE = 'Structure',
    has = require('@timelaps/n/has/shallow'),
    get = require('@timelaps/n/get/shallow'),
    set = require('@timelaps/n/set/shallow'),
    del = require('@timelaps/n/del/shallow'),
    Classy = require('@timelaps/classy'),
    HASH = 'Hash',
    forEachEnd = require('@timelaps/n/for/each/end'),
    reverseParams = require('../reverse-params'),
    forOwnEnd = require('@timelaps/n/for/own/end'),
    maker = require('./maker'),
    checkHash = maker(function (key, value, fn) {
        return forEachEnd(key, function (key) {
            return fn(key, value);
        });
    }, function (obj, fn) {
        return forOwnEnd(obj, reverseParams(fn));
    }),
    Hash = module.exports = Classy.extend(HASH, {
        lifecycle: {
            created: function (supr, value) {
                supr();
                reset(this, value);
            },
            destroyed: function (supr) {
                supr();
                reset(this);
            }
        },
        methods: {
            has: function (key) {
                return has(this.structure, key);
            },
            get: function (key) {
                return get(this.structure, key);
            },
            check: function (prop, value) {
                return !checkHash(prop, value, function () {});
            },
            set: function (prop, value) {
                var structure = this.structure;
                intendedObject(prop, value, function () {});
                if (structure[key] === value) {
                    return this;
                }
                return this.__constructor__(assign(assign({}, this.structure), props));
                // return set(this.structure, key, value);
            },
            del: function (key) {
                return del(this.structure, key);
            }
        }
    });

function reset(hash, value) {
    var structure = hash.structure = value;
    return structure;
}
// var isUndefined = require('@timelaps/is/undefined'),
//     bindWith = require('@timelaps/fn/bind/with'),
//     Directive = require('..'),
//     toBoolean = require('@timelaps/hacks/to-boolean'),
//     Pointer = module.exports = Directive.extend('Pointer', {
//         lifecycle: {
//             created: function (supr) {
//                 supr();
//                 this.reset();
//             }
//         },
//         methods: {
//             get: function (key, maker) {
//                 var value, getter, refs = this,
//                     values = refs.values,
//                     config = refs.configs[key];
//                 if ((getter = config.get)) {
//                     return getter(values[key], key, refs);
//                 } else if (refs.has(key)) {
//                     return values[key];
//                 } else if (maker) {
//                     value = maker(key, refs);
//                     refs.set(key, value);
//                     return value;
//                 }
//             },
//             set: function (key, value) {
//                 var values, setter, refs = this,
//                     config = refs.configs[key];
//                 if ((setter = config.set)) {
//                     return setter(value, key, refs);
//                 } else if (isUndefined(value)) {
//                     return refs.del(key);
//                 } else {
//                     values = refs.values;
//                     previous = this.get(key);
//                     values[key] = value;
//                     return previous !== value;
//                 }
//             },
//             del: function (key) {
//                 return this.has(key) && delete this.values[key];
//             },
//             has: function (key) {
//                 return this.static(key) || toBoolean(this.gets[key] || this.sets[key]);
//             },
//             define: function (key, opts) {
//                 this.gets[key] = opts.get;
//                 this.sets[key] = opts.set;
//             },
//             static: function (key) {
//                 return !isUndefined(this.values[key]);
//             },
//             point: function (key) {
//                 var context = this;
//                 return {
//                     get: bindWith(context.get, [context, key]),
//                     set: bindWith(context.set, [context, key])
//                 };
//             },
//             swap: function (id, value) {
//                 var cached = this.get(id);
//                 this.set(id, value);
//                 return cached;
//             },
//             reset: function (values) {
//                 var vals = this.values = values || {};
//                 this.configs = {};
//                 return vals;
//             }
//         }
//     });