/**
 * 该模块提供页面运行在不同宿主中时的功能适配处理
 */
import { utility } from "mind.svg.vue";

let host = undefined;

/**
 * 加载当前文件
 */
export function loadCurrentFile() {
    return host ? host.sendAndWait("loadCurrentFile").then(result => {
        if (result.value) {
            const buffer = Buffer.from(result.value, "base64");
            const blob = new Blob([buffer]);
            return blob;
        } else {
            return undefined;
        }
    }) : new Promise(r => r(undefined));
}

/**
 * 保存文件
 * @param {Blob} _blob 文件数据的Blob
 * @param {*} _params 参数对象, 可不传
 */
export function saveFile(_blob, _params) {
    if (host) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const buffer = Buffer.from(event.target.result);
            host.send("saveCurrentFile", Object.assign({ value: buffer.toString("base64") }, _params));
        };
        reader.readAsArrayBuffer(_blob);
    } else {
        const url = URL.createObjectURL(_blob);
        utility.dynInvokeLink(url, {download: "*.xmind"});
        URL.revokeObjectURL(url);
    }
}

/**
 * 将文件另存为其他文件
 * @param {Blob} _blob 文件数据的Blob对象
 */
export function saveFileAs(_blob) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const buffer = Buffer.from(event.target.result);
        host.send("saveCurrentFileAs", { value: buffer.toString("base64") });
    };
    reader.readAsArrayBuffer(_blob);
}

/**
 * 将内容存储未一个文件
 * @param {Blob} _blob 文件内容的Blob对象
 * @param {String} _filterName 要存储的文件的类型说明
 * @param {String} _filter 要存储的文件的扩展名
 * @param {Boolean} _show true表示保存完文件通知宿主打开这个文件
 */
export function saveToFile(_blob, _filterName, _filter, _show) {
    if (host) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const buffer = Buffer.from(event.target.result);
            host.send("saveToFile", { 
                filter: { [_filterName]: [_filter] },
                value: buffer.toString("base64"),
                openAfterSave: _show
            });
        };
        reader.readAsArrayBuffer(_blob);
    } else {
        const url = URL.createObjectURL(_blob);
        utility.dynInvokeLink(url, {download: `*.${_filter}`});
        URL.revokeObjectURL(url);
    }
}

/**
 * 新建导图文件
 */
export function newFile() {
    host ? host.send("exec", { id: "vsc-nano-mindmap.newMindMap" })
         : window.open(location.href)
}

/**
 * 打开导图文件
 */
export function openFile() {
    if (host) {
        host.send("exec", { id: "vsc-nano-mindmap.openMindMap" });
        return new Promise(r => r(undefined));
    } else {
        return utility.pickFile(".xmind");
    }
}

/**
 * 检查是否有VSCode这样的专用宿主存在
 */
export function noSpecialHost() {
    return (host == undefined);
}

/**
 * 设置宿主对象
 * @param {*} _host 宿主对象
 */
export function setHost(_host) {
    host = _host;
}