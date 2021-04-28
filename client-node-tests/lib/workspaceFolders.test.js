'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
const sinon = require("sinon");
const workspaceFolders_1 = require("vscode-languageclient/lib/common/workspaceFolders");
const vscode_languageclient_1 = require("vscode-languageclient");
class TestLanguageClient extends vscode_languageclient_1.BaseLanguageClient {
    createMessageTransports() {
        throw new Error('Method not implemented.');
    }
    onRequest() {
        return {
            dispose: () => { }
        };
    }
    getLocale() {
        return 'en';
    }
}
class TestWorkspaceFoldersFeature extends workspaceFolders_1.WorkspaceFoldersFeature {
    sendInitialEvent(currentWorkspaceFolders) {
        super.sendInitialEvent(currentWorkspaceFolders);
    }
    initializeWithFolders(currentWorkspaceFolders) {
        super.initializeWithFolders(currentWorkspaceFolders);
    }
}
function testEvent(initial, then, added, removed) {
    const client = new TestLanguageClient('foo', 'bar', {});
    const send = sinon.spy();
    sinon.replace(client, 'sendNotification', send);
    const feature = new TestWorkspaceFoldersFeature(client);
    feature.initializeWithFolders(initial);
    feature.sendInitialEvent(then);
    assert.equal(send.callCount, 1, 'call count wrong');
    assert.equal(send.args[0].length, 2);
    const notification = send.args[0][1];
    assert.deepEqual(notification.event.added, added);
    assert.deepEqual(notification.event.removed, removed);
}
function testNoEvent(initial, then) {
    const client = new TestLanguageClient('foo', 'bar', {});
    const send = sinon.spy();
    sinon.replace(client, 'sendNotification', send);
    const feature = new TestWorkspaceFoldersFeature(client);
    feature.initializeWithFolders(initial);
    feature.sendInitialEvent(then);
    assert.equal(send.callCount, 0, 'call count wrong');
}
suite('Workspace Folder Feature Tests', () => {
    const removedFolder = { uri: vscode.Uri.parse('file://xox/removed'), name: 'removedName', index: 0 };
    const addedFolder = { uri: vscode.Uri.parse('file://foo/added'), name: 'addedName', index: 0 };
    const addedProto = { uri: 'file://foo/added', name: 'addedName' };
    const removedProto = { uri: 'file://xox/removed', name: 'removedName' };
    test('remove/add', async () => {
        testEvent([removedFolder], [addedFolder], [addedProto], [removedProto]);
    });
    test('remove', async () => {
        testEvent([removedFolder], [], [], [removedProto]);
    });
    test('remove2', async () => {
        testEvent([removedFolder], undefined, [], [removedProto]);
    });
    test('add', async () => {
        testEvent([], [addedFolder], [addedProto], []);
    });
    test('add2', async () => {
        testEvent(undefined, [addedFolder], [addedProto], []);
    });
    test('noChange1', async () => {
        testNoEvent([addedFolder, removedFolder], [addedFolder, removedFolder]);
    });
    test('noChange2', async () => {
        testNoEvent([], []);
    });
    test('noChange3', async () => {
        testNoEvent(undefined, undefined);
    });
});
//# sourceMappingURL=workspaceFolders.test.js.map