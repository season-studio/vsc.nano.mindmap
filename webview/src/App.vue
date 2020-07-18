<template>
    <div class="main">
        <mind-svg-view ref="mindView" view-class="mind-view-class" 
            :mind-config="{draggable: true}" attachment-path="resources"
            :show-edit-tools="!showMenuContent"
            @focus-topic-changed="onFocusTopicChanged"
            @blur-float-panel="onBlurFloatPanel"
            @history-changed="onHistoryChanged"
            :key-action-map="{
                    'ctrl+alt+n': onNewWorkBook, 
                    'ctrl+o': onOpen,
                    'ctrl+s': onSave,
                    'ctrl+down': 'addSubTopic', 
                    'ctrl+right': 'addSiblingTopic',
                    'up': 'selectParent',
                    'down': 'selectChild',
                    'left': 'selectPreviousSibling',
                    'right': 'selectNextSibling',
                    'enter': 'editTopic',
                    'delete': 'deleteTopic',
                    'ctrl+z': onUndo,
                    'ctrl+y': onRedo,
                    'f3': onStartSearch
            }" />
        <floatToolbar ref="toolbar" @handler-click="showMenuContent = !showMenuContent" :show-content="showMenuContent" 
            :items="menuContent">
            <div class="mind-input-panel" v-if="requestInput">
                <span>{{_T(requestInput.caption)}}</span>
                <input :placeholder="_T(requestInput.tip)" v-model="requestInput.value" @keydown.enter.stop="onInputConfirm" @keydown.esc.stop="onInputCancel" />
                <button class="mind-input-button" @click="onInputConfirm">{{_T("Confirm")}}</button>
                <button class="mind-input-button" @click="onInputCancel">{{_T("Cancel")}}</button>
            </div>
            <div class="mind-input-panel" v-if="requestSearch">
                <span>{{_T('search:')}}</span>
                <input :placeholder="_T('Input search information')" v-model="requestSearch.value" @input="onSearchInputChange"  @keydown.enter.stop="onSearchNext" @keydown.esc.stop="onSearchCancel" />
                <button class="mind-input-button" @click="onSearchNext">{{_T("Next")}}</button>
                <button class="mind-input-button" @click="onSearchPrev">{{_T("Prev")}}</button>
                <button class="mind-input-button" @click="onSearchCancel">{{_T("Cancel")}}</button>
            </div>
        </floatToolbar>
    </div>
</template>

<style>
    .main {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin: 0px;
        padding: 0px;
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        background-color: #fff;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Chrome/Safari/Opera */
        -khtml-user-select: none; /* Konqueror */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently not supported by any browser */
    }

    .mind-view-class {
        position: absolute !important;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        border: 0px;
    }

    .mind-input-panel {
        position: absolute;
        padding: 6px;
        border: 0px;
        margin: 6px 0px 0px 0px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
        box-shadow: 0px 0px 6px rgba(128, 128, 128, 0.6);
        top: 100%;
        left: 0px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
    }

    .mind-input-panel input {
        outline: none;
        font-size: 13px;
    }

    .mind-input-panel span {
        padding: 0px 6px 0px 0px;
    }

    .mind-input-button {
        border: 1px solid #ccc;
        border-radius: 3px;
        background: linear-gradient(to top, rgba(226, 226, 226, 0.5) 26%,rgba(246, 246, 246, 0.5) 90%,rgba(255, 255, 255, 0.9) 100%);
        color: #333;
        outline: none;
        font-size: 13px;
        margin: 0px 0px 0px 3px;
    }

    .mind-input-button:hover {
        border-color: #09f;
        background: linear-gradient(to top, rgba(0, 117, 255, 0.9) 26%,rgba(0, 157, 255, 0.9) 90%,rgba(0, 170, 255, 0.9) 100%);
        color: #fff;
    }

    .mind-input-button:active {
        border-color: #09f;
        background: linear-gradient(to top, rgba(0, 170, 255, 0.9) 26%,rgba(0, 157, 255, 0.9) 90%,rgba(0, 117, 255, 0.9) 100%);
        color: #fff;
    }

    .mind-input-button-prime {
        border-color: #09f;
        color: #09f;
    }

    .mind-input-button-danger {
        border-color: #f00;
        color: #f00;
    }

    .mind-input-button-danger:hover {
        border-color: #f00;
        background: linear-gradient(to top, rgba(217, 0, 0, 0.9) 26%,rgba(255, 0, 0, 0.9) 90%,rgba(255, 117, 117, 0.9) 100%);
    }

    .mind-input-button-danger:active {
        border-color: #f00;
        background: linear-gradient(to top, rgba(255, 117, 117, 0.9) 26%,rgba(255, 0, 0, 0.9) 90%,rgba(217, 0, 0, 0.9) 100%);
    }

