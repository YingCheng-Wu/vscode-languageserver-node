/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const stream_1 = require("stream");
const main_1 = require("../main");
class TestStream extends stream_1.Duplex {
    _write(chunk, _encoding, done) {
        this.emit('data', chunk);
        done();
    }
    _read(_size) {
    }
}
suite('Connection Tests', () => {
    let serverConnection;
    let clientConnection;
    setup(() => {
        const up = new TestStream();
        const down = new TestStream();
        serverConnection = main_1.createConnection(up, down);
        clientConnection = main_1.createConnection(down, up);
        serverConnection.listen();
        clientConnection.listen();
    });
    test('Ensure request parameter passing', async () => {
        let paramsCorrect = false;
        serverConnection.onRequest(main_1.InitializeRequest.type, (params) => {
            paramsCorrect = !Array.isArray(params) && params.workDoneToken === 'token';
            let result = {
                capabilities: {}
            };
            return result;
        });
        const init = {
            rootUri: 'file:///home/dirkb',
            processId: 1,
            capabilities: {},
            workspaceFolders: null,
            workDoneToken: 'token'
        };
        await clientConnection.sendRequest(main_1.InitializeRequest.type, init);
        assert.ok(paramsCorrect, 'Parameters are transferred correctly');
    });
    test('Ensure notification parameter passing', (done) => {
        serverConnection.onNotification(main_1.DidChangeConfigurationNotification.type, (params) => {
            assert.ok(!Array.isArray(params), 'Parameters are transferred correctly');
            done();
        });
        const param = {
            settings: {}
        };
        clientConnection.sendNotification(main_1.DidChangeConfigurationNotification.type, param);
    });
    test('Ensure work done converted', (done) => {
        serverConnection.onDeclaration((_params, _cancel, workDone, result) => {
            assert.ok(workDone !== undefined, 'Work Done token converted.');
            assert.ok(result === undefined, 'Result token undefined.');
            done();
            return [];
        });
        const params = {
            position: { line: 0, character: 0 },
            textDocument: {
                uri: 'file:///home/dirkb/test.ts'
            },
            workDoneToken: 'xx'
        };
        clientConnection.sendRequest(main_1.DeclarationRequest.type, params);
    });
    test('Ensure result converted', (done) => {
        serverConnection.onDeclaration((_params, _cancel, workDone, result) => {
            assert.ok(workDone === undefined || workDone.constructor.name === 'NullProgressReporter', 'Work Done token undefined or null progress.');
            assert.ok(result !== undefined, 'Result token converted.');
            done();
            return [];
        });
        const params = {
            position: { line: 0, character: 0 },
            textDocument: {
                uri: 'file:///home/dirkb/test.ts'
            },
            partialResultToken: 'yy'
        };
        clientConnection.sendRequest(main_1.DeclarationRequest.type, params);
    });
    test('Report progress test', (done) => {
        serverConnection.onDeclaration((_params, _cancel, workDone, _result) => {
            workDone.begin('title', 0, 'message', false);
            workDone.report(100, 'report');
            workDone.done();
            return [];
        });
        const workDoneToken = 'xx';
        const params = {
            position: { line: 0, character: 0 },
            textDocument: {
                uri: 'file:///home/dirkb/test.ts'
            },
            workDoneToken
        };
        let begin = false;
        let report = false;
        clientConnection.onProgress(main_1.WorkDoneProgress.type, workDoneToken, (param) => {
            switch (param.kind) {
                case 'begin':
                    begin = true;
                    break;
                case 'report':
                    report = true;
                    break;
                case 'end':
                    assert.ok(begin && report, 'Received begin, report and done');
                    done();
                    break;
            }
        });
        clientConnection.sendRequest(main_1.DeclarationRequest.type, params);
    });
    test('Report result test', (done) => {
        serverConnection.onDeclaration((_params, _cancel, _workDone, result) => {
            const range = {
                start: {
                    line: 0,
                    character: 0
                },
                end: {
                    line: 0,
                    character: 10
                }
            };
            const location = {
                targetUri: 'file:///home/dirkb/test.ts',
                targetRange: range,
                targetSelectionRange: range
            };
            result.report(new Array(10).fill(location));
            result.report(new Array(20).fill(location));
            return [];
        });
        const resultToken = 'rr';
        const params = {
            position: { line: 0, character: 0 },
            textDocument: {
                uri: 'file:///home/dirkb/test.ts'
            },
            partialResultToken: resultToken
        };
        const result = [];
        clientConnection.onProgress(main_1.DeclarationRequest.type, resultToken, (values) => {
            result.push(...values);
        });
        clientConnection.sendRequest(main_1.DeclarationRequest.type, params).then((values) => {
            assert.ok(result.length === 30, 'All partial results received');
            assert.ok(values.length === 0, 'No final values');
            done();
        });
    });
});
//# sourceMappingURL=connection.test.js.map