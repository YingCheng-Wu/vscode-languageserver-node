"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const stream_1 = require("stream");
const util_1 = require("util");
const main_1 = require("../main");
const hostConnection = require("../main");
const customCancellationStrategy_1 = require("./customCancellationStrategy");
const messages_1 = require("../../common/messages");
let TestDuplex = function () {
    function TestDuplex(name = 'ds1', dbg = false) {
        stream_1.Duplex.call(this);
        this.name = name;
        this.dbg = dbg;
    }
    util_1.inherits(TestDuplex, stream_1.Duplex);
    TestDuplex.prototype._write = function (chunk, _encoding, done) {
        // eslint-disable-next-line no-console
        if (this.dbg) {
            console.log(this.name + ': write: ' + chunk.toString());
        }
        setImmediate(() => {
            this.emit('data', chunk);
        });
        done();
    };
    TestDuplex.prototype._read = function (_size) {
    };
    return TestDuplex;
}();
suite('Connection', () => {
    test('Test Duplex Stream', (done) => {
        let stream = new TestDuplex('ds1');
        stream.on('data', (chunk) => {
            assert.strictEqual('Hello World', chunk.toString());
            done();
        });
        stream.write('Hello World');
    });
    test('Test Duplex Stream Connection', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let connection = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        connection.listen();
        let counter = 0;
        let content = '';
        duplexStream2.on('data', (chunk) => {
            content += chunk.toString();
            if (++counter === 2) {
                assert.strictEqual(content.indexOf('Content-Length: 77'), 0);
                done();
            }
        });
        connection.sendRequest(type, 'foo');
    });
    test('Primitive param as positional', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let connection = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        connection.listen();
        let counter = 0;
        let content = '';
        duplexStream2.on('data', (chunk) => {
            content += chunk.toString();
            if (++counter === 2) {
                assert.ok(content.indexOf('"params":[true]') !== -1);
                done();
            }
        });
        connection.sendRequest(type, true);
    });
    test('Array param as positional', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let connection = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        connection.listen();
        let counter = 0;
        let content = '';
        duplexStream2.on('data', (chunk) => {
            content += chunk.toString();
            if (++counter === 2) {
                assert.ok(content.indexOf('"params":[[true]]') !== -1);
                done();
            }
        });
        connection.sendRequest(type, [true]);
    });
    test('Literal param as named', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let connection = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        connection.listen();
        let counter = 0;
        let content = '';
        duplexStream2.on('data', (chunk) => {
            content += chunk.toString();
            if (++counter === 2) {
                assert.ok(content.indexOf('"params":{"value":true}') !== -1);
                done();
            }
        });
        connection.sendRequest(type, { value: true });
    });
    test('Literal param as positional', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest', messages_1.ParameterStructures.byPosition);
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let connection = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        connection.listen();
        let counter = 0;
        let content = '';
        duplexStream2.on('data', (chunk) => {
            content += chunk.toString();
            if (++counter === 2) {
                assert.ok(content.indexOf('"params":[{"value":true}]') !== -1);
                done();
            }
        });
        connection.sendRequest(type, { value: true });
    });
    test('Handle Single Request', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (p1, _token) => {
            assert.strictEqual(p1, 'foo');
            return p1;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, 'foo').then((result) => {
            assert.strictEqual(result, 'foo');
            done();
        });
    });
    test('Handle Multiple Requests', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (p1, _token) => {
            return p1;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        let promises = [];
        promises.push(client.sendRequest(type, 'foo'));
        promises.push(client.sendRequest(type, 'bar'));
        Promise.all(promises).then((values) => {
            assert.strictEqual(values.length, 2);
            assert.strictEqual(values[0], 'foo');
            assert.strictEqual(values[1], 'bar');
            done();
        });
    });
    test('Unhandled Request', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, 'foo').then((_result) => {
        }, (error) => {
            assert.strictEqual(error.code, main_1.ErrorCodes.MethodNotFound);
            done();
        });
    });
    test('Receives undefined param as null', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (param) => {
            assert.strictEqual(param, null);
            return '';
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, undefined).then((_result) => {
            done();
        });
    });
    test('Receives null as null', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (param) => {
            assert.strictEqual(param, null);
            return null;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, null).then(result => {
            assert.deepEqual(result, null);
            done();
        });
    });
    test('Receives 0 as 0', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (param) => {
            assert.strictEqual(param, 0);
            return 0;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, 0).then(result => {
            assert.deepEqual(result, 0);
            done();
        });
    });
    let testNotification = new main_1.NotificationType('testNotification');
    test('Send and Receive Notification', (done) => {
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onNotification(testNotification, (param) => {
            assert.strictEqual(param.value, true);
            done();
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendNotification(testNotification, { value: true });
    });
    test('Unhandled notification event', (done) => {
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onUnhandledNotification((message) => {
            assert.strictEqual(message.method, testNotification.method);
            done();
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendNotification(testNotification, { value: true });
    });
    test('Dispose connection', (done) => {
        let type = new main_1.RequestType('test/handleSingleRequest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (_param) => {
            client.dispose();
            return '';
        });
        server.listen();
        client.listen();
        client.sendRequest(type, '').then(_result => {
            assert(false);
        }, () => {
            done();
        });
    });
    test('Disposed connection throws', (done) => {
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.dispose();
        try {
            client.sendNotification(testNotification);
            assert(false);
        }
        catch (error) {
            done();
        }
    });
    test('Two listen throw', (done) => {
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        try {
            client.listen();
            assert(false);
        }
        catch (error) {
            done();
        }
    });
    test('Notify on connection dispose', (done) => {
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.onDispose(() => {
            done();
        });
        client.dispose();
    });
    test('N params in notifications', (done) => {
        let type = new main_1.NotificationType2('test');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onNotification(type, (p1, p2) => {
            assert.strictEqual(p1, 10);
            assert.strictEqual(p2, 'vscode');
            done();
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendNotification(type, 10, 'vscode');
    });
    test('N params in request / response', (done) => {
        let type = new main_1.RequestType3('add');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (p1, p2, p3) => {
            assert.strictEqual(p1, 10);
            assert.strictEqual(p2, 20);
            assert.strictEqual(p3, 30);
            return p1 + p2 + p3;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, 10, 20, 30).then(result => {
            assert.strictEqual(result, 60);
            done();
        }, () => {
            assert(false);
            done();
        });
    });
    test('N params in request / response with token', (done) => {
        let type = new main_1.RequestType3('add');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (p1, p2, p3, _token) => {
            assert.strictEqual(p1, 10);
            assert.strictEqual(p2, 20);
            assert.strictEqual(p3, 30);
            return p1 + p2 + p3;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        let token = new main_1.CancellationTokenSource().token;
        client.listen();
        client.sendRequest(type, 10, 20, 30, token).then(result => {
            assert.strictEqual(result, 60);
            done();
        }, () => {
            assert(false);
            done();
        });
    });
    test('One Param as array in request', (done) => {
        let type = new main_1.RequestType('add', messages_1.ParameterStructures.byPosition);
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (p1) => {
            assert(Array.isArray(p1));
            assert.strictEqual(p1[0], 10);
            assert.strictEqual(p1[1], 20);
            assert.strictEqual(p1[2], 30);
            return 60;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        let token = new main_1.CancellationTokenSource().token;
        client.listen();
        client.sendRequest(type, [10, 20, 30], token).then(result => {
            assert.strictEqual(result, 60);
            done();
        }, () => {
            assert(false);
            done();
        });
    });
    test('One Param as array in notification', (done) => {
        let type = new main_1.NotificationType('add', messages_1.ParameterStructures.byPosition);
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onNotification(type, (p1) => {
            assert(Array.isArray(p1));
            assert.strictEqual(p1[0], 10);
            assert.strictEqual(p1[1], 20);
            assert.strictEqual(p1[2], 30);
            done();
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendNotification(type, [10, 20, 30]);
    });
    test('Untyped request / response', (done) => {
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest('test', (p1, p2, p3, _token) => {
            assert.strictEqual(p1, 10);
            assert.strictEqual(p2, 20);
            assert.strictEqual(p3, 30);
            return p1 + p2 + p3;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        let token = new main_1.CancellationTokenSource().token;
        client.listen();
        client.sendRequest('test', 10, 20, 30, token).then((result) => {
            assert.strictEqual(result, 60);
            done();
        }, () => {
            assert(false);
            done();
        });
    });
    test('Untyped request / response with parameter structure', (done) => {
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest('test', (p1, _token) => {
            assert.strictEqual(p1.value, 10);
            return p1.value;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        let token = new main_1.CancellationTokenSource().token;
        client.listen();
        client.sendRequest('test', messages_1.ParameterStructures.byPosition, { value: 10 }, token).then((result) => {
            assert.strictEqual(result, 10);
            done();
        }, () => {
            assert(false);
            done();
        });
    });
    test('Cancellation token is undefined', (done) => {
        let type = new main_1.RequestType3('add');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (p1, p2, p3, _token) => {
            assert.strictEqual(p1, 10);
            assert.strictEqual(p2, 20);
            assert.strictEqual(p3, 30);
            return p1 + p2 + p3;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, 10, 20, 30, undefined).then(result => {
            assert.strictEqual(result, 60);
            done();
        }, () => {
            assert(false);
            done();
        });
    });
    test('Missing params in request', (done) => {
        let type = new main_1.RequestType3('add');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, (p1, p2, p3, _token) => {
            assert.strictEqual(p1, 10);
            assert.strictEqual(p2, 20);
            assert.strictEqual(p3, null);
            return p1 + p2;
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, 10, 20).then((result) => {
            assert.strictEqual(result, 30);
            done();
        }, () => {
            assert(false);
            done();
        });
    });
    test('Missing params in notifications', (done) => {
        let type = new main_1.NotificationType2('test');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onNotification(type, (p1, p2) => {
            assert.strictEqual(p1, 10);
            assert.strictEqual(p2, null);
            done();
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendNotification(type, 10);
    });
    test('Regular Cancellation', (done) => {
        let type = new hostConnection.RequestType0('cancelTest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        const source = new main_1.CancellationTokenSource();
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger);
        server.onRequest(type, async (t) => {
            source.cancel();
            while (!t.isCancellationRequested) {
                // regular cancellation requires async for it to work
                await delay(0);
            }
            done();
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger);
        client.listen();
        client.sendRequest(type, source.token);
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    });
    test('Custom Cancellation', (done) => {
        let type = new hostConnection.RequestType0('cancelTest');
        let duplexStream1 = new TestDuplex('ds1');
        let duplexStream2 = new TestDuplex('ds2');
        const source = new main_1.CancellationTokenSource();
        const strategy = customCancellationStrategy_1.getCustomCancellationStrategy();
        const options = { cancellationStrategy: strategy };
        let server = hostConnection.createMessageConnection(duplexStream2, duplexStream1, hostConnection.NullLogger, options);
        server.onRequest(type, t => {
            source.cancel();
            while (!t.isCancellationRequested) {
                // custom cancellation that doesn't require async to work
            }
            strategy.dispose();
            done();
        });
        server.listen();
        let client = hostConnection.createMessageConnection(duplexStream1, duplexStream2, hostConnection.NullLogger, options);
        client.listen();
        client.sendRequest(type, source.token);
    });
});
//# sourceMappingURL=connection.test.js.map