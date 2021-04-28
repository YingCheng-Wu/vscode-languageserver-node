"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticRefreshRequest = exports.WorkspaceDiagnosticRequest = exports.DocumentDiagnosticRequest = exports.DocumentDiagnosticReportKind = exports.DiagnosticServerCancellationData = void 0;
const Is = require("./utils/is");
const messages_1 = require("./messages");
/**
 * @since 3.17.0 - proposed state
 */
var DiagnosticServerCancellationData;
(function (DiagnosticServerCancellationData) {
    function is(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.retriggerRequest);
    }
    DiagnosticServerCancellationData.is = is;
})(DiagnosticServerCancellationData = exports.DiagnosticServerCancellationData || (exports.DiagnosticServerCancellationData = {}));
/**
 * @since 3.17.0 - proposed state
 */
var DocumentDiagnosticReportKind;
(function (DocumentDiagnosticReportKind) {
    /**
     * A new diagnostic report with a full
     * set of problems.
     */
    DocumentDiagnosticReportKind["new"] = "new";
    /**
     * A report indicating that the last
     * returned reports is still accurate.
     */
    DocumentDiagnosticReportKind["unChanged"] = "unChanged";
})(DocumentDiagnosticReportKind = exports.DocumentDiagnosticReportKind || (exports.DocumentDiagnosticReportKind = {}));
/**
 * @since 3.17.0 - proposed state
 */
var DocumentDiagnosticRequest;
(function (DocumentDiagnosticRequest) {
    DocumentDiagnosticRequest.method = 'textDocument/diagnostic';
    DocumentDiagnosticRequest.type = new messages_1.ProtocolRequestType(DocumentDiagnosticRequest.method);
})(DocumentDiagnosticRequest = exports.DocumentDiagnosticRequest || (exports.DocumentDiagnosticRequest = {}));
/**
 * @since 3.17.0 - proposed state
 */
var WorkspaceDiagnosticRequest;
(function (WorkspaceDiagnosticRequest) {
    WorkspaceDiagnosticRequest.method = 'workspace/diagnostic';
    WorkspaceDiagnosticRequest.type = new messages_1.ProtocolRequestType(WorkspaceDiagnosticRequest.method);
})(WorkspaceDiagnosticRequest = exports.WorkspaceDiagnosticRequest || (exports.WorkspaceDiagnosticRequest = {}));
/**
 * @since 3.17.0 - proposed state
 */
var DiagnosticRefreshRequest;
(function (DiagnosticRefreshRequest) {
    DiagnosticRefreshRequest.method = `workspace/diagnostic/refresh`;
    DiagnosticRefreshRequest.type = new messages_1.ProtocolRequestType0(DiagnosticRefreshRequest.method);
})(DiagnosticRefreshRequest = exports.DiagnosticRefreshRequest || (exports.DiagnosticRefreshRequest = {}));
//# sourceMappingURL=proposed.diagnostic.js.map