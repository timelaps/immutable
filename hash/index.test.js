var b = require('@timelaps/batterie');
var Pointer = require('.');
b.describe('Pointer', function () {
    b.expect(Pointer()).toBeDirective();
    var pointer;
    b.beforeSync(function () {
        pointer = Pointer();
    });
    b.describe('methods', function () {
        b.describe('get', function () {
            b.it('accesses values on the pointer', function (t) {
                t.expect(pointer.get('none')).toBeUndefined();
            });
        });
        b.describe('set', function () {
            b.it('sets values on the pointer', function (t) {
                var obj1 = {};
                t.expect(pointer.set('key', obj1)).toBeTrue();
                t.expect(pointer.get('key')).toBe(obj1);
                t.expect(pointer.set('key', obj1)).toBeFalse();
            }, 3);
        });
        b.describe('has', function () {
            b.it('checks if it has a value or dynamic calculator', function (t) {
                t.expect(pointer.has('key')).toBeFalse();
            });
        });
    });
});