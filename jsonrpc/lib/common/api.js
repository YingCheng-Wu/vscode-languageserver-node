"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
/// <reference path="../../typings/thenable.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.Trace = exports.ProgressType = exports.createMessageConnection = exports.NullLogger = exports.ConnectionOptions = exports.ConnectionStrategy = exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = exports.CancellationToken = exports.CancellationTokenSource = exports.Emitter = exports.Event = exports.Disposable = exports.ParameterStructures = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.ErrorCodes = exports.ResponseError = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType0 = exports.RequestType = exports.RAL = void 0;
exports.CancellationStrategy = void 0;
const messages_1 = require("../common/messages");
Object.defineProperty(exports, "RequestType", { enumerable: true, get: function () { return messages_1.RequestType; } });
Object.defineProperty(exports, "RequestType0", { enumerable: true, get: function () { return messages_1.RequestType0; } });
Object.defineProperty(exports, "RequestType1", { enumerable: true, get: function () { return messages_1.RequestType1; } });
Object.defineProperty(exports, "RequestType2", { enumerable: true, get: function () { return messages_1.RequestType2; } });
Object.defineProperty(exports, "RequestType3", { enumerable: true, get: function () { return messages_1.RequestType3; } });
Object.defineProperty(exports, "RequestType4", { enumerable: true, get: function () { return messages_1.RequestType4; } });
Object.defineProperty(exports, "RequestType5", { enumerable: true, get: function () { return messages_1.RequestType5; } });
Object.defineProperty(exports, "RequestType6", { enumerable: true, get: function () { return messages_1.RequestType6; } });
Object.defineProperty(exports, "RequestType7", { enumerable: true, get: function () { return messages_1.RequestType7; } });
Object.defineProperty(exports, "RequestType8", { enumerable: true, get: function () { return messages_1.RequestType8; } });
Object.defineProperty(exports, "RequestType9", { enumerable: true, get: function () { return messages_1.RequestType9; } });
Object.defineProperty(exports, "ResponseError", { enumerable: true, get: function () { return messages_1.ResponseError; } });
Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function () { return messages_1.ErrorCodes; } });
Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function () { return messages_1.NotificationType; } });
Object.defineProperty(exports, "NotificationType0", { enumerable: true, get: function () { return messages_1.NotificationType0; } });
Object.defineProperty(exports, "NotificationType1", { enumerable: true, get: function () { return messages_1.NotificationType1; } });
Object.defineProperty(exports, "NotificationType2", { enumerable: true, get: function () { return messages_1.NotificationType2; } });
Object.defineProperty(exports, "NotificationType3", { enumerable: true, get: function () { return messages_1.NotificationType3; } });
Object.defineProperty(exports, "NotificationType4", { enumerable: true, get: function () { return messages_1.NotificationType4; } });
Object.defineProperty(exports, "NotificationType5", { enumerable: true, get: function () { return messages_1.NotificationType5; } });
Object.defineProperty(exports, "NotificationType6", { enumerable: true, get: function () { return messages_1.NotificationType6; } });
Object.defineProperty(exports, "NotificationType7", { enumerable: true, get: function () { return messages_1.NotificationType7; } });
Object.defineProperty(exports, "NotificationType8", { enumerable: true, get: function () { return messages_1.NotificationType8; } });
Object.defineProperty(exports, "NotificationType9", { enumerable: true, get: function () { return messages_1.NotificationType9; } });
Object.defineProperty(exports, "ParameterStructures", { enumerable: true, get: function () { return messages_1.ParameterStructures; } });
const disposable_1 = require("../common/disposable");
Object.defineProperty(exports, "Disposable", { enumerable: true, get: function () { return disposable_1.Disposable; } });
const events_1 = require("../common/events");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return events_1.Event; } });
Object.defineProperty(exports, "Emitter", { enumerable: true, get: function () { return events_1.Emitter; } });
const cancellation_1 = require("../common/cancellation");
Object.defineProperty(exports, "CancellationTokenSource", { enumerable: true, get: function () { return cancellation_1.CancellationTokenSource; } });
Object.defineProperty(exports, "CancellationToken", { enumerable: true, get: function () { return cancellation_1.CancellationToken; } });
const messageReader_1 = require("../common/messageReader");
Object.defineProperty(exports, "MessageReader", { enumerable: true, get: function () { return messageReader_1.MessageReader; } });
Object.defineProperty(exports, "AbstractMessageReader", { enumerable: true, get: function () { return messageReader_1.AbstractMessageReader; } });
Object.defineProperty(exports, "ReadableStreamMessageReader", { enumerable: true, get: function () { return messageReader_1.ReadableStreamMessageReader; } });
const messageWriter_1 = require("../common/messageWriter");
Object.defineProperty(exports, "MessageWriter", { enumerable: true, get: function () { return messageWriter_1.MessageWriter; } });
Object.defineProperty(exports, "AbstractMessageWriter", { enumerable: true, get: function () { return messageWriter_1.AbstractMessageWriter; } });
Object.defineProperty(exports, "WriteableStreamMessageWriter", { enumerable: true, get: function () { return messageWriter_1.WriteableStreamMessageWriter; } });
const connection_1 = require("../common/connection");
Object.defineProperty(exports, "ConnectionStrategy", { enumerable: true, get: function () { return connection_1.ConnectionStrategy; } });
Object.defineProperty(exports, "ConnectionOptions", { enumerable: true, get: function () { return connection_1.ConnectionOptions; } });
Object.defineProperty(exports, "NullLogger", { enumerable: true, get: function () { return connection_1.NullLogger; } });
Object.defineProperty(exports, "createMessageConnection", { enumerable: true, get: function () { return connection_1.createMessageConnection; } });
Object.defineProperty(exports, "ProgressType", { enumerable: true, get: function () { return connection_1.ProgressType; } });
Object.defineProperty(exports, "Trace", { enumerable: true, get: function () { return connection_1.Trace; } });
Object.defineProperty(exports, "TraceFormat", { enumerable: true, get: function () { return connection_1.TraceFormat; } });
Object.defineProperty(exports, "SetTraceNotification", { enumerable: true, get: function () { return connection_1.SetTraceNotification; } });
Object.defineProperty(exports, "LogTraceNotification", { enumerable: true, get: function () { return connection_1.LogTraceNotification; } });
Object.defineProperty(exports, "ConnectionErrors", { enumerable: true, get: function () { return connection_1.ConnectionErrors; } });
Object.defineProperty(exports, "ConnectionError", { enumerable: true, get: function () { return connection_1.ConnectionError; } });
Object.defineProperty(exports, "CancellationReceiverStrategy", { enumerable: true, get: function () { return connection_1.CancellationReceiverStrategy; } });
Object.defineProperty(exports, "CancellationSenderStrategy", { enumerable: true, get: function () { return connection_1.CancellationSenderStrategy; } });
Object.defineProperty(exports, "CancellationStrategy", { enumerable: true, get: function () { return connection_1.CancellationStrategy; } });
const ral_1 = require("./ral");
exports.RAL = ral_1.default;
//# sourceMappingURL=api.js.map