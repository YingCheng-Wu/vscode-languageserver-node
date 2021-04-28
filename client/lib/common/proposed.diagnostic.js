"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticFeature = void 0;
const vscode_1 = require("vscode");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const client_1 = require("./client");
function ensure(target, key) {
    if (target[key] === void 0) {
        target[key] = {};
    }
    return target[key];
}
var VDocumentDiagnosticReportKind;
(function (VDocumentDiagnosticReportKind) {
    /**
     * A new diagnostic report with a full
     * set of problems.
     */
    VDocumentDiagnosticReportKind["new"] = "new";
    /**
     * A report indicating that the last
     * returned reports is still accurate.
     */
    VDocumentDiagnosticReportKind["unChanged"] = "unChanged";
})(VDocumentDiagnosticReportKind || (VDocumentDiagnosticReportKind = {}));
var RequestStateKind;
(function (RequestStateKind) {
    RequestStateKind["active"] = "open";
    RequestStateKind["reschedule"] = "reschedule";
    RequestStateKind["outDated"] = "drop";
})(RequestStateKind || (RequestStateKind = {}));
class DiagnosticFeatureProviderImpl {
    constructor(client, options) {
        var _a;
        const diagnosticPullOptions = (_a = client.clientOptions.diagnosticPullOptions) !== null && _a !== void 0 ? _a : { onType: true, onSave: false };
        const documentSelector = options.documentSelector;
        const disposables = [];
        const collection = vscode_1.languages.createDiagnosticCollection(options.identifier);
        disposables.push(collection);
        const availableEditors = new Set();
        const managedDocuments = new Map();
        const matches = (textDocument) => {
            return vscode_1.languages.match(documentSelector, textDocument) > 0 && availableEditors.has(textDocument.uri.toString());
        };
        const manages = (textDocument) => {
            return managedDocuments.has(textDocument.uri.toString());
        };
        this.onDidChangeDiagnosticsEmitter = new vscode_1.EventEmitter();
        this.provider = {
            onDidChangeDiagnostics: this.onDidChangeDiagnosticsEmitter.event,
            provideDiagnostics: (textDocument, token) => {
                const provideDiagnostics = (textDocument, token) => {
                    var _a;
                    const key = textDocument.uri.toString();
                    const params = {
                        textDocument: { uri: client.code2ProtocolConverter.asUri(textDocument.uri) },
                        previousResultId: (_a = managedDocuments.get(key)) === null || _a === void 0 ? void 0 : _a.resultId
                    };
                    return client.sendRequest(vscode_languageserver_protocol_1.Proposed.DocumentDiagnosticRequest.type, params, token).then((result) => {
                        if (result === undefined || result === null) {
                            return { kind: VDocumentDiagnosticReportKind.new, items: [] };
                        }
                        if (result.kind === vscode_languageserver_protocol_1.Proposed.DocumentDiagnosticReportKind.new) {
                            return { kind: VDocumentDiagnosticReportKind.new, resultId: result.resultId, items: client.protocol2CodeConverter.asDiagnostics(result.items) };
                        }
                        else {
                            return { kind: VDocumentDiagnosticReportKind.unChanged, resultId: result.resultId };
                        }
                    }, (error) => {
                        return client.handleFailedRequest(vscode_languageserver_protocol_1.Proposed.DocumentDiagnosticRequest.type, token, error, { kind: VDocumentDiagnosticReportKind.new, items: [] });
                    });
                };
                const middleware = client.clientOptions.middleware;
                return middleware.provideDiagnostics
                    ? middleware.provideDiagnostics(textDocument, token, provideDiagnostics)
                    : provideDiagnostics(textDocument, token);
            }
        };
        const requestStates = new Map();
        const pullDiagnostics = async (textDocument) => {
            var _a;
            const key = textDocument.uri.toString();
            const currentState = requestStates.get(key);
            if (currentState !== undefined) {
                if (currentState.state === RequestStateKind.active) {
                    currentState.tokenSource.cancel();
                }
                requestStates.set(key, { state: RequestStateKind.reschedule, textDocument });
                // We have a state. Wait until the request returns.
                return;
            }
            const tokenSource = new vscode_1.CancellationTokenSource();
            requestStates.set(key, { state: RequestStateKind.active, textDocument, tokenSource });
            let diagnosticReport;
            let afterState;
            try {
                diagnosticReport = (_a = await this.provider.provideDiagnostics(textDocument, tokenSource.token)) !== null && _a !== void 0 ? _a : { kind: VDocumentDiagnosticReportKind.new, items: [] };
            }
            catch (error) {
                if (error instanceof client_1.LSPCancellationError && vscode_languageserver_protocol_1.Proposed.DiagnosticServerCancellationData.is(error.data) && error.data.retriggerRequest === false) {
                    afterState = { state: RequestStateKind.outDated, textDocument };
                }
                if (afterState === undefined && error instanceof vscode_1.CancellationError) {
                    afterState = { state: RequestStateKind.reschedule, textDocument };
                }
                else {
                    throw error;
                }
            }
            afterState = afterState !== null && afterState !== void 0 ? afterState : requestStates.get(key);
            if (afterState === undefined) {
                // This shouldn't happen. Log it
                client.error(`Lost request state in diagnostic pull model. Clearing diagnostics for ${key}`);
                collection.delete(textDocument.uri);
                return;
            }
            requestStates.delete(key);
            if (afterState.state === RequestStateKind.outDated || !manages(textDocument)) {
                return;
            }
            // diagnostics is only undefined if the request has thrown.
            if (diagnosticReport !== undefined) {
                if (diagnosticReport.kind === VDocumentDiagnosticReportKind.new) {
                    collection.set(textDocument.uri, diagnosticReport.items);
                }
                if (diagnosticReport.resultId !== undefined) {
                    const info = managedDocuments.get(key);
                    if (info !== undefined) {
                        info.resultId = diagnosticReport.resultId;
                    }
                }
            }
            if (afterState.state === RequestStateKind.reschedule) {
                pullDiagnostics(textDocument);
            }
        };
        const openEditorsHandler = () => {
            availableEditors.clear();
            for (const info of vscode_1.window.openEditors) {
                availableEditors.add(info.resource.toString());
            }
        };
        openEditorsHandler();
        disposables.push(vscode_1.window.onDidChangeOpenEditors(openEditorsHandler));
        // We always pull on open.
        const openFeature = client.getFeature(vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.method);
        disposables.push(openFeature.onNotificationSent((event) => {
            const textDocument = event.original;
            if (matches(textDocument)) {
                managedDocuments.set(textDocument.uri.toString(), { document: textDocument, resultId: undefined });
                pullDiagnostics(event.original);
            }
        }));
        // Pull all diagnostics for documents that are already open
        for (const textDocument of openFeature.openDocuments) {
            if (matches(textDocument)) {
                managedDocuments.set(textDocument.uri.toString(), { document: textDocument, resultId: undefined });
                pullDiagnostics(textDocument);
            }
        }
        if (diagnosticPullOptions.onType) {
            const changeFeature = client.getFeature(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.method);
            disposables.push(changeFeature.onNotificationSent((event) => {
                const textDocument = event.original.document;
                if ((diagnosticPullOptions.filter === undefined || !diagnosticPullOptions.filter(textDocument, client_1.DiagnosticPullMode.onType)) && manages(textDocument) && event.original.contentChanges.length > 0) {
                    pullDiagnostics(textDocument);
                }
            }));
        }
        if (diagnosticPullOptions.onSave) {
            const saveFeature = client.getFeature(vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.method);
            disposables.push(saveFeature.onNotificationSent((event) => {
                const textDocument = event.original;
                if ((diagnosticPullOptions.filter === undefined || !diagnosticPullOptions.filter(textDocument, client_1.DiagnosticPullMode.onSave)) && manages(textDocument)) {
                    pullDiagnostics(event.original);
                }
            }));
        }
        // WHen the document closes clear things up
        const closeFeature = client.getFeature(vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.method);
        disposables.push(closeFeature.onNotificationSent((event) => {
            const textDocument = event.original;
            const requestState = requestStates.get(textDocument.uri.toString());
            if (requestState !== undefined) {
                requestStates.set(textDocument.uri.toString(), { state: RequestStateKind.outDated, textDocument });
            }
            if (manages(textDocument)) {
                collection.delete(textDocument.uri);
                managedDocuments.delete(textDocument.uri.toString());
            }
        }));
        this.onDidChangeDiagnosticsEmitter.event(() => {
            for (const item of managedDocuments.values()) {
                pullDiagnostics(item.document);
            }
        });
        this.disposable = vscode_1.Disposable.from(...disposables);
    }
}
class DiagnosticFeature extends client_1.TextDocumentFeature {
    constructor(client) {
        super(client, vscode_languageserver_protocol_1.Proposed.DocumentDiagnosticRequest.type);
    }
    fillClientCapabilities(capabilities) {
        let capability = ensure(ensure(capabilities, 'textDocument'), 'diagnostic');
        capability.dynamicRegistration = true;
    }
    initialize(capabilities, documentSelector) {
        const client = this._client;
        client.onRequest(vscode_languageserver_protocol_1.Proposed.DiagnosticRefreshRequest.type, async () => {
            for (const provider of this.getAllProviders()) {
                provider.onDidChangeDiagnosticsEmitter.fire();
            }
        });
        let [id, options] = this.getRegistration(documentSelector, capabilities.diagnosticProvider);
        if (!id || !options) {
            return;
        }
        this.register({ id: id, registerOptions: options });
    }
    registerLanguageProvider(options) {
        const provider = new DiagnosticFeatureProviderImpl(this._client, options);
        return [provider.disposable, provider];
    }
}
exports.DiagnosticFeature = DiagnosticFeature;
//# sourceMappingURL=proposed.diagnostic.js.map