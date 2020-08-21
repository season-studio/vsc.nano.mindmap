'use strict';
const vscode = require("vscode");
const fs = require("fs");
const WebView = require("./webview");
const lang = require("./lang/lang");

const docList = {};

module.exports = class mindDocument {

    static acquire(_uri) {
        const fsPath = _uri.fsPath;
        return docList[fsPath] || (docList[fsPath] = new mindDocument(_uri));
    }

    constructor(_uri) {
        this.panel = undefined;
        this.uri = _uri;
        this.savedEventEmitter = new vscode.EventEmitter();
    }

    get onSavedEvent() {
        return this.savedEventEmitter.event;
    }

    acquireView(_context, _panel) {
        if (!this.panel) {
            const panel = (this.panel = new WebView(_context, _panel));
            panel && panel.webview.onDidReceiveMessage(this.messageDispatcher, this, _context.subscriptions);
        }

        return this.panel;
    }

    dispose() {
        console.log("MindClose:", this.uri.fsPath);
        delete docList[this.uri.fsPath];
    }

    async notify(_notify, _param) {
        return this.panel && 
                await this.panel.webview.postMessage(Object.assign(
                    { $notify: _notify},
                    _param
                ));
    }

    //#region message dispatcher & handler

    /**
     * 收到消息的分发处理
     * @param {*} _msg 
     */
    messageDispatcher(_msg) {
        const fn = this[_msg.command];
        (typeof fn === "function") && fn.call(this, _msg);
    }

    /**
     * 受视图指定运行VSC的命令
     * @param {*} _msg 
     */
    exec(_msg) {
        (_msg.params instanceof Array) 
            ? vscode.commands.executeCommand.apply(vscode.commands, [_msg.id, ..._msg.params])
            : vscode.commands.executeCommand.call(vscode.commands, _msg.id);
    }

    /**
     * 加载当前文件
     */
    loadCurrentFile() {
        const filePath = this.uri.fsPath;
        if (filePath) {
            const buffer = fs.readFileSync(filePath, {encoding: null});
            this.panel.webview.postMessage({
                $return: "loadCurrentFile", 
                value: ((buffer.length <= 0) ? undefined : buffer.toString("base64"))
            });
        } else {
            this.panel.webview.postMessage({
                $return: "loadCurrentFile", 
                value: undefined
            });
        }
    }

    /**
     * 保存当前文件
     * @param {*} _msg 
     */
    saveCurrentFile(_msg) {
        let filePath = _msg.filePath || this.uri.fsPath;
        if (filePath) {
            const buffer = Buffer.from(_msg.value, "base64");
            fs.writeFileSync(filePath, buffer);
            this.savedEventEmitter.fire();
        }
    }

    async saveCurrentFileAs(_msg) {
        const fileUri = await vscode.window.showSaveDialog({
            filters: {
                [lang.get("xmind file")]: ['xmind']
            },
            canSelectMany: false
        });
        if (fileUri) {
            const filePath = fileUri.fsPath;
            const buffer = Buffer.from(_msg.value, _msg.encoding || "base64");
            fs.writeFileSync(filePath, buffer);
            this.panel.dispose();
            vscode.commands.executeCommand("vscode.open", fileUri);
        }
    }

    /**
     * 保存数据为文件
     * @param {*} _msg 
     */
    async saveToFile(_msg) {
        const fileUri = await vscode.window.showSaveDialog({
            filters: _msg.filter,
            canSelectMany: false
        });
        if (fileUri) {
            const filePath = fileUri.fsPath;
            const buffer = Buffer.from(_msg.value, _msg.encoding || "base64");
            fs.writeFileSync(filePath, buffer);
            _msg.openAfterSave && vscode.commands.executeCommand("vscode.open", fileUri, {viewColumn: vscode.ViewColumn.Beside});
        }
    }

    /**
     * 获取环境
     */
    getEnv() {
        this.panel.webview.postMessage({
            $return: "getEnv", 
            language: vscode.env.language,
            appRoot: vscode.env.appRoot,
            machineId: vscode.env.machineId,
            remoteName: vscode.env.remoteName,
            sessionId: vscode.env.sessionId,
            shell: vscode.env.shell,
            uriScheme: vscode.env.uriScheme,
            uiKind: String(vscode.env.uiKind)
        });
    }

    //#endregion
}