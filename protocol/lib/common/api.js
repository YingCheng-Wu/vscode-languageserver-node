"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proposed = exports.LSPErrorCodes = exports.createProtocolConnection = void 0;
__exportStar(require("vscode-jsonrpc"), exports);
__exportStar(require("vscode-languageserver-types"), exports);
__exportStar(require("./messages"), exports);
__exportStar(require("./protocol"), exports);
var connection_1 = require("./connection");
Object.defineProperty(exports, "createProtocolConnection", { enumerable: true, get: function () { return connection_1.createProtocolConnection; } });
var LSPErrorCodes;
(function (LSPErrorCodes) {
    /**
    * This is the start range of LSP reserved error codes.
    * It doesn't denote a real error code.
    *
    * @since 3.16.0
    */
    LSPErrorCodes.lspReservedErrorRangeStart = -32899;
    /**
     * The server cancelled the request. This error code should
     * only be used for requests that explicitly support being
     * server cancellable.
     *
     * @since 3.17.0
     */
    LSPErrorCodes.ServerCancelled = -32802;
    /**
     * The server detected that the content of a document got
     * modified outside normal conditions. A server should
     * NOT send this error code if it detects a content change
     * in it unprocessed messages. The result even computed
     * on an older state might still be useful for the client.
     *
     * If a client decides that a result is not of any use anymore
     * the client should cancel the request.
     */
    LSPErrorCodes.ContentModified = -32801;
    /**
     * The client has canceled a request and a server as detected
     * the cancel.
     */
    LSPErrorCodes.RequestCancelled = -32800;
    /**
    * This is the end range of LSP reserved error codes.
    * It doesn't denote a real error code.
    *
    * @since 3.16.0
    */
    LSPErrorCodes.lspReservedErrorRangeEnd = -32800;
})(LSPErrorCodes = exports.LSPErrorCodes || (exports.LSPErrorCodes = {}));
const diag = require("./proposed.diagnostic");
var Proposed;
(function (Proposed) {
    Proposed.DiagnosticServerCancellationData = diag.DiagnosticServerCancellationData;
    Proposed.DocumentDiagnosticReportKind = diag.DocumentDiagnosticReportKind;
    Proposed.DocumentDiagnosticRequest = diag.DocumentDiagnosticRequest;
    Proposed.DiagnosticRefreshRequest = diag.DiagnosticRefreshRequest;
})(Proposed = exports.Proposed || (exports.Proposed = {}));
//# sourceMappingURL=api.js.map