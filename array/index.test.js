var b= require('@timelaps/batterie');
var ArrayTrie = require('.');
b.describe('ArrayTrie', function () {
    b.expect(ArrayTrie).toBeFunction();
    b.expect(ArrayTrie.Leaf).toBeFunction();
    b.expect(ArrayTrie.Branch).toBeFunction();
    b.it('creates instances of Leafs', function (t) {
        var trie = ArrayTrie([]);
        t.expect(trie).toBeInstance(ArrayTrie.Leaf);
    });
    b.it('creates deeply nested structures', function (t) {
        var trie = ArrayTrie(new Array(256));
        t.expect(trie.value.length).toBe(32);
        t.expect(trie.depth).toBe(1);
    }, 2);
});