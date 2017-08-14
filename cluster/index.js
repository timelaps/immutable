var Classy = require('@timelaps/classy');
var remove = require('@timelaps/array/remove');
var find = require('@timelaps/array/find');
module.exports = Classy.extend('Cluster', {
    lifecycle: {
        created: function (supr) {
            supr();
            this.pointers = {};
        }
    },
    methods: {
        get: function (group, key) {
            var g = this.pointers[group];
            return g && resolveLocation(g, key);
        },
        set: function (group, key, value) {
            var pointers = this.pointers;
            var g = pointers[group];
            if (!g) {
                g = pointers[group] = [];
            }
            var hashed = g[key];
            if (!hashed) {
                g[key] = {
                    first: value,
                    next: []
                };
                return;
            } else {
                hashed.next.push(value);
            }
        },
        has: function (group_, key_, value) {
            var group, hashed, pointers = this.pointers;
            if (!(group = pointers[group_]) || !(hashed = group[key_])) {
                return false;
            } else {
                return hashed.first === value || find(hashed.next, curriedStrictlyEqual(value));
            }
        },
        del: function (group_, key_, value) {
            var next, group, hashed, pointers = this.pointers;
            if (!(group = pointers[group_]) || !(hashed = group[key_])) {
                return;
            } else if (hashed.first === value) {
                next = hashed.next;
                if (next.length) {
                    hashed.first = next[0];
                    hashed.next = next.slice(1);
                } else {
                    delete group[key];
                }
            } else {
                remove(hashed.next, value);
            }
        }
    }
});

function curriedStrictlyEqual(value) {
    return function (item) {
        return item === value;
    };
}

function resolveLocation(level, key) {
    var hashed = level[key];
    return hashed && hashed.first;
}