"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
suite('Protocol Helper Tests', () => {
    function rangeEqual(actual, expected) {
        assert_1.strictEqual(actual.start.line, expected.start.line);
        assert_1.strictEqual(actual.start.character, expected.start.character);
        assert_1.strictEqual(actual.end.line, expected.end.line);
        assert_1.strictEqual(actual.end.character, expected.end.character);
    }
    test('Position', () => {
        let position = vscode_languageserver_protocol_1.Position.create(1, 2);
        assert_1.strictEqual(position.line, 1);
        assert_1.strictEqual(position.character, 2);
        assert_1.ok(vscode_languageserver_protocol_1.Position.is(position));
    });
    test('Range - start/end', () => {
        let range = vscode_languageserver_protocol_1.Range.create(vscode_languageserver_protocol_1.Position.create(1, 2), vscode_languageserver_protocol_1.Position.create(8, 9));
        assert_1.strictEqual(range.start.line, 1);
        assert_1.strictEqual(range.start.character, 2);
        assert_1.strictEqual(range.end.line, 8);
        assert_1.strictEqual(range.end.character, 9);
        assert_1.ok(vscode_languageserver_protocol_1.Range.is(range));
    });
    test('Range - line/character', () => {
        let range = vscode_languageserver_protocol_1.Range.create(1, 2, 8, 9);
        assert_1.strictEqual(range.start.line, 1);
        assert_1.strictEqual(range.start.character, 2);
        assert_1.strictEqual(range.end.line, 8);
        assert_1.strictEqual(range.end.character, 9);
        assert_1.ok(vscode_languageserver_protocol_1.Range.is(range));
    });
    test('TextDocumentIdentifier', () => {
        let uri = 'file:///folder/file.txt';
        let identifier = vscode_languageserver_protocol_1.TextDocumentIdentifier.create(uri);
        assert_1.strictEqual(identifier.uri, uri);
        assert_1.ok(vscode_languageserver_protocol_1.TextDocumentIdentifier.is(identifier));
    });
    test('VersionedTextDocumentIdentifier', () => {
        let uri = 'file:///folder/file.txt';
        let identifier = vscode_languageserver_protocol_1.VersionedTextDocumentIdentifier.create(uri, 9);
        assert_1.strictEqual(identifier.uri, uri);
        assert_1.strictEqual(identifier.version, 9);
        assert_1.ok(vscode_languageserver_protocol_1.VersionedTextDocumentIdentifier.is(identifier));
    });
    // test('TextDocumentPositionParams', () => {
    // 	let uri = 'file:///folder/file.txt';
    // 	let params = TextDocumentPositionParams.create(uri, Position.create(1,2));
    // 	strictEqual(params.textDocument.uri, uri);
    // 	ok(Position.is(params.position));
    // 	ok(TextDocumentPositionParams.is(params));
    // });
    test('TextDocumentItem', () => {
        let uri = 'file:///folder/file.txt';
        let item = vscode_languageserver_protocol_1.TextDocumentItem.create(uri, 'pain-text', 9, 'content');
        assert_1.strictEqual(item.uri, uri);
        assert_1.strictEqual(item.languageId, 'pain-text');
        assert_1.strictEqual(item.version, 9);
        assert_1.strictEqual(item.text, 'content');
        assert_1.ok(vscode_languageserver_protocol_1.TextDocumentItem.is(item));
    });
    test('Diagnostic', () => {
        let diagnostic = vscode_languageserver_protocol_1.Diagnostic.create(vscode_languageserver_protocol_1.Range.create(1, 2, 8, 9), 'message', vscode_languageserver_protocol_1.DiagnosticSeverity.Warning, 99, 'source');
        assert_1.ok(vscode_languageserver_protocol_1.Range.is(diagnostic.range));
        assert_1.strictEqual(diagnostic.message, 'message');
        assert_1.strictEqual(diagnostic.severity, vscode_languageserver_protocol_1.DiagnosticSeverity.Warning);
        assert_1.strictEqual(diagnostic.code, 99);
        assert_1.strictEqual(diagnostic.source, 'source');
    });
    test('Command', () => {
        let command = vscode_languageserver_protocol_1.Command.create('title', 'command', 'arg');
        assert_1.strictEqual(command.title, 'title');
        assert_1.strictEqual(command.command, 'command');
        assert_1.strictEqual(command.arguments[0], 'arg');
    });
    test('CodeLens', () => {
        let codeLens = vscode_languageserver_protocol_1.CodeLens.create(vscode_languageserver_protocol_1.Range.create(1, 2, 8, 9), 'data');
        let range = codeLens.range;
        assert_1.strictEqual(range.start.line, 1);
        assert_1.strictEqual(range.start.character, 2);
        assert_1.strictEqual(range.end.line, 8);
        assert_1.strictEqual(range.end.character, 9);
        assert_1.strictEqual(codeLens.data, 'data');
    });
    test('CodeActionContext', () => {
        let codeActionContext = vscode_languageserver_protocol_1.CodeActionContext.create([vscode_languageserver_protocol_1.Diagnostic.create(vscode_languageserver_protocol_1.Range.create(1, 2, 8, 9), 'message')]);
        assert_1.strictEqual(codeActionContext.diagnostics.length, 1);
        assert_1.ok(vscode_languageserver_protocol_1.Diagnostic.is(codeActionContext.diagnostics[0]));
    });
    test('WorkspaceEdit - documentChanges', () => {
        let workspaceChange = new vscode_languageserver_protocol_1.WorkspaceChange();
        let uri = 'file:///abc.txt';
        let change1 = workspaceChange.getTextEditChange({ uri: uri, version: 10 });
        change1.insert(vscode_languageserver_protocol_1.Position.create(0, 1), 'insert');
        change1.replace(vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3), 'replace');
        change1.delete(vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3));
        let change2 = workspaceChange.getTextEditChange({ uri: 'file:///xyz.txt', version: 20 });
        change2.insert(vscode_languageserver_protocol_1.Position.create(2, 3), 'insert');
        let workspaceEdit = workspaceChange.edit;
        assert_1.strictEqual(workspaceEdit.changeAnnotations, undefined);
        assert_1.strictEqual(workspaceEdit.documentChanges.length, 2);
        let edits = workspaceEdit.documentChanges[0].edits;
        assert_1.strictEqual(edits.length, 3);
        rangeEqual(edits[0].range, vscode_languageserver_protocol_1.Range.create(0, 1, 0, 1));
        assert_1.strictEqual(edits[0].newText, 'insert');
        rangeEqual(edits[1].range, vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3));
        assert_1.strictEqual(edits[1].newText, 'replace');
        rangeEqual(edits[2].range, vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3));
        assert_1.strictEqual(edits[2].newText, '');
        edits = workspaceEdit.documentChanges[1].edits;
        assert_1.strictEqual(edits.length, 1);
        rangeEqual(edits[0].range, vscode_languageserver_protocol_1.Range.create(2, 3, 2, 3));
        assert_1.strictEqual(edits[0].newText, 'insert');
        workspaceChange.createFile('file:///create.txt');
        workspaceChange.renameFile('file:///old.txt', 'file:///new.txt');
        workspaceChange.deleteFile('file:///delete.txt');
        let change = workspaceEdit.documentChanges[2];
        assert_1.ok(vscode_languageserver_protocol_1.CreateFile.is(change), 'Is create file');
        change = workspaceEdit.documentChanges[3];
        assert_1.ok(vscode_languageserver_protocol_1.RenameFile.is(change), 'Is rename file');
        change = workspaceEdit.documentChanges[4];
        assert_1.ok(vscode_languageserver_protocol_1.DeleteFile.is(change), 'Is delete file');
    });
    test('WorkspaceEdit - changes', () => {
        let workspaceChange = new vscode_languageserver_protocol_1.WorkspaceChange();
        let uri = 'file:///abc.txt';
        let change1 = workspaceChange.getTextEditChange(uri);
        change1.insert(vscode_languageserver_protocol_1.Position.create(0, 1), 'insert');
        change1.replace(vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3), 'replace');
        change1.delete(vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3));
        let change2 = workspaceChange.getTextEditChange('file:///xyz.txt');
        change2.insert(vscode_languageserver_protocol_1.Position.create(2, 3), 'insert');
        let workspaceEdit = workspaceChange.edit;
        assert_1.strictEqual(workspaceEdit.changeAnnotations, undefined);
        assert_1.strictEqual(Object.keys(workspaceEdit.changes).length, 2);
        let edits = workspaceEdit.changes[uri];
        assert_1.strictEqual(edits.length, 3);
        rangeEqual(edits[0].range, vscode_languageserver_protocol_1.Range.create(0, 1, 0, 1));
        assert_1.strictEqual(edits[0].newText, 'insert');
        rangeEqual(edits[1].range, vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3));
        assert_1.strictEqual(edits[1].newText, 'replace');
        rangeEqual(edits[2].range, vscode_languageserver_protocol_1.Range.create(0, 1, 2, 3));
        assert_1.strictEqual(edits[2].newText, '');
        edits = workspaceEdit.changes['file:///xyz.txt'];
        assert_1.strictEqual(edits.length, 1);
        rangeEqual(edits[0].range, vscode_languageserver_protocol_1.Range.create(2, 3, 2, 3));
        assert_1.strictEqual(edits[0].newText, 'insert');
    });
    test('WorkspaceEdit - change annotations', () => {
        const workspaceChange = new vscode_languageserver_protocol_1.WorkspaceChange();
        const uri = 'file:///abc.txt';
        const change1 = workspaceChange.getTextEditChange({ uri: uri, version: 10 });
        change1.insert(vscode_languageserver_protocol_1.Position.create(0, 1), 'insert', vscode_languageserver_protocol_1.ChangeAnnotation.create('label', true, 'description'));
        const workspaceEdit = workspaceChange.edit;
        const documentChanges = workspaceEdit.documentChanges;
        assert_1.ok(workspaceEdit.changeAnnotations !== undefined, 'Change annotation defined');
        const annotations = workspaceEdit.changeAnnotations;
        assert_1.strictEqual(documentChanges.length, 1);
        const edits = documentChanges[0].edits;
        assert_1.strictEqual(edits.length, 1);
        assert_1.strictEqual(edits[0].annotationId, '1');
        const annotation = annotations[1];
        assert_1.strictEqual(annotation.label, 'label');
        assert_1.strictEqual(annotation.needsConfirmation, true);
        assert_1.strictEqual(annotation.description, 'description');
    });
});
//# sourceMappingURL=helpers.test.js.map