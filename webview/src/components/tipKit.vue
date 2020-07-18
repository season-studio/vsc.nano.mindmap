<style>
    .nano-tip-bg-box {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        margin: 6px;
        background-color: transparent;
        border: 0px;
        z-index: 999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Chrome/Safari/Opera */
        -khtml-user-select: none; /* Konqueror */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently not supported by any browser */
    }

    .nano-tip-content-box {
        padding: 6px;
        margin: 3px 0px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
        box-shadow: 0px 3px 6px rgba(128, 128, 128, 0.9);
        border: 0px;
        color: #333;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .nano-tip-icon {
        width: 16px;
        height: 16px;
        margin: 0px 6px 0px 0px;
    }

    .nano-tip-icon-flag {
        fill: #fff;
        stroke: #fff;
        stroke-width: 1.5;
    }

    .nano-confirm-dlg-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0px;
        padding: 0px;
        background-color: rgba(128, 128, 128, 0.6);
        border: 0px;
        z-index: 999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Chrome/Safari/Opera */
        -khtml-user-select: none; /* Konqueror */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently not supported by any browser */
    }

    .nano-confirm-dlg {
        padding: 6px;
        margin: 0px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
        box-shadow: 0px 3px 6px rgba(128, 128, 128, 0.9);
        border: 0px;
        color: #333;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .nano-confirm-dlg-content {
        margin: 3px 0px;
        padding: 0px;
        border: 0px;
        background-color: transparent;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        min-width: 170px;
        min-height: 57px;
    }

    .nano-confirm-dlg-buttons-bar {
        margin: 3px 0px;
        padding: 0px;
        border: 0px;
        background-color: transparent;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        width: 100%;
    }

    .nano-confirm-dlg-button {
        border: 1px solid #ccc;
        border-radius: 3px;
        background: linear-gradient(to top, rgba(226, 226, 226, 0.5) 26%,rgba(246, 246, 246, 0.5) 90%,rgba(255, 255, 255, 0.9) 100%);
        color: #333;
        outline: none;
        font-size: 13px;
        padding: 6px;
        margin: 0px 0px 0px 3px;
        min-width: 66px;
    }

    .nano-confirm-dlg-button:hover {
        border-color: #09f;
        background: linear-gradient(to top, rgba(0, 117, 255, 0.9) 26%,rgba(0, 157, 255, 0.9) 90%,rgba(0, 170, 255, 0.9) 100%);
        color: #fff;
    }

    .nano-confirm-dlg-button:active {
        border-color: #09f;
        background: linear-gradient(to top, rgba(0, 170, 255, 0.9) 26%,rgba(0, 157, 255, 0.9) 90%,rgba(0, 117, 255, 0.9) 100%);
        color: #fff;
    }

</style>

<script>
import { translate } from "mind.svg.vue";

export default {
    render() {
        return "";
    }
}

/**
 * 确认对话框类
 */
class ConfirmDlg {
    constructor (_msg, _opt, _resolve, _reject) {
        try {
            _opt || (_opt = {});
            _opt.buttons || (_opt.buttons = [translate.get("OK"), translate.get("CANCEL")]);
            if (document.querySelector("div.nano-confirm-dlg-bg")) {
                _reject("Another confirm dialog is still running!");
            } else {
                // Promise方法记录
                this.resolve = _resolve;
                this.reject = _reject;
                // 背景遮罩
                const dlgBg = (this.rootElement = document.createElement("div"));
                dlgBg.setAttribute("class", "nano-confirm-dlg-bg");
                dlgBg.addEventListener("mousedown", (e) => {e.stopPropagation(), e.preventDefault()});
                dlgBg.addEventListener("keydown", (e) => {e.stopPropagation(), e.preventDefault()});
                dlgBg.addEventListener("touchstart", (e) => {e.stopPropagation(), e.preventDefault()});
                // 对话框主体
                const dlg = document.createElement("div");
                dlg.setAttribute("class", _opt.class ? `nano-confirm-dlg ${_opt.class}` : "nano-confirm-dlg");
                _opt.style && dlg.setAttribute("style", _opt.style);
                dlgBg.appendChild(dlg);
                // 对话框内容
                const content = document.createElement("div");
                content.setAttribute("class", "nano-confirm-dlg-content");
                _msg && content.appendChild(document.createTextNode(_msg));
                _opt.html && content.insertAdjacentHTML("beforeend", _opt.html);
                dlg.appendChild(content);
                // 对话框按钮
                const buttonsBar = document.createElement("div");
                buttonsBar.setAttribute("class", "nano-confirm-dlg-buttons-bar");
                dlg.appendChild(buttonsBar);
                this.buttons = [];
                for (const idx in _opt.buttons) {
                    const button = document.createElement("button");
                    button.setAttribute("class", "nano-confirm-dlg-button");
                    button.appendChild(document.createTextNode(_opt.buttons[idx]));
                    button.addEventListener("click", () => this.onClick(idx));
                    buttonsBar.appendChild(button);
                    this.buttons.push(button);
                }
                // 超时自动化响应
                if ((_opt.timeout > 0) && (_opt.default >= 0) && (_opt.default < this.buttons.length)) {
                    this.timeout = _opt.timeout;
                    const defaultButton = this.buttons[_opt.default];
                    const timeoutUnit = translate.get("S");
                    defaultButton.appendChild(document.createTextNode(`(${parseInt((this.timeout + 999)/1000)}${timeoutUnit})`));
                    this.timer = setInterval(() => this.onTimer(_opt.default, defaultButton, _opt.buttons[_opt.default], timeoutUnit), 1000);
                }
                // 生效
                const body = document.querySelector("body");
                body.appendChild(dlgBg);
            }
        } catch (_err) {
            _reject(_err);
        }
    }

