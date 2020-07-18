const DEFAULT_TIMEOUT = 6000;

/**
 * 收到宿主发来的处理结果的消息时的处理函数
 * @param {*} _event 
 */
function procResultMessage(_event) {
    this.timerID && (clearTimeout(this.timerID), this.timerID = undefined);
    window.removeEventListener(this.event, this.fn);
    this.resolve(_event.detail);
}

/**
 * 等待宿主消息超时后的处理函数
 * @param {*} item 
 */
function waitTimeout(item) {
    window.removeEventListener(item.event, item.fn);
    item.timerID = undefined;
    item.reject();
}

/**
 * VSCode宿主基本功能封装类
 */
export default class VSCodeHost {
    constructor (_host) {
        this.host = _host;
        window.addEventListener('message', this.onMessage.bind(this));
    }

    /**
     * 收到宿主的消息时的统一分发函数
     * @param {*} _event 
     */
    onMessage(_event) {
        const message = _event.data;
        if (message.$return) {
            let customEvent = new CustomEvent(`vscode.${message.$return}`, { detail: message });
            window.dispatchEvent(customEvent);
        } else if (message.$notify) {
            let customEvent = new CustomEvent(`vscode.notify.${message.$notify}`, { detail: message });
            window.dispatchEvent(customEvent);
        }
    }

    /**
     * 向VSCode宿主发送命令
     * @param {String} _cmd 命令
     * @param {Object} _param 命令配套的参数
     */
    send(_cmd, _param) {
        this.host.postMessage(Object.assign({command:_cmd}, _param));
    }

    /**
     * 启动等待宿主的结果应答
     * @param {String} _type 应答的类型名称
     * @param {Number} _timeout 等待超时时间, 可不传
     */
    waitResult(_type, _timeout) {
        return new Promise((resolve, reject) => {
            let event = `vscode.${_type}`;
            let thisArg = { event, resolve, reject };
            let fn = procResultMessage.bind(thisArg);
            thisArg.fn = fn;
            thisArg.timerID = setTimeout(waitTimeout, _timeout || DEFAULT_TIMEOUT, thisArg);
            window.addEventListener(event, fn, { once: true });
        });
    }

    /**
     * 向宿主发送命令, 并等待结果应答
     * @param {String} _cmd 发送的命令以及等待的结果类型名
     * @param {Object} _param 发送命令附带的参数
     * @param {Number} _timeout 超时时间, 可不传
     */
    sendAndWait(_cmd, _param, _timeout) {
        return new Promise((resolve, reject) => {
            let event = `vscode.${_cmd}`;
            let thisArg = { event, resolve, reject };
            let fn = procResultMessage.bind(thisArg);
            thisArg.fn = fn;
            thisArg.timerID = setTimeout(waitTimeout, _timeout || DEFAULT_TIMEOUT, thisArg);
            window.addEventListener(event, fn, { once: true });
            this.send(_cmd, _param);
        });
    }
}