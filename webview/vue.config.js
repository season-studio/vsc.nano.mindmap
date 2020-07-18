// vue.config.js
module.exports = {
    publicPath: ((process.argv.indexOf("--vscode") >= 0) ? "/$vscode/" : "./"),
    outputDir: ((process.argv.indexOf("--vscode") >= 0) ? "../.view" : "../../season-studio.github.io/nano-mindmap"),
    configureWebpack: {
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                    }
                }
            ]
        }
    }
}