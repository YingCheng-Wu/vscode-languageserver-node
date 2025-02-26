"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticFeature = void 0;
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const DiagnosticFeature = (Base) => {
    return class extends Base {
        get diagnostics() {
            return {
                refresh: () => {
                    return this.connection.sendRequest(vscode_languageserver_protocol_1.Proposed.DiagnosticRefreshRequest.type);
                },
                on: (handler) => {
                    this.connection.onRequest(vscode_languageserver_protocol_1.Proposed.DocumentDiagnosticRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), undefined);
                    });
                }
            };
        }
    };
};
exports.DiagnosticFeature = DiagnosticFeature;
//# sourceMappingURL=proposed.diagnostic.js.map