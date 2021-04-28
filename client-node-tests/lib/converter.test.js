"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const proto = require("vscode-languageserver-protocol");
const codeConverter = require("vscode-languageclient/lib/common/codeConverter");
const protocolConverter = require("vscode-languageclient/lib/common/protocolConverter");
const protocolCompletionItem_1 = require("vscode-languageclient/lib/common/protocolCompletionItem");
const protocolDiagnostic_1 = require("vscode-languageclient/lib/common/protocolDiagnostic");
const Is = require("vscode-languageclient/lib/common/utils/is");
const vscode = require("vscode");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const c2p = codeConverter.createConverter();
const p2c = protocolConverter.createConverter(undefined, false);
var InsertReplaceRange;
(function (InsertReplaceRange) {
    function is(value) {
        const candidate = value;
        return candidate && !!candidate.inserting && !!candidate.replacing;
    }
    InsertReplaceRange.is = is;
})(InsertReplaceRange || (InsertReplaceRange = {}));
function assertDefined(value) {
    assert_1.ok(value !== undefined && value !== null);
}
function assertComplexCode(value) {
    if (value === undefined || typeof value === 'number' || typeof value === 'string') {
        throw new Error(`Code is not complex`);
    }
}
function assertRange(value) {
    if (!value || InsertReplaceRange.is(value)) {
        throw new Error(`Expected a normal range but got an insert / replace range.`);
    }
}
function assertInsertReplaceRange(value) {
    if (!value || !InsertReplaceRange.is(value)) {
        throw new Error(`Expected an insert / replace range but got a normal range.`);
    }
}
function assertTextEdit(value) {
    if (!value || proto.InsertReplaceEdit.is(value)) {
        throw new Error(`Expected a text edit but got an insert replace edit.`);
    }
}
function assertInsertReplaceEdit(value) {
    if (!value || !proto.InsertReplaceEdit.is(value)) {
        throw new Error(`Expected an insert replace edit but got a normal text edit.`);
    }
}
function assertDiagnosticCode(value) {
    if (!value || !protocolDiagnostic_1.DiagnosticCode.is(value)) {
        throw new Error(`Expected complex diagnostic code.`);
    }
}
suite('Protocol Converter', () => {
    function rangeEqual(actual, expected) {
        assert_1.strictEqual(actual.start.line, expected.start.line);
        assert_1.strictEqual(actual.start.character, expected.start.character);
        assert_1.strictEqual(actual.end.line, expected.end.line);
        assert_1.strictEqual(actual.end.character, expected.end.character);
    }
    function completionEditEqual(text, range, expected) {
        assert_1.strictEqual(text, expected.newText);
        if (InsertReplaceRange.is(range)) {
            assert_1.ok(proto.InsertReplaceEdit.is(expected));
        }
        else {
            assertTextEdit(expected);
            rangeEqual(range, expected.range);
        }
    }
    test('Position Converter', () => {
        let position = { line: 1, character: 2 };
        let result = p2c.asPosition(position);
        assert_1.strictEqual(result.line, position.line);
        assert_1.strictEqual(result.character, position.character);
        assert_1.strictEqual(p2c.asPosition(null), undefined);
        assert_1.strictEqual(p2c.asPosition(undefined), undefined);
    });
    test('Range Converter', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let result = p2c.asRange({ start, end });
        assert_1.strictEqual(result.start.line, start.line);
        assert_1.strictEqual(result.start.character, start.character);
        assert_1.strictEqual(result.end.line, end.line);
        assert_1.strictEqual(result.end.character, end.character);
        assert_1.strictEqual(p2c.asRange(null), undefined);
        assert_1.strictEqual(p2c.asRange(undefined), undefined);
    });
    test('Diagnostic Severity', () => {
        assert_1.strictEqual(p2c.asDiagnosticSeverity(proto.DiagnosticSeverity.Error), vscode.DiagnosticSeverity.Error);
        assert_1.strictEqual(p2c.asDiagnosticSeverity(proto.DiagnosticSeverity.Warning), vscode.DiagnosticSeverity.Warning);
        assert_1.strictEqual(p2c.asDiagnosticSeverity(proto.DiagnosticSeverity.Information), vscode.DiagnosticSeverity.Information);
        assert_1.strictEqual(p2c.asDiagnosticSeverity(proto.DiagnosticSeverity.Hint), vscode.DiagnosticSeverity.Hint);
    });
    test('Diagnostic Tag', () => {
        assert_1.strictEqual(p2c.asDiagnosticTag(proto.DiagnosticTag.Unnecessary), vscode.DiagnosticTag.Unnecessary);
        assert_1.strictEqual(p2c.asDiagnosticTag(proto.DiagnosticTag.Deprecated), vscode.DiagnosticTag.Deprecated);
    });
    test('Diagnostic', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        const location = proto.Location.create('file://localhost/folder/file', proto.Range.create(0, 1, 2, 3));
        let diagnostic = {
            range: { start, end },
            message: 'error',
            severity: proto.DiagnosticSeverity.Error,
            code: 99,
            source: 'source',
            tags: [proto.DiagnosticTag.Unnecessary],
            relatedInformation: [
                { message: 'related', location: location }
            ]
        };
        let result = p2c.asDiagnostic(diagnostic);
        let range = result.range;
        assert_1.strictEqual(range.start.line, start.line);
        assert_1.strictEqual(range.start.character, start.character);
        assert_1.strictEqual(range.end.line, end.line);
        assert_1.strictEqual(range.end.character, end.character);
        assert_1.strictEqual(result.message, diagnostic.message);
        assert_1.strictEqual(result.code, diagnostic.code);
        assert_1.strictEqual(result.source, diagnostic.source);
        assert_1.strictEqual(result.severity, vscode.DiagnosticSeverity.Error);
        assert_1.strictEqual(result.tags !== undefined, true);
        assert_1.strictEqual(result.tags[0], vscode.DiagnosticTag.Unnecessary);
        assert_1.strictEqual(Array.isArray(result.relatedInformation), true);
        assert_1.strictEqual(result.relatedInformation.length, 1);
        assert_1.strictEqual(result.relatedInformation[0].message, 'related');
        assert_1.strictEqual(result.relatedInformation[0].location.uri.toString(), 'file://localhost/folder/file');
        assert_1.strictEqual(result.relatedInformation[0].location.range.end.character, 3);
        assert_1.ok(p2c.asDiagnostics([diagnostic]).every(value => value instanceof vscode.Diagnostic));
    });
    test('Diagnostic - Complex Code', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let diagnostic = {
            range: { start, end },
            message: 'error',
            severity: proto.DiagnosticSeverity.Error,
            code: 99,
            codeDescription: {
                href: 'https://code.visualstudio.com/'
            },
            source: 'source',
        };
        let result = p2c.asDiagnostic(diagnostic);
        assertDefined(result.code);
        assertComplexCode(result.code);
        assert_1.strictEqual(result.code.value, 99);
        assert_1.strictEqual(result.code.target.toString(), 'https://code.visualstudio.com/');
    });
    test('Diagnostic - Complex Code - Deprecated', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let diagnostic = {
            range: { start, end },
            message: 'error',
            severity: proto.DiagnosticSeverity.Error,
            code: { value: 99, target: 'https://code.visualstudio.com/' },
            source: 'source',
        };
        let result = p2c.asDiagnostic(diagnostic);
        assertDefined(result.code);
        assertComplexCode(result.code);
        assert_1.strictEqual(result.code.value, 99);
        assert_1.strictEqual(result.code.target.toString(), 'https://code.visualstudio.com/');
    });
    test('Hover', () => {
        assert_1.strictEqual(p2c.asHover(undefined), undefined);
        assert_1.strictEqual(p2c.asHover(null), undefined);
        let hover = {
            contents: 'hover'
        };
        let result = p2c.asHover(hover);
        assert_1.strictEqual(result.contents.length, 1);
        assert_1.ok(result.contents[0] instanceof vscode.MarkdownString);
        assert_1.strictEqual(result.contents[0].value, 'hover');
        assert_1.strictEqual(result.range, undefined);
        hover.range = {
            start: { line: 1, character: 2 },
            end: { line: 8, character: 9 }
        };
        result = p2c.asHover(hover);
        let range = result.range;
        assert_1.strictEqual(range.start.line, hover.range.start.line);
        assert_1.strictEqual(range.start.character, hover.range.start.character);
        assert_1.strictEqual(range.end.line, hover.range.end.line);
        assert_1.strictEqual(range.end.character, hover.range.end.character);
        /*
        let multiSegmentHover: proto.Hover = {
            contents:{
                kind: MarkupKind.Markdown,
                value:`First Section
                ---
                Second Section
                ---
                Third Section`
            }
        }
        result = p2c.asHover(multiSegmentHover);
        strictEqual(result.contents.length, 3);
        strictEqual((result.contents[0] as vscode.MarkdownString).value, 'First Section');
        strictEqual((result.contents[1] as vscode.MarkdownString).value, 'Second Section');
        strictEqual((result.contents[2] as vscode.MarkdownString).value, 'Third Section');
        strictEqual(result.range, undefined);
        */
    });
    test('Text Edit undefined | null', () => {
        assert_1.strictEqual(p2c.asTextEdit(null), undefined);
        assert_1.strictEqual(p2c.asTextEdit(undefined), undefined);
    });
    test('Text Edit Insert', () => {
        let edit = proto.TextEdit.insert({ line: 1, character: 2 }, 'insert');
        let result = p2c.asTextEdit(edit);
        let range = result.range;
        assert_1.strictEqual(range.start.line, edit.range.start.line);
        assert_1.strictEqual(range.start.character, edit.range.start.character);
        assert_1.strictEqual(range.end.line, edit.range.end.line);
        assert_1.strictEqual(range.end.character, edit.range.end.character);
        assert_1.strictEqual(result.newText, edit.newText);
    });
    test('Text Edit Replace', () => {
        let edit = proto.TextEdit.replace({
            start: { line: 1, character: 2 },
            end: { line: 8, character: 9 }
        }, 'insert');
        let result = p2c.asTextEdit(edit);
        let range = result.range;
        assert_1.strictEqual(range.start.line, edit.range.start.line);
        assert_1.strictEqual(range.start.character, edit.range.start.character);
        assert_1.strictEqual(range.end.line, edit.range.end.line);
        assert_1.strictEqual(range.end.character, edit.range.end.character);
        assert_1.strictEqual(result.newText, edit.newText);
    });
    test('Text Edit Delete', () => {
        let edit = proto.TextEdit.del({
            start: { line: 1, character: 2 },
            end: { line: 8, character: 9 }
        });
        let result = p2c.asTextEdit(edit);
        let range = result.range;
        assert_1.strictEqual(range.start.line, edit.range.start.line);
        assert_1.strictEqual(range.start.character, edit.range.start.character);
        assert_1.strictEqual(range.end.line, edit.range.end.line);
        assert_1.strictEqual(range.end.character, edit.range.end.character);
        assert_1.strictEqual(result.newText, edit.newText);
    });
    test('Text Edits', () => {
        let edit = proto.TextEdit.del({
            start: { line: 1, character: 2 },
            end: { line: 8, character: 9 }
        });
        assert_1.ok(p2c.asTextEdits([edit]).every(elem => elem instanceof vscode.TextEdit));
        assert_1.strictEqual(p2c.asTextEdits(undefined), undefined);
        assert_1.strictEqual(p2c.asTextEdits(null), undefined);
        assert_1.deepEqual(p2c.asTextEdits([]), []);
    });
    test('Completion Item', () => {
        let completionItem = {
            label: 'item'
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.detail, undefined);
        assert_1.strictEqual(result.documentation, undefined);
        assert_1.strictEqual(result.filterText, undefined);
        assert_1.strictEqual(result.insertText, undefined);
        assert_1.strictEqual(result.range, undefined);
        assert_1.strictEqual(result.kind, undefined);
        assert_1.strictEqual(result.sortText, undefined);
        assert_1.strictEqual(result.textEdit, undefined);
        assert_1.strictEqual(result.data, undefined);
    });
    test('Completion Item - Deprecated boolean', () => {
        let completionItem = {
            label: 'item',
            deprecated: true
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.tags[0], vscode_languageserver_protocol_1.CompletionItemTag.Deprecated);
    });
    test('Completion Item - Deprecated tag', () => {
        let completionItem = {
            label: 'item',
            tags: [proto.CompletionItemTag.Deprecated]
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.tags[0], vscode_languageserver_protocol_1.CompletionItemTag.Deprecated);
    });
    test('Completion Item - Full', () => {
        let command = proto.Command.create('title', 'commandId');
        command.arguments = ['args'];
        let completionItem = {
            label: 'item',
            detail: 'detail',
            documentation: 'doc',
            filterText: 'filter',
            insertText: 'insert',
            insertTextFormat: proto.InsertTextFormat.PlainText,
            kind: proto.CompletionItemKind.Field,
            sortText: 'sort',
            data: 'data',
            additionalTextEdits: [proto.TextEdit.insert({ line: 1, character: 2 }, 'insert')],
            command: command,
            tags: [proto.CompletionItemTag.Deprecated]
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.detail, completionItem.detail);
        assert_1.strictEqual(result.documentation, completionItem.documentation);
        assert_1.strictEqual(result.filterText, completionItem.filterText);
        assert_1.strictEqual(result.insertText, completionItem.insertText);
        assert_1.strictEqual(result.kind, vscode.CompletionItemKind.Field);
        assert_1.strictEqual(result.sortText, completionItem.sortText);
        assert_1.strictEqual(result.textEdit, undefined);
        assert_1.strictEqual(result.data, completionItem.data);
        assert_1.strictEqual(result.command.title, command.title);
        assert_1.strictEqual(result.command.command, command.command);
        assert_1.strictEqual(result.command.arguments, command.arguments);
        assert_1.strictEqual(result.tags[0], vscode_languageserver_protocol_1.CompletionItemTag.Deprecated);
        assert_1.ok(result.additionalTextEdits[0] instanceof vscode.TextEdit);
        let completionResult = p2c.asCompletionResult([completionItem]);
        assert_1.ok(completionResult.every(value => value instanceof vscode.CompletionItem));
    });
    test('Completion Item - Preserve Insert Text', () => {
        let completionItem = {
            label: 'item',
            insertText: 'insert'
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.insertText, 'insert');
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.insertText, 'insert');
    });
    test('Completion Item - Snippet String', () => {
        let completionItem = {
            label: 'item',
            insertText: '${value}',
            insertTextFormat: proto.InsertTextFormat.Snippet
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.ok(result.insertText instanceof vscode.SnippetString);
        assert_1.strictEqual(result.insertText.value, '${value}');
        assert_1.strictEqual(result.range, undefined);
        assert_1.strictEqual(result.textEdit, undefined);
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.insertTextFormat, proto.InsertTextFormat.Snippet);
        assert_1.strictEqual(back.insertText, '${value}');
    });
    test('Completion Item - Text Edit', () => {
        let completionItem = {
            label: 'item',
            textEdit: proto.TextEdit.insert({ line: 1, character: 2 }, 'insert')
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.textEdit, undefined);
        assert_1.strictEqual(result.insertText, 'insert');
        assertRange(result.range);
        assertTextEdit(completionItem.textEdit);
        rangeEqual(result.range, completionItem.textEdit.range);
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.insertTextFormat, proto.InsertTextFormat.PlainText);
        assert_1.strictEqual(back.insertText, undefined);
        assertTextEdit(back.textEdit);
        assert_1.strictEqual(back.textEdit.newText, 'insert');
        rangeEqual(back.textEdit.range, result.range);
    });
    test('Completion Item - Insert / Replace Edit', () => {
        let completionItem = {
            label: 'item',
            textEdit: proto.InsertReplaceEdit.create('text', proto.Range.create(0, 0, 0, 0), proto.Range.create(0, 0, 0, 2))
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.textEdit, undefined);
        assert_1.strictEqual(result.insertText, 'text');
        assertInsertReplaceRange(result.range);
        assertInsertReplaceEdit(completionItem.textEdit);
        completionEditEqual(result.insertText, result.range, completionItem.textEdit);
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.insertTextFormat, proto.InsertTextFormat.PlainText);
        assert_1.strictEqual(back.insertText, undefined);
        assertInsertReplaceEdit(back.textEdit);
        assertInsertReplaceRange(result.range);
        assert_1.strictEqual(back.textEdit.newText, 'text');
        rangeEqual(back.textEdit.insert, result.range.inserting);
        rangeEqual(back.textEdit.replace, result.range.replacing);
    });
    test('Completion Item - Text Edit Snippet String', () => {
        let completionItem = {
            label: 'item',
            textEdit: proto.TextEdit.insert({ line: 1, character: 2 }, '${insert}'),
            insertTextFormat: proto.InsertTextFormat.Snippet
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, completionItem.label);
        assert_1.strictEqual(result.textEdit, undefined);
        assert_1.ok(result.insertText instanceof vscode.SnippetString && result.insertText.value === '${insert}');
        assertRange(result.range);
        assertTextEdit(completionItem.textEdit);
        rangeEqual(result.range, completionItem.textEdit.range);
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.insertText, undefined);
        assert_1.strictEqual(back.insertTextFormat, proto.InsertTextFormat.Snippet);
        assertTextEdit(back.textEdit);
        assert_1.strictEqual(back.textEdit.newText, '${insert}');
        rangeEqual(back.textEdit.range, result.range);
    });
    test('Completion Item - Preserve Data', () => {
        let completionItem = {
            label: 'item',
            data: 'data'
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.data, completionItem.data);
    });
    test('Completion Item - Preserve Data === 0', () => {
        let completionItem = {
            label: 'item',
            data: 0
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.data, completionItem.data);
    });
    test('Completion Item - Preserve Data === false', () => {
        let completionItem = {
            label: 'item',
            data: false
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.data, completionItem.data);
    });
    test('Completion Item - Preserve Data === ""', () => {
        let completionItem = {
            label: 'item',
            data: ''
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.data, completionItem.data);
    });
    test('Completion Item - Preserve deprecated', () => {
        let completionItem = {
            label: 'item',
            deprecated: true
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.deprecated, true);
        assert_1.strictEqual(result.tags, undefined);
    });
    test('Completion Item - Preserve tag', () => {
        let completionItem = {
            label: 'item',
            tags: [proto.CompletionItemTag.Deprecated]
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.deprecated, undefined);
        assert_1.strictEqual(result.tags[0], proto.CompletionItemTag.Deprecated);
    });
    test('Completion Item - Documentation as string', () => {
        let completionItem = {
            label: 'item',
            documentation: 'doc'
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.ok(Is.string(result.documentation) && result.documentation === 'doc');
    });
    test('Completion Item - Documentation as PlainText', () => {
        let completionItem = {
            label: 'item',
            documentation: {
                kind: proto.MarkupKind.PlainText,
                value: 'doc'
            }
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.documentation.kind, proto.MarkupKind.PlainText);
        assert_1.strictEqual(result.documentation.value, 'doc');
    });
    test('Completion Item - Documentation as Markdown', () => {
        let completionItem = {
            label: 'item',
            documentation: {
                kind: proto.MarkupKind.Markdown,
                value: '# Header'
            }
        };
        let result = c2p.asCompletionItem(p2c.asCompletionItem(completionItem));
        assert_1.strictEqual(result.documentation.kind, proto.MarkupKind.Markdown);
        assert_1.strictEqual(result.documentation.value, '# Header');
    });
    test('Completion Item - Kind Outside', () => {
        let completionItem = {
            label: 'item',
            kind: Number.MAX_VALUE
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.kind, vscode.CompletionItemKind.Text);
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.kind, Number.MAX_VALUE);
    });
    test('Completion Item - InsertTextMode.asIs', () => {
        let completionItem = {
            label: 'item',
            kind: Number.MAX_VALUE,
            insertTextMode: vscode_languageserver_protocol_1.InsertTextMode.asIs
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.kind, vscode.CompletionItemKind.Text);
        assert_1.strictEqual(result.keepWhitespace, true);
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.kind, Number.MAX_VALUE);
        assert_1.strictEqual(back.insertTextMode, vscode_languageserver_protocol_1.InsertTextMode.asIs);
    });
    test('Completion Item - InsertTextMode.adjustIndentation', () => {
        let completionItem = {
            label: 'item',
            kind: Number.MAX_VALUE,
            insertTextMode: vscode_languageserver_protocol_1.InsertTextMode.adjustIndentation
        };
        let result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.kind, vscode.CompletionItemKind.Text);
        assert_1.strictEqual(result.keepWhitespace, undefined);
        let back = c2p.asCompletionItem(result);
        assert_1.strictEqual(back.kind, Number.MAX_VALUE);
        assert_1.strictEqual(back.insertTextMode, vscode_languageserver_protocol_1.InsertTextMode.adjustIndentation);
    });
    test('Completion Item - Label Details', () => {
        var _a, _b, _c, _d, _e, _f, _g;
        const completionItem = {
            label: 'name',
            labelDetails: { parameters: 'parameters', qualifier: 'qualifier', type: 'type' }
        };
        const result = p2c.asCompletionItem(completionItem);
        assert_1.strictEqual(result.label, 'name');
        assert_1.strictEqual((_a = result.label2) === null || _a === void 0 ? void 0 : _a.name, 'name');
        assert_1.strictEqual((_b = result.label2) === null || _b === void 0 ? void 0 : _b.parameters, 'parameters');
        assert_1.strictEqual((_c = result.label2) === null || _c === void 0 ? void 0 : _c.qualifier, 'qualifier');
        assert_1.strictEqual((_d = result.label2) === null || _d === void 0 ? void 0 : _d.type, 'type');
        const back = c2p.asCompletionItem(result, true);
        assert_1.strictEqual(proto.CompletionItemLabelDetails.is(back.labelDetails), true);
        assert_1.strictEqual((_e = back.labelDetails) === null || _e === void 0 ? void 0 : _e.parameters, 'parameters');
        assert_1.strictEqual((_f = back.labelDetails) === null || _f === void 0 ? void 0 : _f.qualifier, 'qualifier');
        assert_1.strictEqual((_g = back.labelDetails) === null || _g === void 0 ? void 0 : _g.type, 'type');
        const back2 = c2p.asCompletionItem(result, false);
        assert_1.strictEqual(back2.labelDetails, undefined);
        assert_1.strictEqual(back2.label, 'name');
    });
    test('Completion Result', () => {
        let completionResult = {
            isIncomplete: true,
            items: [{ label: 'item', data: 'data' }]
        };
        let result = p2c.asCompletionResult(completionResult);
        assert_1.strictEqual(result.isIncomplete, completionResult.isIncomplete);
        assert_1.strictEqual(result.items.length, 1);
        assert_1.strictEqual(result.items[0].label, 'item');
        assert_1.strictEqual(p2c.asCompletionResult(undefined), undefined);
        assert_1.strictEqual(p2c.asCompletionResult(null), undefined);
        assert_1.deepEqual(p2c.asCompletionResult([]), []);
    });
    test('Parameter Information', () => {
        let parameterInfo = {
            label: 'label'
        };
        let result = p2c.asParameterInformation(parameterInfo);
        assert_1.strictEqual(result.label, parameterInfo.label);
        assert_1.strictEqual(result.documentation, undefined);
        parameterInfo.documentation = 'documentation';
        result = p2c.asParameterInformation(parameterInfo);
        assert_1.strictEqual(result.label, parameterInfo.label);
        assert_1.strictEqual(result.documentation, parameterInfo.documentation);
        assert_1.ok(p2c.asParameterInformations([parameterInfo]).every(value => value instanceof vscode.ParameterInformation));
    });
    test('Signature Information', () => {
        let signatureInfo = {
            label: 'label'
        };
        let result = p2c.asSignatureInformation(signatureInfo);
        assert_1.strictEqual(result.label, signatureInfo.label);
        assert_1.strictEqual(result.documentation, undefined);
        assert_1.deepEqual(result.parameters, []);
        signatureInfo.documentation = 'documentation';
        signatureInfo.parameters = [{ label: 'label' }];
        result = p2c.asSignatureInformation(signatureInfo);
        assert_1.strictEqual(result.label, signatureInfo.label);
        assert_1.strictEqual(result.documentation, signatureInfo.documentation);
        assert_1.ok(result.parameters.every(value => value instanceof vscode.ParameterInformation));
        assert_1.ok(p2c.asSignatureInformations([signatureInfo]).every(value => value instanceof vscode.SignatureInformation));
    });
    test('Signature Help', () => {
        let signatureHelp = {
            signatures: [
                { label: 'label' }
            ],
            activeSignature: null,
            activeParameter: null
        };
        let result = p2c.asSignatureHelp(signatureHelp);
        assert_1.ok(result.signatures.every(value => value instanceof vscode.SignatureInformation));
        assert_1.strictEqual(result.activeSignature, 0);
        assert_1.strictEqual(result.activeParameter, 0);
        signatureHelp.activeSignature = 1;
        signatureHelp.activeParameter = 2;
        result = p2c.asSignatureHelp(signatureHelp);
        assert_1.ok(result.signatures.every(value => value instanceof vscode.SignatureInformation));
        assert_1.strictEqual(result.activeSignature, 1);
        assert_1.strictEqual(result.activeParameter, 2);
        assert_1.strictEqual(p2c.asSignatureHelp(undefined), undefined);
        assert_1.strictEqual(p2c.asSignatureHelp(null), undefined);
    });
    test('Location', () => {
        assert_1.strictEqual(p2c.asLocation(undefined), undefined);
        assert_1.strictEqual(p2c.asLocation(null), undefined);
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let location = {
            uri: 'file://localhost/folder/file',
            range: { start, end }
        };
        let result = p2c.asLocation(location);
        assert_1.ok(result.uri instanceof vscode.Uri);
        assert_1.ok(result.range instanceof vscode.Range);
        assert_1.ok(p2c.asReferences([location]).every(value => value instanceof vscode.Location));
    });
    test('Definition', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let location = {
            uri: 'file://localhost/folder/file',
            range: { start, end }
        };
        let single = p2c.asDefinitionResult(location);
        assert_1.ok(single.uri instanceof vscode.Uri);
        assert_1.ok(single.range instanceof vscode.Range);
        let array = p2c.asDefinitionResult([location]);
        assert_1.ok(array.every(value => value instanceof vscode.Location));
        assert_1.strictEqual(p2c.asDefinitionResult(undefined), undefined);
        assert_1.strictEqual(p2c.asDefinitionResult(null), undefined);
        assert_1.deepEqual(p2c.asDefinitionResult([]), []);
    });
    test('Document Highlight Kind', () => {
        assert_1.strictEqual(p2c.asDocumentHighlightKind(proto.DocumentHighlightKind.Text), vscode.DocumentHighlightKind.Text);
        assert_1.strictEqual(p2c.asDocumentHighlightKind(proto.DocumentHighlightKind.Read), vscode.DocumentHighlightKind.Read);
        assert_1.strictEqual(p2c.asDocumentHighlightKind(proto.DocumentHighlightKind.Write), vscode.DocumentHighlightKind.Write);
    });
    test('Document Highlight', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let documentHighlight = proto.DocumentHighlight.create({ start, end });
        let result = p2c.asDocumentHighlight(documentHighlight);
        assert_1.ok(result.range instanceof vscode.Range);
        assert_1.strictEqual(result.kind, vscode.DocumentHighlightKind.Text);
        documentHighlight.kind = proto.DocumentHighlightKind.Write;
        result = p2c.asDocumentHighlight(documentHighlight);
        assert_1.ok(result.range instanceof vscode.Range);
        assert_1.strictEqual(result.kind, vscode.DocumentHighlightKind.Write);
        assert_1.ok(p2c.asDocumentHighlights([documentHighlight]).every(value => value instanceof vscode.DocumentHighlight));
        assert_1.strictEqual(p2c.asDocumentHighlights(undefined), undefined);
        assert_1.strictEqual(p2c.asDocumentHighlights(null), undefined);
        assert_1.deepEqual(p2c.asDocumentHighlights([]), []);
    });
    test('Document Links', () => {
        let location = 'file:///foo/bar';
        let tooltip = 'tooltip';
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let documentLink = proto.DocumentLink.create({ start, end }, location);
        documentLink.tooltip = tooltip;
        let result = p2c.asDocumentLink(documentLink);
        assert_1.ok(result.range instanceof vscode.Range);
        assert_1.strictEqual(result.target.toString(), location);
        assert_1.strictEqual(result.tooltip, tooltip);
        assert_1.ok(p2c.asDocumentLinks([documentLink]).every(value => value instanceof vscode.DocumentLink));
        assert_1.strictEqual(p2c.asDocumentLinks(undefined), undefined);
        assert_1.strictEqual(p2c.asDocumentLinks(null), undefined);
        assert_1.deepEqual(p2c.asDocumentLinks([]), []);
    });
    test('SymbolInformation', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let location = {
            uri: 'file://localhost/folder/file',
            range: { start, end }
        };
        let symbolInformation = {
            name: 'name',
            kind: proto.SymbolKind.Array,
            tags: [proto.SymbolTag.Deprecated],
            location: location
        };
        let result = p2c.asSymbolInformation(symbolInformation);
        assert_1.strictEqual(result.name, symbolInformation.name);
        assert_1.strictEqual(result.kind, vscode.SymbolKind.Array);
        assert_1.strictEqual(result.containerName, undefined);
        assertDefined(result.tags);
        assert_1.strictEqual(result.tags.length, 1);
        assert_1.strictEqual(result.tags[0], vscode.SymbolTag.Deprecated);
        assert_1.ok(result.location instanceof vscode.Location);
        symbolInformation.containerName = 'container';
        result = p2c.asSymbolInformation(symbolInformation);
        assert_1.strictEqual(result.containerName, symbolInformation.containerName);
        assert_1.ok(p2c.asSymbolInformations([symbolInformation]).every(value => value instanceof vscode.SymbolInformation));
        assert_1.strictEqual(p2c.asSymbolInformations(undefined), undefined);
        assert_1.strictEqual(p2c.asSymbolInformations(null), undefined);
        assert_1.deepEqual(p2c.asSymbolInformations([]), []);
    });
    test('SymbolInformation Tag outside', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let location = {
            uri: 'file://localhost/folder/file',
            range: { start, end }
        };
        let symbolInformation = {
            name: 'name',
            kind: proto.SymbolKind.Array,
            tags: [Number.MAX_VALUE],
            location: location
        };
        let result = p2c.asSymbolInformation(symbolInformation);
        assert_1.strictEqual(result.tags, undefined);
    });
    test('SymbolInformation deprecated', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let location = {
            uri: 'file://localhost/folder/file',
            range: { start, end }
        };
        let symbolInformation = {
            name: 'name',
            kind: proto.SymbolKind.Array,
            location: location,
            deprecated: true
        };
        let result = p2c.asSymbolInformation(symbolInformation);
        assertDefined(result.tags);
        assert_1.strictEqual(result.tags.length, 1);
        assert_1.strictEqual(result.tags[0], vscode.SymbolTag.Deprecated);
    });
    test('SymbolInformation Kind outside', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let location = {
            uri: 'file://localhost/folder/file',
            range: { start, end }
        };
        let symbolInformation = {
            name: 'name',
            kind: Number.MAX_VALUE,
            location: location
        };
        let result = p2c.asSymbolInformation(symbolInformation);
        assert_1.strictEqual(result.kind, vscode.SymbolKind.Property);
    });
    test('DocumentSymbol', () => {
        let start = { line: 1, character: 2 };
        let end = { line: 8, character: 9 };
        let documentSymbol = {
            name: 'name',
            kind: proto.SymbolKind.Array,
            tags: [proto.SymbolTag.Deprecated],
            range: { start, end },
            selectionRange: { start, end }
        };
        assert_1.ok(proto.DocumentSymbol.is(documentSymbol));
        let result = p2c.asDocumentSymbol(documentSymbol);
        assert_1.strictEqual(result.name, documentSymbol.name);
        assert_1.strictEqual(result.kind, vscode.SymbolKind.Array);
        assert_1.strictEqual(result.children.length, 0);
        assertDefined(result.tags);
        assert_1.strictEqual(result.tags.length, 1);
        assert_1.strictEqual(result.tags[0], vscode.SymbolTag.Deprecated);
        rangeEqual(result.range, documentSymbol.range);
        rangeEqual(result.selectionRange, documentSymbol.selectionRange);
    });
    test('Command', () => {
        let command = proto.Command.create('title', 'commandId');
        command.arguments = ['args'];
        let result = p2c.asCommand(command);
        assert_1.strictEqual(result.title, command.title);
        assert_1.strictEqual(result.command, command.command);
        assert_1.strictEqual(result.arguments, command.arguments);
        assert_1.ok(p2c.asCommands([command]).every(elem => !!elem.title && !!elem.command));
        assert_1.strictEqual(p2c.asCommands(undefined), undefined);
        assert_1.strictEqual(p2c.asCommands(null), undefined);
        assert_1.deepEqual(p2c.asCommands([]), []);
    });
    test('Code Lens', () => {
        let codeLens = proto.CodeLens.create(proto.Range.create(1, 2, 8, 9), 'data');
        let result = p2c.asCodeLens(codeLens);
        rangeEqual(result.range, codeLens.range);
        codeLens.command = proto.Command.create('title', 'commandId');
        result = p2c.asCodeLens(codeLens);
        assert_1.strictEqual(result.command.title, codeLens.command.title);
        assert_1.strictEqual(result.command.command, codeLens.command.command);
        assert_1.ok(p2c.asCodeLenses([codeLens]).every(elem => elem instanceof vscode.CodeLens));
        assert_1.strictEqual(p2c.asCodeLenses(undefined), undefined);
        assert_1.strictEqual(p2c.asCodeLenses(null), undefined);
        assert_1.deepEqual(p2c.asCodeLenses([]), []);
    });
    test('Code Lens Preserve Data', () => {
        let codeLens = proto.CodeLens.create(proto.Range.create(1, 2, 8, 9), 'data');
        let result = c2p.asCodeLens(p2c.asCodeLens(codeLens));
        assert_1.strictEqual(result.data, codeLens.data);
    });
    test('WorkspaceEdit', () => {
        let workspaceChange = new proto.WorkspaceChange();
        let uri1 = 'file:///abc.txt';
        let change1 = workspaceChange.getTextEditChange({ uri: uri1, version: 1 });
        change1.insert(proto.Position.create(0, 1), 'insert');
        let uri2 = 'file:///xyz.txt';
        let change2 = workspaceChange.getTextEditChange({ uri: uri2, version: 99 });
        change2.replace(proto.Range.create(0, 1, 2, 3), 'replace');
        let result = p2c.asWorkspaceEdit(workspaceChange.edit);
        let edits = result.get(vscode.Uri.parse(uri1));
        assert_1.strictEqual(edits.length, 1);
        rangeEqual(edits[0].range, proto.Range.create(0, 1, 0, 1));
        assert_1.strictEqual(edits[0].newText, 'insert');
        edits = result.get(vscode.Uri.parse(uri2));
        assert_1.strictEqual(edits.length, 1);
        rangeEqual(edits[0].range, proto.Range.create(0, 1, 2, 3));
        assert_1.strictEqual(edits[0].newText, 'replace');
        assert_1.strictEqual(p2c.asWorkspaceEdit(undefined), undefined);
        assert_1.strictEqual(p2c.asWorkspaceEdit(null), undefined);
    });
    test('Uri Rewrite', () => {
        let converter = protocolConverter.createConverter((value) => {
            return vscode.Uri.parse(`${value}.vscode`);
        }, false);
        let result = converter.asUri('file://localhost/folder/file');
        assert_1.strictEqual('file://localhost/folder/file.vscode', result.toString());
    });
    test('Bug #361', () => {
        const item = {
            'label': 'MyLabel',
            'textEdit': {
                'range': {
                    'start': {
                        'line': 0,
                        'character': 0
                    },
                    'end': {
                        'line': 0,
                        'character': 10
                    }
                },
                'newText': ''
            }
        };
        const converted = p2c.asCompletionItem(item);
        const toResolve = c2p.asCompletionItem(converted);
        assertTextEdit(toResolve.textEdit);
        assert_1.strictEqual(toResolve.textEdit.range.start.line, 0);
        assert_1.strictEqual(toResolve.textEdit.range.start.character, 0);
        assert_1.strictEqual(toResolve.textEdit.range.end.line, 0);
        assert_1.strictEqual(toResolve.textEdit.range.end.character, 10);
        assert_1.strictEqual(toResolve.textEdit.newText, '');
        const resolved = p2c.asCompletionItem(toResolve);
        assert_1.strictEqual(resolved.label, item.label);
        const range = resolved.range;
        assertRange(range);
        assert_1.strictEqual(range.start.line, 0);
        assert_1.strictEqual(range.start.character, 0);
        assert_1.strictEqual(range.end.line, 0);
        assert_1.strictEqual(range.end.character, 10);
        assert_1.strictEqual(resolved.insertText, '');
    });
});
suite('Code Converter', () => {
    function positionEqual(actual, expected) {
        assert_1.strictEqual(actual.line, expected.line);
        assert_1.strictEqual(actual.character, expected.character);
    }
    function rangeEqual(actual, expected) {
        assert_1.strictEqual(actual.start.line, expected.start.line);
        assert_1.strictEqual(actual.start.character, expected.start.character);
        assert_1.strictEqual(actual.end.line, expected.end.line);
        assert_1.strictEqual(actual.end.character, expected.end.character);
    }
    test('Position', () => {
        let position = new vscode.Position(1, 2);
        let result = c2p.asPosition(position);
        positionEqual(result, position);
    });
    test('Range', () => {
        let range = new vscode.Range(new vscode.Position(1, 2), new vscode.Position(8, 9));
        let result = c2p.asRange(range);
        rangeEqual(result, range);
    });
    test('Text Edit Insert', () => {
        let insert = vscode.TextEdit.insert(new vscode.Position(1, 2), 'insert');
        let result = c2p.asTextEdit(insert);
        rangeEqual(result.range, insert.range);
        assert_1.strictEqual(result.newText, insert.newText);
    });
    test('Text Edit Replace', () => {
        let replace = vscode.TextEdit.replace(new vscode.Range(new vscode.Position(1, 2), new vscode.Position(8, 9)), 'insert');
        let result = c2p.asTextEdit(replace);
        rangeEqual(result.range, replace.range);
        assert_1.strictEqual(result.newText, replace.newText);
    });
    test('Text Edit Delete', () => {
        let del = vscode.TextEdit.delete(new vscode.Range(new vscode.Position(1, 2), new vscode.Position(8, 9)));
        let result = c2p.asTextEdit(del);
        rangeEqual(result.range, del.range);
        assert_1.strictEqual(result.newText, del.newText);
    });
    test('Completion Item', () => {
        let item = new vscode.CompletionItem('label');
        let result = c2p.asCompletionItem(item);
        assert_1.strictEqual(result.label, item.label);
        assert_1.strictEqual(result.detail, undefined);
        assert_1.strictEqual(result.documentation, undefined);
        assert_1.strictEqual(result.filterText, undefined);
        assert_1.strictEqual(result.insertText, undefined);
        assert_1.strictEqual(result.kind, undefined);
        assert_1.strictEqual(result.sortText, undefined);
        assert_1.strictEqual(result.textEdit, undefined);
        assert_1.strictEqual(result.data, undefined);
        assert_1.strictEqual(result.additionalTextEdits, undefined);
        assert_1.strictEqual(result.command, undefined);
        assert_1.strictEqual(result.deprecated, undefined);
        assert_1.strictEqual(result.tags, undefined);
    });
    test('Completion Item Full', () => {
        let item = new vscode.CompletionItem('label');
        item.detail = 'detail';
        item.documentation = 'documentation';
        item.filterText = 'filter';
        item.insertText = 'insert';
        item.kind = vscode.CompletionItemKind.Interface;
        item.sortText = 'sort';
        let edit = vscode.TextEdit.insert(new vscode.Position(1, 2), 'insert');
        item.additionalTextEdits = [edit];
        item.tags = [vscode.CompletionItemTag.Deprecated];
        item.command = { title: 'title', command: 'commandId' };
        let result = c2p.asCompletionItem(item);
        assert_1.strictEqual(result.label, item.label);
        assert_1.strictEqual(result.detail, item.detail);
        assert_1.strictEqual(result.documentation, item.documentation);
        assert_1.strictEqual(result.filterText, item.filterText);
        assert_1.strictEqual(result.insertText, item.insertText);
        assert_1.strictEqual(result.kind, proto.CompletionItemKind.Interface);
        assert_1.strictEqual(result.sortText, item.sortText);
        rangeEqual(result.additionalTextEdits[0].range, item.additionalTextEdits[0].range);
        assert_1.strictEqual(result.additionalTextEdits[0].newText, item.additionalTextEdits[0].newText);
        assert_1.strictEqual(result.tags[0], proto.CompletionItemTag.Deprecated);
        assert_1.strictEqual(result.deprecated, undefined);
    });
    test('Completion Item - insertText', () => {
        let item = new protocolCompletionItem_1.default('label');
        item.insertText = 'insert';
        item.fromEdit = false;
        let result = c2p.asCompletionItem(item);
        assert_1.strictEqual(result.insertText, item.insertText);
    });
    test('Completion Item - TextEdit', () => {
        let item = new protocolCompletionItem_1.default('label');
        item.textEdit = vscode.TextEdit.insert(new vscode.Position(1, 2), 'insert');
        item.fromEdit = false;
        let result = c2p.asCompletionItem(item);
        assert_1.strictEqual(result.insertText, item.textEdit.newText);
    });
    test('Completion Item - Insert Text and Range', () => {
        let item = new protocolCompletionItem_1.default('label');
        item.insertText = 'insert';
        item.range = new vscode.Range(1, 2, 1, 2);
        item.fromEdit = true;
        let result = c2p.asCompletionItem(item);
        assert_1.strictEqual(result.insertText, undefined);
        assertTextEdit(result.textEdit);
        rangeEqual(result.textEdit.range, item.range);
        assert_1.strictEqual(result.textEdit.newText, item.insertText);
    });
    test('Completion Item - TextEdit from Edit', () => {
        let item = new protocolCompletionItem_1.default('label');
        item.textEdit = vscode.TextEdit.insert(new vscode.Position(1, 2), 'insert');
        item.fromEdit = true;
        let result = c2p.asCompletionItem(item);
        assert_1.strictEqual(result.insertText, undefined);
        assertTextEdit(result.textEdit);
        rangeEqual(result.textEdit.range, item.textEdit.range);
        assert_1.strictEqual(result.textEdit.newText, item.textEdit.newText);
    });
    test('Completion Item - Keep whitespace', () => {
        let item = new protocolCompletionItem_1.default('label');
        item.textEdit = vscode.TextEdit.insert(new vscode.Position(1, 2), 'insert');
        item.fromEdit = true;
        item.keepWhitespace = true;
        let result = c2p.asCompletionItem(item);
        assert_1.strictEqual(result.insertText, undefined);
        assertTextEdit(result.textEdit);
        rangeEqual(result.textEdit.range, item.textEdit.range);
        assert_1.strictEqual(result.textEdit.newText, item.textEdit.newText);
        assert_1.strictEqual(result.insertTextMode, vscode_languageserver_protocol_1.InsertTextMode.adjustIndentation);
    });
    test('DiagnosticSeverity', () => {
        assert_1.strictEqual(c2p.asDiagnosticSeverity(vscode.DiagnosticSeverity.Error), proto.DiagnosticSeverity.Error);
        assert_1.strictEqual(c2p.asDiagnosticSeverity(vscode.DiagnosticSeverity.Warning), proto.DiagnosticSeverity.Warning);
        assert_1.strictEqual(c2p.asDiagnosticSeverity(vscode.DiagnosticSeverity.Information), proto.DiagnosticSeverity.Information);
        assert_1.strictEqual(c2p.asDiagnosticSeverity(vscode.DiagnosticSeverity.Hint), proto.DiagnosticSeverity.Hint);
    });
    test('DiagnosticTag', () => {
        assert_1.strictEqual(c2p.asDiagnosticTag(vscode.DiagnosticTag.Unnecessary), proto.DiagnosticTag.Unnecessary);
        assert_1.strictEqual(c2p.asDiagnosticTag(vscode.DiagnosticTag.Deprecated), proto.DiagnosticTag.Deprecated);
    });
    test('Diagnostic', () => {
        let item = new vscode.Diagnostic(new vscode.Range(1, 2, 8, 9), 'message', vscode.DiagnosticSeverity.Warning);
        item.code = 99;
        item.source = 'source';
        item.tags = [vscode.DiagnosticTag.Unnecessary];
        item.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(new vscode.Location(vscode.Uri.parse('file://localhost/folder/file'), new vscode.Range(0, 1, 2, 3)), 'related')
        ];
        let result = c2p.asDiagnostic(item);
        rangeEqual(result.range, item.range);
        assert_1.strictEqual(result.message, item.message);
        assert_1.strictEqual(result.severity, proto.DiagnosticSeverity.Warning);
        assert_1.strictEqual(result.code, item.code);
        assert_1.strictEqual(result.source, item.source);
        assert_1.strictEqual(result.tags !== undefined, true);
        assert_1.strictEqual(result.tags[0], proto.DiagnosticTag.Unnecessary);
        assert_1.strictEqual(Array.isArray(result.relatedInformation), true);
        assert_1.strictEqual(result.relatedInformation.length, 1);
        assert_1.strictEqual(result.relatedInformation[0].message, 'related');
        assert_1.strictEqual(result.relatedInformation[0].location.uri, 'file://localhost/folder/file');
        assert_1.strictEqual(result.relatedInformation[0].location.range.end.character, 3);
        assert_1.ok(c2p.asDiagnostics([item]).every(elem => proto.Diagnostic.is(elem)));
    });
    test('Diagnostic - Complex Code', () => {
        var _a;
        let item = new vscode.Diagnostic(new vscode.Range(1, 2, 8, 9), 'message', vscode.DiagnosticSeverity.Warning);
        item.code = { value: 99, target: vscode.Uri.parse('https://code.visualstudio.com/') };
        let result = c2p.asDiagnostic(item);
        assert_1.strictEqual(result.code, 99);
        assert_1.strictEqual((_a = result.codeDescription) === null || _a === void 0 ? void 0 : _a.href, 'https://code.visualstudio.com/');
    });
    test('Diagnostic - Complex Code - Deprecated', () => {
        const item = new protocolDiagnostic_1.ProtocolDiagnostic(new vscode.Range(1, 2, 8, 9), 'message', vscode.DiagnosticSeverity.Warning, undefined);
        item.hasDiagnosticCode = true;
        item.code = { value: 99, target: vscode.Uri.parse('https://code.visualstudio.com/') };
        const result = c2p.asDiagnostic(item);
        assertDiagnosticCode(result.code);
        assert_1.strictEqual(result.code.value, 99);
        assert_1.strictEqual(result.code.target, 'https://code.visualstudio.com/');
    });
    test('CodeActionContext', () => {
        let item = {
            diagnostics: [new vscode.Diagnostic(new vscode.Range(1, 2, 8, 9), 'message', vscode.DiagnosticSeverity.Warning)]
        };
        let result = c2p.asCodeActionContext(item);
        assert_1.ok(result.diagnostics.every(elem => proto.Diagnostic.is(elem)));
    });
    test('Uri Rewrite', () => {
        let converter = codeConverter.createConverter((value) => {
            return `${value.toString()}.vscode`;
        });
        let result = converter.asUri(vscode.Uri.parse('file://localhost/folder/file'));
        assert_1.strictEqual('file://localhost/folder/file.vscode', result);
    });
});
//# sourceMappingURL=converter.test.js.map