"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomCancellationStrategy = void 0;
const main_1 = require("../main");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto_1 = require("crypto");
class CustomCancellationToken {
    constructor(_cancellationName) {
        this._cancellationName = _cancellationName;
        this._isCancelled = false;
    }
    cancel() {
        if (!this._isCancelled) {
            this._isCancelled = true;
        }
    }
    get isCancellationRequested() {
        if (this._isCancelled) {
            return true;
        }
        if (this.pipeExists()) {
            this.cancel();
        }
        return this._isCancelled;
    }
    get onCancellationRequested() {
        return main_1.Event.None;
    }
    dispose() { }
    pipeExists() {
        try {
            fs.statSync(this._cancellationName);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
class CustomCancellationTokenSource {
    constructor(_cancellationName) {
        this._cancellationName = _cancellationName;
        this._token = new CustomCancellationToken(this._cancellationName);
    }
    get token() {
        return this._token;
    }
    cancel() {
        this._token.cancel();
    }
    dispose() {
        this._token.dispose();
    }
}
function getCancellationFilename(folder, id) {
    return path.join(folder, `cancellation-${String(id)}.tmp`);
}
function getReceiverStrategy(folder) {
    return {
        createCancellationTokenSource(id) {
            return new CustomCancellationTokenSource(getCancellationFilename(folder, id));
        }
    };
}
function getSenderStrategy(folder) {
    return {
        sendCancellation(_, id) {
            const file = getCancellationFilename(folder, id);
            try {
                if (!fs.existsSync(file)) {
                    fs.writeFileSync(file, '', { flag: 'w' });
                }
            }
            catch (e) {
                // noop
            }
        },
        cleanup(id) {
            try {
                fs.unlinkSync(getCancellationFilename(folder, id));
            }
            catch (e) {
                // noop
            }
        }
    };
}
function getCustomCancellationStrategy() {
    const cancellationFolder = path.join(os.tmpdir(), `jsonrpc-connection-tests`, crypto_1.randomBytes(21).toString('hex'));
    fs.mkdirSync(cancellationFolder, { recursive: true });
    return {
        receiver: getReceiverStrategy(cancellationFolder),
        sender: getSenderStrategy(cancellationFolder),
        dispose: () => {
            try {
                rimraf(cancellationFolder);
            }
            catch (e) { }
        }
    };
    function rimraf(location) {
        const stat = fs.lstatSync(location);
        if (stat) {
            if (stat.isDirectory() && !stat.isSymbolicLink()) {
                for (const dir of fs.readdirSync(location)) {
                    rimraf(path.join(location, dir));
                }
                fs.rmdirSync(location);
            }
            else {
                fs.unlinkSync(location);
            }
        }
    }
}
exports.getCustomCancellationStrategy = getCustomCancellationStrategy;
//# sourceMappingURL=customCancellationStrategy.js.map