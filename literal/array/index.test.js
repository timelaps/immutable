var b = require('@timelaps/batterie');
var ArrayTrie = require('.');
var now = require('@timelaps/polyfill/performance/now');
b.describe('ArrayTrie', function () {
    b.expect(ArrayTrie).toBeFunction();
    b.expect(ArrayTrie.Leaf).toBeFunction();
    b.expect(ArrayTrie.Branch).toBeFunction();
    b.it('creates instances of Leafs', function (t) {
        var trie = ArrayTrie([]);
        t.expect(trie).toBeInstance(ArrayTrie.Leaf);
    });
    b.it('creates deeply nested structures', function (t) {
        var sparce = new Array(1000000);
        sparce[450] = 50;
        var then = +(new Date());
        var trie = ArrayTrie(sparce);
        b.log(+(new Date()) - then);
        t.expect(trie.depth).toBe(3);
        t.expect(trie.get(450)).toBe(50);
    }, 2);
});