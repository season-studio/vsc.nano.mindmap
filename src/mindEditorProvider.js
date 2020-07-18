'use strict';
const vscode = require("vscode");
const mindDocument = require("./mindDocument");
const packageInfo = require("../package.json");

module.exports = class mindEditorProvider {

    static register(_context) {
        const provider = new mindEditorProvider(_context);
        _context.subscriptions.push(
            vscode.window.registerCustomEditorProvider(
                packageInfo.contributes.customEditors[0].viewType,
                provider,
                {
                    webviewOptions: {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    },
                supportsMultipleEditorsPerDocument: false,
                })
        );
    }

    constructor (_context) {
        this.context = _context;
        this._onDidChangeCustomDocument = new vscode.EventEmitter();
    }

    //#region Implementation of vscode.CustomEditorProvider

    get onDidChangeCustomDocument() {
        return this._onDidChangeCustomDocument.event;
    }

    openCustomDocument(uri) {
        const doc = mindDocument.acquire(uri);
        if (doc && doc.view) {
            doc.view.panel.reveal(doc.view.panel.viewColumn, false);
            return {uri: ""};
        } else {
            return doc;
        }
    }

	resolveCustomEditor(doc, panel) {
        if (doc instanceof mindDocument) {
            panel.webview.options = {
                enableScripts: true,
            };
            doc.acquireView(this.context, panel);
        }
	}

	saveCustomDocument(doc) {
        return new Promise(async (resolve) => {
            let inWait = false;
            if (doc instanceof mindDocument) {
                const notified = await doc.notify("save");
                if (notified) {
                    let listener = doc.onSavedEvent(() => {
                        resolve();
                        listener && listener.dispose();
                    });
                    inWait = true;
                }
            }
            inWait || resolve();
        });
	}

	saveCustomDocumentAs(doc, uri) {
		return new Promise(async (resolve) => {
            let inWait = false;
            if (doc instanceof mindDocument) {
                const notified = await doc.notify("saveAs", { filePath: uri.fsPath });
                if (notified) {
                    let listener = doc.onSavedEvent(() => {
                        resolve();
                        listener && listener.dispose();
                    });
                    inWait = true;
                }
            }
            inWait || resolve();
        });
	}

	revertCustomDocument() { }

	backupCustomDocument() { }
    //#endregion
}