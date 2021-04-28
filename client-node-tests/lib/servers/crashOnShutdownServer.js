"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../../../server/node");
let connection = node_1.createConnection();
connection.onInitialize((_params) => {
    return { capabilities: {} };
});
connection.onShutdown(() => {
    process.exit(100);
});
connection.listen();
//# sourceMappingURL=crashOnShutdownServer.js.map