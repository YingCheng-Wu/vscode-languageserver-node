/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
exports.__esModule = true;
exports.TextEdits = exports.Ranges = exports.Positions = void 0;
var Positions;
(function (Positions) {
    function create(line, character) {
        return { line: line, character: character };
    }
    Positions.create = create;
    function afterSubstring(document, subText) {
        var index = document.getText().indexOf(subText);
        return document.positionAt(index + subText.length);
    }
    Positions.afterSubstring = afterSubstring;
})(Positions = exports.Positions || (exports.Positions = {}));
var Ranges;
(function (Ranges) {
    function create(startLine, startCharacter, endLine, endCharacter) {
        return { start: Positions.create(startLine, startCharacter), end: Positions.create(endLine, endCharacter) };
    }
    Ranges.create = create;
    function forSubstring(document, subText) {
        var index = document.getText().indexOf(subText);
        return { start: document.positionAt(index), end: document.positionAt(index + subText.length) };
    }
    Ranges.forSubstring = forSubstring;
    function afterSubstring(document, subText) {
        var pos = Positions.afterSubstring(document, subText);
        return { start: pos, end: pos };
    }
    Ranges.afterSubstring = afterSubstring;
})(Ranges = exports.Ranges || (exports.Ranges = {}));
var TextEdits;
(function (TextEdits) {
    function replace(range, newText) {
        return { range: range, newText: newText };
    }
    TextEdits.replace = replace;
    function insert(position, newText) {
        return { range: { start: position, end: position }, newText: newText };
    }
    TextEdits.insert = insert;
    function del(range) {
        return { range: range, newText: '' };
    }
    TextEdits.del = del;
})(TextEdits = exports.TextEdits || (exports.TextEdits = {}));
