const vscode = require("vscode");
const lang = require("./lang/lang");

class Commands {
    constructor (context) {
        this.context = context;
    }

    async newMindMap() {
        const fileUri = await vscode.window.showSaveDialog({
            filters: {
                [lang.get("xmind file")]: ['xmind']
            },
            canSelectMany: false
        });
        if (fileUri) {
            await vscode.workspace.fs.writeFile(fileUri, new Uint8Array(0));
            vscode.commands.executeCommand("vscode.open", fileUri);
        }
    }

    async openMindMap() {
        const result = await vscode.window.showOpenDialog({
            filters: {
                [lang.get("xmind file")]: ['xmind']
            },
            canSelectMany: false
        });
        if (result && result.length > 0) {
            vscode.commands.executeCommand("vscode.open", result[0]);
        }
    }
}

module.exports = Commands;