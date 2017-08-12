// var b = require('@timelaps/batterie');
// var Hash = require('.');
// b.describe('Hash', function () {
//     var h0;
//     b.beforeSync(function () {
//         h0 = Hash();
//     });
//     b.describe('methods', function () {
//         b.describe('get', function () {
//             b.it('accesses values on the hash', function (t) {
//                 t.expect(h0.get('none')).toBeUndefined();
//             });
//         });
//         b.describe('set', function () {
//             b.it('sets values on the hash and returns a new one if it is not strictly equal', function (t) {
//                 var obj1 = {};
//                 var h1 = h0.set('key', obj1);
//                 t.expect(h0.get('key')).toBeUndefined();
//                 t.expect(h1.get('key')).toBe(obj1);
//             }, 2);
//             b.it('can set many values', function (t) {
//                 var h1 = h0.set({
//                     keytone: 'many'
//                 });
//                 t.expect(h0.get('keytone')).toBeUndefined();
//                 t.expect(h1.get('keytone')).toBe('many');
//             }, 2);
//         });
//         b.describe('has', function () {
//             b.it('checks if it has a value', function (t) {
//                 t.expect(h0.has('key')).toBeFalse();
//                 var h1 = h0.set('key', 'value');
//                 t.expect(h0.has('key')).toBeFalse();
//                 t.expect(h1.has('key')).toBeTrue();
//             }, 3);
//         });
//     });
// });