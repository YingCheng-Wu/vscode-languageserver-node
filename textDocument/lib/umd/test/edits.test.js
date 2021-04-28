/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
exports.__esModule = true;
var assert = require("assert");
var main_1 = require("../main");
var helper_1 = require("./helper");
var applyEdits = main_1.TextDocument.applyEdits;
suite('Edits', function () {
    test('inserts', function () {
        var input = main_1.TextDocument.create('foo://bar/f', 'html', 0, '012345678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.insert(helper_1.Positions.create(0, 0), 'Hello')]), 'Hello012345678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.insert(helper_1.Positions.create(0, 1), 'Hello')]), '0Hello12345678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.insert(helper_1.Positions.create(0, 1), 'Hello'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 1), 'World')]), '0HelloWorld12345678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.insert(helper_1.Positions.create(0, 2), 'One'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 1), 'Hello'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 1), 'World'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 2), 'Two'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 2), 'Three')]), '0HelloWorld1OneTwoThree2345678901234567890123456789');
    });
    test('replace', function () {
        var input = main_1.TextDocument.create('foo://bar/f', 'html', 0, '012345678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.replace(helper_1.Ranges.create(0, 3, 0, 6), 'Hello')]), '012Hello678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.replace(helper_1.Ranges.create(0, 3, 0, 6), 'Hello'), helper_1.TextEdits.replace(helper_1.Ranges.create(0, 6, 0, 9), 'World')]), '012HelloWorld901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.replace(helper_1.Ranges.create(0, 3, 0, 6), 'Hello'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 6), 'World')]), '012HelloWorld678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.insert(helper_1.Positions.create(0, 6), 'World'), helper_1.TextEdits.replace(helper_1.Ranges.create(0, 3, 0, 6), 'Hello')]), '012HelloWorld678901234567890123456789');
        assert.equal(applyEdits(input, [helper_1.TextEdits.insert(helper_1.Positions.create(0, 3), 'World'), helper_1.TextEdits.replace(helper_1.Ranges.create(0, 3, 0, 6), 'Hello')]), '012WorldHello678901234567890123456789');
    });
    test('overlap', function () {
        var input = main_1.TextDocument.create('foo://bar/f', 'html', 0, '012345678901234567890123456789');
        assert.throws(function () { return applyEdits(input, [helper_1.TextEdits.replace(helper_1.Ranges.create(0, 3, 0, 6), 'Hello'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 3), 'World')]); });
        assert.throws(function () { return applyEdits(input, [helper_1.TextEdits.replace(helper_1.Ranges.create(0, 3, 0, 6), 'Hello'), helper_1.TextEdits.insert(helper_1.Positions.create(0, 4), 'World')]); });
    });
    test('multiline', function () {
        var input = main_1.TextDocument.create('foo://bar/f', 'html', 0, '0\n1\n2\n3\n4');
        assert.equal(applyEdits(input, [helper_1.TextEdits.replace(helper_1.Ranges.create(2, 0, 3, 0), 'Hello'), helper_1.TextEdits.insert(helper_1.Positions.create(1, 1), 'World')]), '0\n1World\nHello3\n4');
    });
});
