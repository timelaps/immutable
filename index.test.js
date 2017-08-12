var b = require('@timelaps/batterie');
var Immutable = require('.');
b.describe('Immutable', function () {
    b.expect(Immutable).toBeFunction();
    // var i = Immutable([1, 2, 3]);
    // b.log(JSON.stringify(i, null, 2));
    // var j = Immutable({
    //     a: 1,
    //     b: 2,
    //     c: 3
    // });
    // b.log(JSON.stringify(j, null, 2));
    b.it('can check its structure', function (t) {
        var static = Immutable({
            key: 'value'
        });
        t.expect(static.is('key', 'value')).toBeTrue();
        var s1 = static.set('key', 1);
        t.expect(static.is('key', 'value')).toBeTrue();
        t.expect(s1.is('key', 1)).toBeTrue();
    }, 3);
});