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
        get: function (group, key, value) {
            var pointers = this.pointers;
            var level = pointers[group];
            if (!level) {
                level = pointers[group] = {};
            }
            var hashed = level[key];
            var length = arguments.length;
            return hashed && (length === 3 ? findValueGiven(hash, value) : hashed.first);
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
                // missleading for undefined
                return arguments.length === 3 ? findValueGiven(hashed, value) === value : true;
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

function findValueGiven(hashed, value) {
    var first = hashed.first;
    return first === value ? first : find(hashed.next, function (item) {
        return item === value;
    });
}