</style>

<script>
    import { Constants } from "mind.svg.js";
    import { translate, utility } from "mind.svg.vue";
    import floatToolbar from "./components/floatToolbar";
    import * as xmind from "./js/xmind";
    import * as fileFormat from "./js/fileFormator";
    import toolsInfo from "./js/toolsInfo";
    import * as hostAdapter from "./js/hostAdapter";

    export default {
        name: 'App',
        components: {
            floatToolbar
        },
        data() {
            return {
                showMenuContent: true,
                mind: undefined,
                currentPage: undefined,
                menuContent: toolsInfo.call(this),
                requestInput: undefined,
                requestSearch: undefined
            }
        },
        methods: {
            _T: translate.get.bind(translate),
            /**
             * 整理页面列表
             */
            pickPageList() {
                const listMenu = this.menuContent[1].subItems;
                listMenu.splice(3);
                const mind = this.mind;
                if (mind) {
                    (mind.length > 0) && listMenu.push({separate:true});
                    for (const index in mind) {
                        const page = mind[index];
                        listMenu.push({
                            pageID: page.id,
                            caption: page.title,
                            fn: () => { this.onSwitchPage(index) }
                        });
                    }
                }
            },
            /**
             * 识别并标记菜单中的编辑按钮是否可用
             */
            markMenuEditable(_topic) {
                for (let i = this.menuContent.length - 3; i >=7 ; i--) {
                    if (_topic) {
                        this.menuContent[i].disable = (false || (this.menuContent[i].notForRoot && (_topic.level <= 0)));
                    } else {
                        this.menuContent[i].disable = true;
                    }
                }
                this.$refs.toolbar.$forceUpdate();
            },
            /**
             * 保存当前页面的内容到文档缓存中
             */
            saveCurrentPage() {
                if (this.currentPage) {
                    this.currentPage.topic = this.$refs.mindView.mind.data;
                }
            },
            /**
             * 加载附件
             */
            loadAttachments(_attachmentIterator) {
                const attachments = this.$refs.mindView.attachments;
                attachments.clear();
                for (const item of _attachmentIterator) {
                    attachments.item(item.path, item.value);
                }
            },
            /**
             * 清理所有没有被用到的附件
             */
            cleanAttachments(_xmind) {
                _xmind || (_xmind = xmind.createEmpty());
                const attachments = this.$refs.mindView.attachments;
                for (const {topic} of fileFormat.getTopicIteratorFromMinds(this.mind)) {
                    let attachmentItem = undefined;
                    let attachPath = undefined;
                    if (topic.image && String(topic.image.src).startsWith(Constants.ATTACHMENT_LINK_PREFIX)) {
                        attachPath = String(topic.image.src).substr(Constants.ATTACHMENT_LINK_PREFIX.length);
                    }
                    if (topic.href && String(topic.href).startsWith(Constants.ATTACHMENT_LINK_PREFIX)) {
                        attachPath = String(topic.href).substr(Constants.ATTACHMENT_LINK_PREFIX.length);
                    }
                    attachPath && (attachmentItem = attachments.item(attachPath)) && _xmind.setAttachment(attachPath, attachmentItem.data);
                }
                this.loadAttachments(_xmind.attachmentInterator());
                return _xmind;
            },
            /**
             * 响应新建导图文件的菜单命令
             */
            onNewWorkBook() {
                hostAdapter.newFile();
            },
            /**
             * 响应新建页面的菜单命令
             */
            onNewPage() {
                this.saveCurrentPage();
                if (this.mind) {
                    const id = Date.now().toString(16);
                    const page = (this.currentPage = {
                        id,
                        title: `${translate.get("page")}-${id}`,
                        topic: {
                            title: translate.get("Center Topic")
                        }
                    });
                    this.mind.push(page);
                    this.pickPageList();
                    this.loadPage(page);
                }
            },
            /**
             * 响应重命名页面的菜单命令
             */
            onRenamePage() {
                this.closeAllPanel();
                this.showInputPanel("Rename Page:", "Input page name", this.currentPage && this.currentPage.title, (_name) => {
                    _name = String(_name).trim();
                    if (_name) {
                        this.saveCurrentPage();
                        if (this.currentPage && _name) {
                            this.currentPage.title = _name;
                            this.pickPageList();
                            this.loadPage(this.currentPage);
                        }
                    } else {
                        this.$tip.error(translate.get("Can not rename a page as empty title!"));
                    }
                });
            },
            /**
             * 响应删除页面的菜单命令
             */
            async onDeletePage() {
                const confirm = await this.$tip.confirm(undefined, {
                    html: `${translate.get("The deleted page can not be restored!")}<br/>${translate.get("Are you sure to continue?")}`
                });
                if ((confirm === 0) && this.currentPage && this.mind) {
                    const title = this.currentPage.title;
                    let index = this.mind.indexOf(this.currentPage);
                    if (index >= 0) {
                        this.mind.splice(index, 1);
                    }
                    this.pickPageList();
                    if (this.mind.length <= 0) {
                        this.onNewPage();
                    } else {
                        (index >= this.mind.length) && (index -= 1);
                        this.onSwitchPage(index);
                    }
                    this.$forceUpdate();
                    this.$tip.info(`[${title}] ` + translate.get("has been deleted!"));
                }
            },
            /**
             * 响应打开导图文件的菜单命令
             */
            async onOpen() {
                const file = await hostAdapter.openFile();
                if (file) {
                    const confirm = await this.$tip.confirm(undefined, {
                        html: `${translate.get("Open a mindmap file will cover the current mindmap if it has not been saved.")}<br/>${translate.get("Are you sure to continue?")}`
                    });
                    if (confirm === 0) {
                    const xmindfile = await xmind.load(file);
                    const mind = (this.mind = fileFormat.fromXMind(xmindfile));
                    this.loadAttachments(xmindfile.attachmentInterator());
                    this.pickPageList();
                    this.loadPage(mind[0]);
                    }
                }
            },
            /**
             * 响应保存当前导图文件的菜单命令
             */
            async onSave() {
                this.saveCurrentPage();
                const xmindFile = this.cleanAttachments();
                fileFormat.toXMind(this.mind, xmindFile);
                const file = await xmind.save(xmindFile);
                if (file) {
                    hostAdapter.saveFile(file);
                }
            },
            /**
             * 响应从UI工具栏触发将当前导图另存为其他文件的命令
             */
            async onSaveAs() {
                this.saveCurrentPage();
                const xmindFile = this.cleanAttachments();
                fileFormat.toXMind(this.mind, xmindFile);
                const file = await xmind.save(xmindFile);
                if (file) {
                    hostAdapter.saveFileAs(file);
                }
            },
            /**
             * 响应从VSCode的菜单触发的将当前导图另存为其他文件的命令
             */
            async onSaveAsInvokeByHost(_event) {
                this.saveCurrentPage();
                const xmindFile = this.cleanAttachments();
                fileFormat.toXMind(this.mind, xmindFile);
                const file = await xmind.save(xmindFile);
                if (file) {
                    hostAdapter.saveFile(file, {filePath: _event.detail.filePath});
                }
            },
            /**
             * 响应导图KM文件为页面的菜单命令
             */
            async onImportKM() {
                const file = await utility.pickFile(".km");
                if (file) {
                    const page = await fileFormat.importKittyMind(file);
                    if (page) {
                        this.mind.push(page);
                        this.pickPageList();
                        this.loadPage(page);
                    }
                }
            },
            /**
             * 响应导出当前页面为KM文件的菜单命令
             */
            onExportKM() {
                this.saveCurrentPage();
                if (this.currentPage) {
                    const blob = fileFormat.exportKittyMind(this.currentPage);
                    hostAdapter.saveToFile(blob, translate.get("Kitty Mind(*.km)"), "km", false);
                }
            },
            /**
             * 响应导出当前页面为MD文件的菜单命令
             */
            onExportMarkdown() {
                const content = [];
                const attachment = []; 
                const imageTip = translate.get("Image of topic");
                const linkTip = translate.get("Link to reference");
                const attachments = this.$refs.mindView.attachments;
                let attachmentTick = 0;
                let promise = new Promise(r => r());
                this.saveCurrentPage();
                for (const {level, topic} of fileFormat.getTopicIteratorFromMinds(this.mind)) {
                    content.push(`${"#".repeat(level + 1)} ${topic.title}`);
                    if (topic.notes) {
                        content.push(String(topic.notes).trim());
                    }
                    if (topic.href) {
                        (!String(topic.href).startsWith(Constants.ATTACHMENT_LINK_PREFIX)) 
                            && content.push(`[${linkTip}](${topic.href})`);
                    }
                    if (topic.labels || topic.markers) {
                        content.push("```");
                        if (topic.labels instanceof Array) {
                            content.push(topic.labels.join(" "));
                        }
                        if (topic.markers) {
                            for (const markerID in topic.markers) {
                                const markerValue = topic.markers[markerID];
                                content.push(`${translate.get(markerID)}: ${translate.get(markerValue)}`);
                            }
                        }
                        content.push("```");
                    }
                    if (topic.image) {
                        if (String(topic.image.src).startsWith(Constants.ATTACHMENT_LINK_PREFIX)) {
                            const imageID = `image${attachmentTick++}`;
                            content.push(`![${imageTip}][${imageID}]`);
                            const attachPath = String(topic.image.src).substr(Constants.ATTACHMENT_LINK_PREFIX.length);
                            promise = promise.then(() => new Promise(resolve => {
                                let mime = attachPath.toLowerCase();
                                mime = mime.endsWith(".png") ? "image/png;" : (mime.endsWith(".gif") ? "image/gif;" : (mime.endsWith(".ico") ? "image/x-icon;" : "image/jpeg;"));
                                const blob = attachments.item(attachPath).data;
                                const reader = new FileReader();
                                reader.onload = (e) => attachment.push(`[${imageID}]:${String(e.target.result).replace("application/octet-stream;", mime)}`);
                                reader.onloadend = () => resolve();
                                reader.readAsDataURL(blob);
                            }));
                        } else {
                            content.push(`![${imageTip}](${topic.image.src} "${imageTip}")`);
                        }
                    }
                }
                promise.finally(() => {
                    const mdBlob = new Blob([`${content.join("\r\n\r\n")}\r\n\r\n${attachment.join("\r\n\r\n")}`]);
                    hostAdapter.saveToFile(mdBlob, translate.get("Markdown File(*.md)"), "md", true);
                });
            },
            /**
             * 当焦点主题发生变化的时候更新菜单中编辑项的可用性
             */
            onFocusTopicChanged(_topic) {
                this.markMenuEditable(_topic);
            },
            /**
             * 当视图要求关闭所有浮动面板时, 对自定义的浮动面板进行关闭处理
             */
            onBlurFloatPanel() {
                this.closeInputPanel();
            },
            /**
             * 当编辑历史发生变化的时候, 更新UNDO/REDO按钮的可用性
             */
            onHistoryChanged(_count) {
                this.menuContent[3].disable = (_count.undo <= 0);
                this.menuContent[4].disable = (_count.redo <= 0);
                this.$refs.toolbar.$forceUpdate();
            },
            /**
             * 响应切换页面的菜单命令
             * @param {Number} _index 页面在页面集合中的索引号
             */
            onSwitchPage(_index) {
                const mind = this.mind;
                this.saveCurrentPage();
                mind && (mind.length > _index) && (_index >= 0) && this.loadPage(mind[_index]);
            },
            /**
             * 响应撤销前一编辑动作的菜单命令
             */
            onUndo() {
                this.$refs.mindView.history.undo();
                this.onHistoryChanged(this.$refs.mindView.history.count);
            },
            /**
             * 响应重做被撤销的编辑动作的菜单命令
             */
            onRedo() {
                this.$refs.mindView.history.redo();
                this.onHistoryChanged(this.$refs.mindView.history.count);
            },
            /**
             * 载入一个具体的页面
             * @param {Object} _page 页面对象
             */
            loadPage(_page) {
                if (_page) {
                    this.currentPage = _page;
                    this.cleanAttachments();
                    this.$refs.mindView.showMind(_page.topic);
                    this.closeAllPanel();
                    const listMenu = this.menuContent[1].subItems;
                    const pageCount = listMenu.length;
                    for (let index = 4; index < pageCount; index++) {
                        listMenu[index].style = ((listMenu[index].pageID === _page.id) ? {
                            fontWeight: "800",
                        } : undefined);
                    }
                    this.markMenuEditable();
                    this.$forceUpdate();
                }
            },
            /**
             * 执行视图组件的内置命令
             */
            execCmd(_cmd) {
                const fn = this.$refs.mindView[_cmd];
                (typeof fn === "function") && fn();
            },
            /**
             * 调用属性编辑器
             * @param {String} _id 属性ID名，比如labels、notes等
             */
            invokePropertyEditor(_id) {
                const view = this.$refs.mindView;
                view && (view.blurFloatPanel(), view.invokePropertyEditor(_id));
            },
            /**
             * 关闭所有面板（不仅关闭视图的浮动面板，也关闭查找对话框等不影响编辑和布局的自定义面板）
             */
            closeAllPanel() {
                this.$refs.mindView.blurFloatPanel();
                this.requestSearch = undefined;
            },
            /**
             * 显示输入信息面板
             */
            showInputPanel(_caption, _tip, _value, _fnConfirm, _fnCancel) {
                this.requestInput = {
                    caption: _caption,
                    tip: _tip, 
                    value: _value,
                    confirm: _fnConfirm,
                    cancel: _fnCancel
                }
            },
            /**
             * 关闭输入面板
             */
            closeInputPanel() {
                this.requestInput = undefined;
            },
            /**
             * 输入面板中的输入信息被确认提交
             */
            onInputConfirm() {
                const requestInput = this.requestInput;
                this.requestInput = undefined;
                if (requestInput) {
                    const fn = requestInput.confirm;
                    (typeof fn === "function") && fn(requestInput.value);
                }
            },
            /**
             * 取消输入面板中的输入动作
             */
            onInputCancel() {
                const requestInput = this.requestInput;
                this.requestInput = undefined;
                if (requestInput) {
                    const fn = requestInput.cancel;
                    (typeof fn === "function") && fn(requestInput.value);
                }
            },
            /**
             * 响应启动查找主题项的菜单命令
             */
            onStartSearch() {
                this.closeAllPanel();
                this.requestSearch = {
                    value: "",
                    iterator: undefined,
                    record: []
                };
            },
            /**
             * 响应查找下一个主题项的命令
             */
            onSearchNext() {
                const requestSearch = this.requestSearch;
                if (requestSearch && requestSearch.value) {
                    requestSearch.iterator || (requestSearch.iterator = this.$refs.mindView.mind.getTopicIterator(), requestSearch.record = []);
                    let current;
                    let found = false;
                    while (!found && !(current = requestSearch.iterator.next()).done) {
                        const data = current.value.topicData();
                        for (const itemName in data) {
                            if (String(data[itemName]).match(requestSearch.value)) {
                                found = true;
                                break;
                            }
                        }
                    }
                    if (found) {
                        const topic = current.value;
                        requestSearch.record.push(topic);
                        topic.focus(true);
                        this.$refs.mindView.toCenter(topic);
                    } else if (current.done) {
                        this.$tip.warn(translate.get("Searching operation have reached the end of the current mindmap"));
                        requestSearch.iterator = undefined;
                    }
                }
            },
            /**
             * 响应查找上一个主题项的命令
             */
            onSearchPrev() {
                const requestSearch = this.requestSearch;
                const record = requestSearch && requestSearch.record;
                if (record && record.length > 1) {
                    let prev;
                    record.pop();
                    while ((prev = record.pop()) !== undefined) {
                        const newIterator = this.$refs.mindView.mind.getTopicIterator();
                        let current;
                        while (!(current = newIterator.next()).done) {
                            if (current.value.isSame(prev)) {
                                prev.focus(true);
                                this.$refs.mindView.toCenter(prev);
                                record.push(prev);
                                requestSearch.iterator = newIterator;
                                break;
                            }
                        }
                        if (current && !current.done) {
                            break;
                        }
                    }
                }
            },
            /**
             * 当查找对话框的内容发生变化, 则重置查找迭代器
             */
            onSearchInputChange() {
                if (this.requestSearch) {
                    this.requestSearch.record = [];
                    this.requestSearch.iterator = this.$refs.mindView.mind.getTopicIterator();
                }
            },
            /**
             * 响应取消查找的命令
             */
            onSearchCancel() {
                this.closeAllPanel();
            }
        },
        mounted() {
            // 启动时监听由VSCode宿主发来的保存和另存为命令
            window.addEventListener("vscode.notify.save", this.onSave.bind(this));
            window.addEventListener("vscode.notify.saveAs", this.onSaveAsInvokeByHost.bind(this));
            // 由于VUE组件挂载的时候, 部分数据未就绪, 所以在下一节拍中进行初始导图内容加载的处理
            this.$nextTick(async () => {
                let file = await hostAdapter.loadCurrentFile();
                if (file) {
                    // VSCode宿主存在且有标记存在打开的文件, 则加载对应文件
                    const xmindfile = await xmind.load(file);
                    const mind = (this.mind = fileFormat.fromXMind(xmindfile));
                    this.loadAttachments(xmindfile.attachmentInterator());
                    this.pickPageList();
                    this.loadPage(mind[0]);
                } else {
                    // 没有标记打开的文件时, 则初始化一个空的导图
                    this.$refs.mindView.attachments.clear();
                    this.mind = [];
                    this.onNewPage();
                }
            });
        }
    }
</script>
