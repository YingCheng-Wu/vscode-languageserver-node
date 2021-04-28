/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
exports.__esModule = true;
var assert = require("assert");
var main_1 = require("../main");
var helper_1 = require("./helper");
function newDocument(str) {
    return main_1.TextDocument.create('file://foo/bar', 'text', 0, str);
}
suite('Text Document Lines Model Validator', function () {
    test('Empty content', function () {
        var str = '';
        var document = newDocument(str);
        assert.equal(document.lineCount, 1);
        assert.equal(document.offsetAt(helper_1.Positions.create(0, 0)), 0);
        assert.deepEqual(document.positionAt(0), helper_1.Positions.create(0, 0));
    });
    test('Single line', function () {
        var str = 'Hello World';
        var document = newDocument(str);
        assert.equal(document.lineCount, 1);
        for (var i = 0; i < str.length; i++) {
            assert.equal(document.offsetAt(helper_1.Positions.create(0, i)), i);
            assert.deepEqual(document.positionAt(i), helper_1.Positions.create(0, i));
        }
    });
    test('Multiple lines', function () {
        var str = 'ABCDE\nFGHIJ\nKLMNO\n';
        var document = newDocument(str);
        assert.equal(document.lineCount, 4);
        for (var i = 0; i < str.length; i++) {
            var line = Math.floor(i / 6);
            var column = i % 6;
            assert.equal(document.offsetAt(helper_1.Positions.create(line, column)), i);
            assert.deepEqual(document.positionAt(i), helper_1.Positions.create(line, column));
        }
        assert.equal(document.offsetAt(helper_1.Positions.create(3, 0)), 18);
        assert.equal(document.offsetAt(helper_1.Positions.create(3, 1)), 18);
        assert.deepEqual(document.positionAt(18), helper_1.Positions.create(3, 0));
        assert.deepEqual(document.positionAt(19), helper_1.Positions.create(3, 0));
    });
    test('Starts with new-line', function () {
        var document = newDocument('\nABCDE');
        assert.equal(document.lineCount, 2);
        assert.deepEqual(document.positionAt(0), helper_1.Positions.create(0, 0));
        assert.deepEqual(document.positionAt(1), helper_1.Positions.create(1, 0));
        assert.deepEqual(document.positionAt(6), helper_1.Positions.create(1, 5));
    });
    test('New line characters', function () {
        var str = 'ABCDE\rFGHIJ';
        assert.equal(newDocument(str).lineCount, 2);
        str = 'ABCDE\nFGHIJ';
        assert.equal(newDocument(str).lineCount, 2);
        str = 'ABCDE\r\nFGHIJ';
        assert.equal(newDocument(str).lineCount, 2);
        str = 'ABCDE\n\nFGHIJ';
        assert.equal(newDocument(str).lineCount, 3);
        str = 'ABCDE\r\rFGHIJ';
        assert.equal(newDocument(str).lineCount, 3);
        str = 'ABCDE\n\rFGHIJ';
        assert.equal(newDocument(str).lineCount, 3);
    });
    test('getText(Range)', function () {
        var str = '12345\n12345\n12345';
        var document = newDocument(str);
        assert.equal(document.getText(), str);
        assert.equal(document.getText(helper_1.Ranges.create(-1, 0, 0, 5)), '12345');
        assert.equal(document.getText(helper_1.Ranges.create(0, 0, 0, 5)), '12345');
        assert.equal(document.getText(helper_1.Ranges.create(0, 4, 1, 1)), '5\n1');
        assert.equal(document.getText(helper_1.Ranges.create(0, 4, 2, 1)), '5\n12345\n1');
        assert.equal(document.getText(helper_1.Ranges.create(0, 4, 3, 1)), '5\n12345\n12345');
        assert.equal(document.getText(helper_1.Ranges.create(0, 0, 3, 5)), str);
    });
    test('Invalid inputs', function () {
        var str = 'Hello World';
        var document = newDocument(str);
        // invalid position
        assert.equal(document.offsetAt(helper_1.Positions.create(0, str.length)), str.length);
        assert.equal(document.offsetAt(helper_1.Positions.create(0, str.length + 3)), str.length);
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 3)), str.length);
        assert.equal(document.offsetAt(helper_1.Positions.create(-1, 3)), 0);
        assert.equal(document.offsetAt(helper_1.Positions.create(0, -3)), 0);
        assert.equal(document.offsetAt(helper_1.Positions.create(1, -3)), str.length);
        // invalid offsets
        assert.deepEqual(document.positionAt(-1), helper_1.Positions.create(0, 0));
        assert.deepEqual(document.positionAt(str.length), helper_1.Positions.create(0, str.length));
        assert.deepEqual(document.positionAt(str.length + 3), helper_1.Positions.create(0, str.length));
    });
});
suite('Text Document Full Updates', function () {
    test('One full update', function () {
        var document = newDocument('abc123');
        main_1.TextDocument.update(document, [{ text: 'efg456' }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'efg456');
    });
    test('Several full content updates', function () {
        var document = newDocument('abc123');
        main_1.TextDocument.update(document, [{ text: 'hello' }, { text: 'world' }], 2);
        assert.strictEqual(document.version, 2);
        assert.strictEqual(document.getText(), 'world');
    });
});
suite('Text Document Incremental Updates', function () {
    // assumes that only '\n' is used
    function assertValidLineNumbers(doc) {
        var text = doc.getText();
        var expectedLineNumber = 0;
        for (var i = 0; i < text.length; i++) {
            assert.equal(doc.positionAt(i).line, expectedLineNumber);
            var ch = text[i];
            if (ch === '\n') {
                expectedLineNumber++;
            }
        }
        assert.equal(doc.positionAt(text.length).line, expectedLineNumber);
    }
    test('Incrementally removing content', function () {
        var document = newDocument('function abc() {\n  console.log("hello, world!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: '', range: helper_1.Ranges.forSubstring(document, 'hello, world!') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  console.log("");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
    });
    test('Incrementally removing multi-line content', function () {
        var document = newDocument('function abc() {\n  foo();\n  bar();\n  \n}');
        assert.equal(document.lineCount, 5);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: '', range: helper_1.Ranges.forSubstring(document, '  foo();\n  bar();\n') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  \n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
    });
    test('Incrementally removing multi-line content 2', function () {
        var document = newDocument('function abc() {\n  foo();\n  bar();\n  \n}');
        assert.equal(document.lineCount, 5);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: '', range: helper_1.Ranges.forSubstring(document, 'foo();\n  bar();') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  \n  \n}');
        assert.equal(document.lineCount, 4);
        assertValidLineNumbers(document);
    });
    test('Incrementally adding content', function () {
        var document = newDocument('function abc() {\n  console.log("hello");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: ', world!', range: helper_1.Ranges.afterSubstring(document, 'hello') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  console.log("hello, world!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
    });
    test('Incrementally adding multi-line content', function () {
        var document = newDocument('function abc() {\n  while (true) {\n    foo();\n  };\n}');
        assert.equal(document.lineCount, 5);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: '\n    bar();', range: helper_1.Ranges.afterSubstring(document, 'foo();') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  while (true) {\n    foo();\n    bar();\n  };\n}');
        assert.equal(document.lineCount, 6);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing single-line content, more chars', function () {
        var document = newDocument('function abc() {\n  console.log("hello, world!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: 'hello, test case!!!', range: helper_1.Ranges.forSubstring(document, 'hello, world!') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  console.log("hello, test case!!!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing single-line content, less chars', function () {
        var document = newDocument('function abc() {\n  console.log("hello, world!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: 'hey', range: helper_1.Ranges.forSubstring(document, 'hello, world!') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  console.log("hey");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing single-line content, same num of chars', function () {
        var document = newDocument('function abc() {\n  console.log("hello, world!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: 'world, hello!', range: helper_1.Ranges.forSubstring(document, 'hello, world!') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abc() {\n  console.log("world, hello!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing multi-line content, more lines', function () {
        var document = newDocument('function abc() {\n  console.log("hello, world!");\n}');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: '\n//hello\nfunction d(){', range: helper_1.Ranges.forSubstring(document, 'function abc() {') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), '\n//hello\nfunction d(){\n  console.log("hello, world!");\n}');
        assert.equal(document.lineCount, 5);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing multi-line content, less lines', function () {
        var document = newDocument('a1\nb1\na2\nb2\na3\nb3\na4\nb4\n');
        assert.equal(document.lineCount, 9);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: 'xx\nyy', range: helper_1.Ranges.forSubstring(document, '\na3\nb3\na4\nb4\n') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'a1\nb1\na2\nb2xx\nyy');
        assert.equal(document.lineCount, 5);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing multi-line content, same num of lines and chars', function () {
        var document = newDocument('a1\nb1\na2\nb2\na3\nb3\na4\nb4\n');
        assert.equal(document.lineCount, 9);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: '\nxx1\nxx2', range: helper_1.Ranges.forSubstring(document, 'a2\nb2\na3') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'a1\nb1\n\nxx1\nxx2\nb3\na4\nb4\n');
        assert.equal(document.lineCount, 9);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing multi-line content, same num of lines but diff chars', function () {
        var document = newDocument('a1\nb1\na2\nb2\na3\nb3\na4\nb4\n');
        assert.equal(document.lineCount, 9);
        assertValidLineNumbers(document);
        main_1.TextDocument.update(document, [{ text: '\ny\n', range: helper_1.Ranges.forSubstring(document, 'a2\nb2\na3') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'a1\nb1\n\ny\n\nb3\na4\nb4\n');
        assert.equal(document.lineCount, 9);
        assertValidLineNumbers(document);
    });
    test('Incrementally replacing multi-line content, huge number of lines', function () {
        var document = newDocument('a1\ncc\nb1');
        assert.equal(document.lineCount, 3);
        assertValidLineNumbers(document);
        var text = new Array(20000).join('\ndd'); // a string with 19999 `\n`
        main_1.TextDocument.update(document, [{ text: text, range: helper_1.Ranges.forSubstring(document, '\ncc') }], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'a1' + text + '\nb1');
        assert.equal(document.lineCount, 20001);
        assertValidLineNumbers(document);
    });
    test('Several incremental content changes', function () {
        var document = newDocument('function abc() {\n  console.log("hello, world!");\n}');
        main_1.TextDocument.update(document, [
            { text: 'defg', range: helper_1.Ranges.create(0, 12, 0, 12) },
            { text: 'hello, test case!!!', range: helper_1.Ranges.create(1, 15, 1, 28) },
            { text: 'hij', range: helper_1.Ranges.create(0, 16, 0, 16) },
        ], 1);
        assert.strictEqual(document.version, 1);
        assert.strictEqual(document.getText(), 'function abcdefghij() {\n  console.log("hello, test case!!!");\n}');
        assertValidLineNumbers(document);
    });
    test('Basic append', function () {
        var document = newDocument('foooo\nbar\nbaz');
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 0)), 10);
        main_1.TextDocument.update(document, [{ text: ' some extra content', range: helper_1.Ranges.create(1, 3, 1, 3) }], 1);
        assert.equal(document.getText(), 'foooo\nbar some extra content\nbaz');
        assert.equal(document.version, 1);
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 0)), 29);
        assertValidLineNumbers(document);
    });
    test('Multi-line append', function () {
        var document = newDocument('foooo\nbar\nbaz');
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 0)), 10);
        main_1.TextDocument.update(document, [{ text: ' some extra\ncontent', range: helper_1.Ranges.create(1, 3, 1, 3) }], 1);
        assert.equal(document.getText(), 'foooo\nbar some extra\ncontent\nbaz');
        assert.equal(document.version, 1);
        assert.equal(document.offsetAt(helper_1.Positions.create(3, 0)), 29);
        assert.equal(document.lineCount, 4);
        assertValidLineNumbers(document);
    });
    test('Basic delete', function () {
        var document = newDocument('foooo\nbar\nbaz');
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 0)), 10);
        main_1.TextDocument.update(document, [{ text: '', range: helper_1.Ranges.create(1, 0, 1, 3) }], 1);
        assert.equal(document.getText(), 'foooo\n\nbaz');
        assert.equal(document.version, 1);
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 0)), 7);
        assertValidLineNumbers(document);
    });
    test('Multi-line delete', function () {
        var lm = newDocument('foooo\nbar\nbaz');
        assert.equal(lm.offsetAt(helper_1.Positions.create(2, 0)), 10);
        main_1.TextDocument.update(lm, [{ text: '', range: helper_1.Ranges.create(0, 5, 1, 3) }], 1);
        assert.equal(lm.getText(), 'foooo\nbaz');
        assert.equal(lm.version, 1);
        assert.equal(lm.offsetAt(helper_1.Positions.create(1, 0)), 6);
        assertValidLineNumbers(lm);
    });
    test('Single character replace', function () {
        var document = newDocument('foooo\nbar\nbaz');
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 0)), 10);
        main_1.TextDocument.update(document, [{ text: 'z', range: helper_1.Ranges.create(1, 2, 1, 3) }], 2);
        assert.equal(document.getText(), 'foooo\nbaz\nbaz');
        assert.equal(document.version, 2);
        assert.equal(document.offsetAt(helper_1.Positions.create(2, 0)), 10);
        assertValidLineNumbers(document);
    });
    test('Multi-character replace', function () {
        var lm = newDocument('foo\nbar');
        assert.equal(lm.offsetAt(helper_1.Positions.create(1, 0)), 4);
        main_1.TextDocument.update(lm, [{ text: 'foobar', range: helper_1.Ranges.create(1, 0, 1, 3) }], 1);
        assert.equal(lm.getText(), 'foo\nfoobar');
        assert.equal(lm.version, 1);
        assert.equal(lm.offsetAt(helper_1.Positions.create(1, 0)), 4);
        assertValidLineNumbers(lm);
    });
    test('Invalid update ranges', function () {
        // Before the document starts -> before the document starts
        var document = newDocument('foo\nbar');
        main_1.TextDocument.update(document, [{ text: 'abc123', range: helper_1.Ranges.create(-2, 0, -1, 3) }], 2);
        assert.equal(document.getText(), 'abc123foo\nbar');
        assert.equal(document.version, 2);
        assertValidLineNumbers(document);
        // Before the document starts -> the middle of document
        document = newDocument('foo\nbar');
        main_1.TextDocument.update(document, [{ text: 'foobar', range: helper_1.Ranges.create(-1, 0, 0, 3) }], 2);
        assert.equal(document.getText(), 'foobar\nbar');
        assert.equal(document.version, 2);
        assert.equal(document.offsetAt(helper_1.Positions.create(1, 0)), 7);
        assertValidLineNumbers(document);
        // The middle of document -> after the document ends
        document = newDocument('foo\nbar');
        main_1.TextDocument.update(document, [{ text: 'foobar', range: helper_1.Ranges.create(1, 0, 1, 10) }], 2);
        assert.equal(document.getText(), 'foo\nfoobar');
        assert.equal(document.version, 2);
        assert.equal(document.offsetAt(helper_1.Positions.create(1, 1000)), 10);
        assertValidLineNumbers(document);
        // After the document ends -> after the document ends
        document = newDocument('foo\nbar');
        main_1.TextDocument.update(document, [{ text: 'abc123', range: helper_1.Ranges.create(3, 0, 6, 10) }], 2);
        assert.equal(document.getText(), 'foo\nbarabc123');
        assert.equal(document.version, 2);
        assertValidLineNumbers(document);
        // Before the document starts -> after the document ends
        document = newDocument('foo\nbar');
        main_1.TextDocument.update(document, [{ text: 'entirely new content', range: helper_1.Ranges.create(-1, 1, 2, 10000) }], 2);
        assert.equal(document.getText(), 'entirely new content');
        assert.equal(document.version, 2);
        assert.equal(document.lineCount, 1);
        assertValidLineNumbers(document);
    });
});