    onClick(_index) {
        (typeof this.resolve === "function") && this.resolve(parseInt(_index));
        this.timer && (clearInterval(this.timer), this.timer = undefined);
        this.rootElement && (this.rootElement.remove(), this.rootElement = undefined);
    }

    onTimer(_index, _button, _text, _unit) {
        this.timeout -= 1000;
        if (this.timeout > 0) {
            _button.innerHTML = `${_text}(${parseInt((this.timeout + 999)/1000)}${_unit})`;
        } else {
            this.onClick(_index);
        }
    }
}

/**
 * 提示框类
 */
class TipBox {
    constructor (_msg, _icon, _opt) {
        _opt || (_opt = {});
        const body = document.querySelector("body");
        if (!(this.bgDiv = document.querySelector("div.nano-tip-bg-box"))) {
            this.bgDiv = document.createElement("div");
            this.bgDiv.setAttribute("class", "nano-tip-bg-box");
            body.appendChild(this.bgDiv);
        }
        const contentDiv = (this.contentDiv = document.createElement("div"));
        contentDiv.setAttribute("class", _opt.class ? `nano-tip-content-box ${_opt.class}` : "nano-tip-content-box");
        _icon && contentDiv.insertAdjacentHTML("afterbegin", _icon);
        _msg &&contentDiv.appendChild(document.createTextNode(_msg));
        _opt.style && contentDiv.setAttribute("style", _opt.style);
        _opt.html && contentDiv.insertAdjacentHTML("beforeend", _opt.html);
        this.bgDiv.appendChild(contentDiv);
        (_opt.timeout > 0) && (this.timer = setTimeout(() => {
            this.close()
        }, _opt.timeout));
    }

    close() {
        this.contentDiv && (this.contentDiv.remove(), this.contentDiv = undefined);
        this.timer && (clearTimeout(this.timer), this.timer = undefined);
        this.bgDiv && (this.bgDiv.children.length <= 0) && this.bgDiv.remove();
        this.bgDiv = undefined;
    }
}

/**
 * 显示自定义提示
 * @param {string} _msg 提示文本
 * @param {string} _icon 图标元素的HTML
 * @param {object} _opt 选项，包括: timeout超时自动关闭的时间, class自定义内容风格类, style自定义内容风格, html自定义html内容
 */
function showTip(_msg, _icon, _opt) {
    _opt || (_opt = {timeout: 3000});
    return new TipBox(_msg, _icon, _opt);
}

const tip = {
    /**
     * 显示完全自定义消息
     */
    custom: showTip,
    /**
     * 显示提示信息
     * @param {string} _msg 提示文本
     * @param {object} _opt 选项，包括: timeout超时自动关闭的时间, class自定义内容风格类, style自定义内容风格, html自定义html内容
     */
    info(_message, _opt) {
        return showTip(_message, 
        `<svg class="nano-tip-icon">
            <circle cx="8" cy="8" r="8" stroke="none" fill="#09f"/>
            <path class="nano-tip-icon-flag" d="M6 7L8 6V13V7M6 13H10M8 2V4" />
        </svg>`, 
        _opt);
    },
    /**
     * 显示警告信息
     * @param {string} _msg 提示文本
     * @param {object} _opt 选项，包括: timeout超时自动关闭的时间, class自定义内容风格类, style自定义内容风格, html自定义html内容
     */
    warn(_message, _opt) {
        return showTip(_message, 
        `<svg class="nano-tip-icon">
            <circle cx="8" cy="8" r="8" stroke="none" fill="#fa0"/>
            <path class="nano-tip-icon-flag" d="M8 10L7.5 2.5H8.5L8 10M8 12V14" />
        </svg>`, 
        _opt);
    },
    /**
     * 显示错误信息
     * @param {string} _msg 提示文本
     * @param {object} _opt 选项，包括: timeout超时自动关闭的时间, class自定义内容风格类, style自定义内容风格, html自定义html内容
     */
    error(_message, _opt) {
        return showTip(_message, 
        `<svg class="nano-tip-icon">
            <circle cx="8" cy="8" r="8" stroke="none" fill="#f00"/>
            <path class="nano-tip-icon-flag" d="M4 4L12 12M12 4L4 12" />
        </svg>`, 
        _opt);
    },
    /**
     * 确认对话框
     * @param {string} _msg 提示文本
     * @param {object} _opt 选项，包括: timeout超时自动关闭的时间, class自定义内容风格类, style自定义内容风格, html自定义html内容, default超时生效时的默认按钮编号, buttons由按钮文字组成的数组
     */
    confirm(_message, _opt) {
        return new Promise((_resolve, _reject) => new ConfirmDlg(_message, _opt, _resolve, _reject));
    }
};

export function registry(_vue) {
    _vue.prototype.$tip = tip;
}
</script>