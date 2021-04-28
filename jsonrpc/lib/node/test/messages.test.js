"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const zlib = require("zlib");
const msgpack = require("msgpack-lite");
const messages_1 = require("../../common/messages");
const encoding_1 = require("../../common/encoding");
const main_1 = require("../../node/main");
const ril_1 = require("../ril");
const stream_1 = require("stream");
const util_1 = require("util");
const buffer_1 = require("buffer");
function assertDefined(value) {
    assert.ok(value !== undefined && value !== null);
}
const TestWritable = function () {
    function TestWritable() {
        stream_1.Writable.call(this);
    }
    util_1.inherits(TestWritable, stream_1.Writable);
    TestWritable.prototype._write = function (chunk, encoding, done) {
        const toAdd = (typeof chunk === 'string')
            ? buffer_1.Buffer.from(chunk, encoding)
            : chunk;
        if (this.data === undefined) {
            this.data = toAdd;
        }
        else {
            this.data = buffer_1.Buffer.concat([this.data, toAdd]);
        }
        done();
    };
    return TestWritable;
}();
const gzipEncoder = {
    name: 'gzip',
    encode: async (input) => {
        return new Promise((resolve, reject) => {
            zlib.gzip(input, (error, buffer) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(buffer);
                }
            });
        });
    }
};
const gzipDecoder = {
    name: 'gzip',
    decode: async (buffer) => {
        return new Promise((resolve, reject) => {
            zlib.gunzip(buffer, (error, value) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(value);
                }
            });
        });
    }
};
const msgpackEncoder = {
    name: 'messagepack',
    // A shipping-quality encoder would remove properties with undefined values like JSON.stringify does (https://github.com/kawanet/msgpack-lite/issues/71).
    encode: (msg) => Promise.resolve(msgpack.encode(msg)),
};
const msgpackDecoder = {
    name: 'messagepack',
    decode: (buffer) => Promise.resolve(msgpack.decode(buffer)),
};
suite('Messages', () => {
    test('Writing', async () => {
        const writable = new TestWritable();
        const writer = new main_1.StreamMessageWriter(writable, 'ascii');
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'example'
        };
        await writer.write(request);
        writable.end();
        assertDefined(writable.data);
        assert.ok(writable.data.equals(buffer_1.Buffer.from('Content-Length: 43\r\n\r\n{"jsonrpc":"2.0","id":1,"method":"example"}', 'ascii')));
    });
    test('Reading', (done) => {
        const readable = new stream_1.Readable();
        new main_1.StreamMessageReader(readable).listen((msg) => {
            const message = msg;
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.method, 'example');
            done();
        });
        readable.push('Content-Length: 43\r\n\r\n{"jsonrpc":"2.0","id":1,"method":"example"}');
        readable.push(null);
    });
    test('Read partial', (done) => {
        const readable = new stream_1.Readable();
        readable._read = function () { };
        const reader = new main_1.StreamMessageReader(readable);
        reader.partialMessageTimeout = 100;
        const partOne = 'Content-Length: 43\r\n\r\n';
        const partTwo = '{"jsonrpc":"2.0","id":1,"method":"example"}';
        reader.listen((msg) => {
            const message = msg;
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.method, 'example');
            setTimeout(() => {
                done();
            }, 200);
        });
        reader.onPartialMessage((_info) => {
            setTimeout(() => {
                readable.push(partTwo);
                readable.push(null);
            }, 20);
        });
        readable.push(partOne);
    });
    test('Basic Zip / Unzip', async () => {
        // The zip / unzip value is different per platform. Only test under Linux.
        if (process.platform !== 'linux') {
            return;
        }
        const msg = { jsonrpc: '2.0', id: 1, method: 'example' };
        const zipped = await gzipEncoder.encode(buffer_1.Buffer.from(JSON.stringify(msg), 'utf8'));
        assert.strictEqual(buffer_1.Buffer.from(zipped).toString('base64'), 'H4sIAAAAAAAAA6tWyirOzysqSFayUjLSM1DSUcpMUbIy1FHKTS3JyAcylVIrEnMLclKVagH7JiWtKwAAAA==');
        const unzipped = JSON.parse(buffer_1.Buffer.from(await gzipDecoder.decode(zipped)).toString('utf-8'));
        assert.strictEqual(unzipped.id, 1);
        assert.strictEqual(unzipped.method, 'example');
    });
    test('Encode', (done) => {
        const writable = new TestWritable();
        const writer = new main_1.StreamMessageWriter(writable, {
            charset: 'utf-8',
            contentEncoder: gzipEncoder,
        });
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'example'
        };
        writer.write(request).then(() => {
            writable.end();
            assertDefined(writable.data);
            const readable = new stream_1.Readable();
            const reader = new main_1.StreamMessageReader(readable, {
                charset: 'utf-8',
                contentDecoder: gzipDecoder
            });
            reader.listen((message) => {
                if (!messages_1.isRequestMessage(message)) {
                    throw new Error(`No request message`);
                }
                assert.equal(message.id, 1);
                assert.equal(message.method, 'example');
                done();
            });
            readable.push(writable.data);
            readable.push(null);
        });
    });
    test('Decode', (done) => {
        const readable = new stream_1.Readable();
        const reader = new main_1.StreamMessageReader(readable, {
            charset: 'utf-8',
            contentDecoder: gzipDecoder
        });
        reader.listen((message) => {
            if (!messages_1.isRequestMessage(message)) {
                throw new Error(`No request message`);
            }
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.method, 'example');
            done();
        });
        const payload = buffer_1.Buffer.concat([
            buffer_1.Buffer.from('Content-Encoding: gzip\r\nContent-Length: 61\r\n\r\n', 'ascii'),
            zlib.gzipSync(buffer_1.Buffer.from('{"jsonrpc":"2.0","id":1,"method":"example"}', 'utf8'))
        ]);
        readable.push(payload);
        readable.push(null);
    });
    test('Generate Accept Encoding', () => {
        assert.deepStrictEqual(encoding_1.Encodings.getEncodingHeaderValue([{ name: 'gzip' }]), 'gzip');
        assert.deepStrictEqual(encoding_1.Encodings.getEncodingHeaderValue([{ name: 'gzip' }, { name: 'compress' }]), 'gzip;q=1, compress;q=0');
        assert.deepStrictEqual(encoding_1.Encodings.getEncodingHeaderValue([{ name: 'gzip' }, { name: 'compress' }, { name: 'deflate' }]), 'gzip;q=1, compress;q=0.5, deflate;q=0');
        assert.deepStrictEqual(encoding_1.Encodings.getEncodingHeaderValue([{ name: 'gzip' }, { name: 'compress' }, { name: 'deflate' }, { name: 'br' }]), 'gzip;q=1, compress;q=0.7, deflate;q=0.4, br;q=0.1');
    });
    test('Messagepack encoding', async () => {
        const writable = new TestWritable();
        const writer = new main_1.StreamMessageWriter(writable, {
            contentTypeEncoder: msgpackEncoder,
        });
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'example'
        };
        await writer.write(request);
        writable.end();
        assertDefined(writable.data);
        const readable = new stream_1.Readable();
        const reader = new main_1.StreamMessageReader(readable, {
            contentTypeDecoder: msgpackDecoder,
        });
        await new Promise((resolve, reject) => {
            try {
                reader.listen((message) => {
                    if (!messages_1.isRequestMessage(message)) {
                        throw reject(new Error(`No request message`));
                    }
                    assert.strictEqual(message.id, 1);
                    assert.strictEqual(message.method, 'example');
                    resolve();
                });
                readable.push(writable.data);
                readable.push(null);
            }
            catch (err) {
                reject(err);
            }
        });
    });
    test('MessageBuffer Simple', () => {
        const buffer = ril_1.default().messageBuffer.create('utf-8');
        buffer.append(buffer_1.Buffer.from('Content-Length: 43\r\n\r\n', 'ascii'));
        buffer.append(buffer_1.Buffer.from('{"jsonrpc":"2.0","id":1,"method":"example"}', 'utf8'));
        const headers = buffer.tryReadHeaders();
        assertDefined(headers);
        assert.strictEqual(headers.size, 1);
        assert.strictEqual(headers.get('Content-Length'), '43');
        const content = JSON.parse(buffer.tryReadBody(43).toString('utf8'));
        assert.strictEqual(content.id, 1);
        assert.strictEqual(content.method, 'example');
    });
    test('MessageBuffer Random', () => {
        const data = [];
        for (let i = 0; i < 1000; i++) {
            data.push({ index: i, label: `label${i}` });
        }
        const content = buffer_1.Buffer.from(JSON.stringify(data), 'utf8');
        const header = buffer_1.Buffer.from(`Content-Length: ${content.byteLength}\r\n\r\n`, 'ascii');
        const payload = buffer_1.Buffer.concat([header, content]);
        const buffer = ril_1.default().messageBuffer.create('utf-8');
        for (const upper of [10, 64, 512, 1024]) {
            let sent = 0;
            while (sent < payload.byteLength) {
                let piece = Math.floor((Math.random() * upper) + 1);
                if (piece > payload.byteLength - sent) {
                    piece = payload.byteLength - sent;
                }
                buffer.append(payload.slice(sent, sent + piece));
                sent = sent + piece;
            }
            const headers = buffer.tryReadHeaders();
            assertDefined(headers);
            assert.strictEqual(headers.size, 1);
            const length = parseInt(headers.get('Content-Length'));
            assert.strictEqual(length, content.byteLength);
            const body = JSON.parse(buffer.tryReadBody(length).toString('utf8'));
            assert.ok(Array.isArray(body));
            assert.strictEqual(body.length, 1000);
            for (let i = 0; i < body.length; i++) {
                const item = body[i];
                assert.strictEqual(item.index, i);
                assert.strictEqual(item.label, `label${i}`);
            }
        }
    });
});
//# sourceMappingURL=messages.test.js.map