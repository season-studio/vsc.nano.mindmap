const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const packageInfo = require("../package.json");

/**
 * MindMap核心视图调用
 */
module.exports = function prepareWebView(_context, _panel) {

    // 创建面板
    const panel = (_panel || vscode.window.createWebviewPanel(
        packageInfo.name,
        packageInfo.displayName,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    ));

    if (panel) {
        // 获取资源路径
        const webPagePath = vscode.Uri.file(
            path.join(_context.extensionPath, '.view', 'index.html')
        );
        const resourcePath = panel.webview.asWebviewUri(vscode.Uri.file(
            path.join(_context.extensionPath, '.view/')
        )).toString();

        // 获取页面内容，并对路径进行修正
        const pageOriginContent = (process.platform === 'win32'
                                    ? fs.readFileSync(webPagePath.path.slice(1)).toString()
                                    : fs.readFileSync(webPagePath.path).toString());
        const pageContent = pageOriginContent.replace(/\/\$vscode\//g, resourcePath);

        // 显示页面内容
        panel.webview.html = pageContent;
    }

    return panel;
}
