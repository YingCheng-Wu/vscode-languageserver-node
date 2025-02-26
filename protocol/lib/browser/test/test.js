"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const api_1 = require("../../common/api");
const main_1 = require("../main");
suite('Browser Protocol Tests', () => {
    const worker = new Worker('/protocol/dist/worker.js');
    const reader = new main_1.BrowserMessageReader(worker);
    const writer = new main_1.BrowserMessageWriter(worker);
    const connection = main_1.createProtocolConnection(reader, writer);
    connection.listen();
    test('Test Code Completion Request', async () => {
        const params = {
            textDocument: { uri: 'file:///folder/a.ts' },
            position: { line: 1, character: 1 }
        };
        const result = (await connection.sendRequest(api_1.CompletionRequest.type, params));
        assert.strictEqual(result.length, 0);
    });
});
//# sourceMappingURL=test.js.map