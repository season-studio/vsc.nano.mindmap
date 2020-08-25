import JSZip from "jszip";

// 常量定义
const constants = {
    CLASSIC_ATTACHMENT_PATH: "attachments/",
    CLASSIC_CONTENT_FILE: "content.xml",
    CLASSIC_META_FILE: "meta.xml",
    CLASSIC_COMMENTS_FILE: "comments.xml",
    CLASSIC_MANIFEST_FILE: "META-INF/manifest.xml",
    ZEN_RESOURCE_PATH: "resources/",
    ZEN_MANIFEST_FILE: "manifest.json",
    ZEN_META_FILE: "metadata.json",
    ZEN_CONTENT_FILE: "content.json",
    KEY_FILE_ENTRIES: "file-entries"
};

// XMind文件对象
class XMindFile {
    constructor () {
        this.attachments = {};
        this.comments = {};
        this.sheets = {};
        this.meta = {};
    }

    setAttachment (_path, _data) {
        this.attachments[_path] = _data;
    }

    deleteAttachment (_path) {
        if (this.attachments[_path]) {
            delete this.attachments[_path];
        }
    }

    * attachmentInterator() {
        const attachments = this.attachments;
        if (attachments) {
            for (const path in attachments) {
                yield { path, value: attachments[path] };
            }
        }
    }

    setComment (_id, _objectID, _content, _author, _time) {
        this.comments[_id] = { object_id: _objectID, content: _content, author: _author, time: _time };
    }

    deleteComment (_id) {
        if (this.comments[_id]) {
            delete this.comments[_id];
        }
    }

    setSheet (_id, _sheet) {
        this.sheets[_id] = _sheet;
    }

    deleteSheet (_id) {
        if (this.sheets[_id]) {
            delete this.sheets[_id];
        }
    }

    setMeta (_obj) {
        Object.assign(this.meta, _obj);
    }
}

// 加载zen模式下的附件文件
async function loadZenAttachments(_xmindFile, _zip) {
    const manifestEntry = _zip.file(constants.ZEN_MANIFEST_FILE);
    if (manifestEntry) {
        const manifestJSON = await manifestEntry.async("text");
        const manifestDoc = JSON.parse(manifestJSON);
        const manifestList = manifestDoc[constants.KEY_FILE_ENTRIES];
        for (let item in manifestList) {
            if (item.indexOf("/") > 0) {
                const attachmentFile = _zip.file(item);
                if (attachmentFile) {
                    const data = await attachmentFile.async("blob");
                    _xmindFile.setAttachment(item, data);
                }
            }
        }
    }
}

// 加载ZEN模式下的内容
async function loadZenContent(_xmindFile, _zip) {
    const contentEntry = _zip.file(constants.ZEN_CONTENT_FILE);
    if (contentEntry) {
        const contentJSON = await contentEntry.async("text");
        const contentDoc = JSON.parse(contentJSON);
        for (let item of contentDoc) {
            _xmindFile.setSheet(item.id, item);
        }
    }
}

// 加载Zen模式下的元数据
async function loadZenMeta(_xmindFile, _zip) {
    const metaEntry = _zip.file(constants.ZEN_META_FILE);
    if (metaEntry) {
        const metaJSON = await metaEntry.async("text");
        const metaDoc = JSON.parse(metaJSON);
        delete metaDoc["activeSheetId"];
        _xmindFile.setMeta(metaDoc);
    }
}

// 加载ZEN版本的xmind文件
async function loadZenEdition(_zip) {
    let xmindFile = new XMindFile();
    try {
        await loadZenAttachments(xmindFile, _zip);
        await loadZenContent(xmindFile, _zip);
        await loadZenMeta(xmindFile, _zip);
    } catch (error) {
        console.error(error);
        xmindFile = undefined;
    }
    return xmindFile;
}

// 将XML标签的属性转为对象内的成员
function xmlAttr2ObjectMember(_obj, _node, _maps) {
    const attachmentsPrefix = `xap:${constants.CLASSIC_ATTACHMENT_PATH}`;
    const attachmentRegexpStr = `^xap:${constants.CLASSIC_ATTACHMENT_PATH}`;
    const zenAttachmentPrefix = `xap:${constants.ZEN_RESOURCE_PATH}`;
    for (let item in _maps) {
        let attr = _maps[item];
        let fn = undefined;
        if (attr.fn) {
            fn = attr.fn;
            attr = attr.n;
        }
        if (_node.hasAttribute(attr)) {
            let value = String(_node.getAttribute(attr));
            if (fn) {
                value = fn(value);
            }
            if ((attr.indexOf(":") > 0) && (typeof value === "string") && (value.startsWith(attachmentsPrefix))) {
                value = value.replace(new RegExp(attachmentRegexpStr), zenAttachmentPrefix);
            }
            _obj[item] = value;
        }
    }
    return _obj;
}

// 将XML标签的成员转为对象的成员
function xmlChildren2ObjectMember(_obj, _node, _maps, _undefinedParser) {
    const children = _node.childNodes;
    for (let item of children) {
        const tagName = item.tagName;
        const parserFn = _maps[tagName];
        if (parserFn) {
            if (typeof parserFn === "string") {
                _obj[parserFn] = item.textContent;
            } else {
                parserFn(_obj, item);
            }
        } else if (_undefinedParser) {
            _undefinedParser(_obj, item);
        }
    }
    return _obj;
}

// 加载传统模式的附件内容
async function loadClassicAttachments(_xmindFile, _zip) {
    const manifestEntry = _zip.file(constants.CLASSIC_MANIFEST_FILE);
    const attachmentRegexpStr = `^${constants.CLASSIC_ATTACHMENT_PATH}`;
    if (manifestEntry) {
        const manifestXML = await manifestEntry.async("text");
        const parser = new DOMParser();
        const manifestDoc = parser.parseFromString(manifestXML, "text/xml");
        const manifestList = manifestDoc.documentElement.childNodes;
        for (let item of manifestList) {
            if (item.hasAttribute("full-path")) {
                let path = item.getAttribute("full-path").trim();
                if ((!path.endsWith("/")) && path.startsWith(constants.CLASSIC_ATTACHMENT_PATH)) {
                    const attachmentFile = _zip.file(path);
                    if (attachmentFile) {
                        path = path.replace(new RegExp(attachmentRegexpStr), constants.ZEN_RESOURCE_PATH);
                        const data = await attachmentFile.async("blob");
                        _xmindFile.setAttachment(path, data);
                    }
                }
            }
        }
    }
}

// 加载传统模式的批注内容
async function loadClassicComments(_xmindFile, _zip) {
    const CommentsEntry = _zip.file(constants.CLASSIC_COMMENTS_FILE);
    if (CommentsEntry) {
        const commentsXML = await CommentsEntry.async("text");
        const parser = new DOMParser();
        const commentsDoc = parser.parseFromString(commentsXML, "text/xml");
        const commentsList = commentsDoc.documentElement.childNodes;
        for (let item of commentsList) {
            const id = (item.getAttribute("id") || "").trim();
            const objectID = (item.getAttribute("object-id") || "").trim();
            const author = (item.getAttribute("author") || "").trim();
            const time = parseInt((item.getAttribute("time") || Date.now().toString()).trim());
            let content = "";
            for (let contentItem of item.childNodes) {
                if (contentItem.tagName === "content") {
                    content += contentItem.textContent;
                }
            }
            _xmindFile.setComment(id, objectID, content, author, time);
        }
    }
}

// 传统模式的子主题解析映射表
const classicChildTopicParserMap = {
    "topic": (_list, _child) => {
        _list.push(classicTopicParser(_child));
    }
};

// 传统模式的子主题集的解析映射表
const classicChildrenTopicsParserMap = {
    "topics": (_children, _itemNode) => {
        const type = _itemNode.getAttribute("type");
        if (!_children[type]) {
            _children[type] = [];
        }
        xmlChildren2ObjectMember(_children[type], _itemNode, classicChildTopicParserMap);
    }
}

// 传统模式的主题内项的解析映射表
const classicTopicParserMap = {
    "title": "title",
    "children": (_topic, _node) => {
        _topic.children = xmlChildren2ObjectMember({}, _node, classicChildrenTopicsParserMap);
    },
    "xhtml:img": (_topic, _node) => {
        _topic.image = xmlAttr2ObjectMember({}, _node, {
            src: "xhtml:src",
            width: { n: "svg:width", fn: parseInt },
            height: { n: "svg:height", fn: parseInt }
        });
    },
    "labels": (_topic, _node) => {
        _topic.labels = xmlChildren2ObjectMember([], _node, {
            "label": (_labels, _item) => {
                _labels.push(String(_item.textContent));
            }
        })
    },
    "notes": (_topic, _node) => {
        _topic.notes = xmlChildren2ObjectMember({}, _node, {}, (_notes, _nodeItem) => {
            if (_notes.plain && _notes.plain.content) {
                _notes.plain.content += `\r\n${_nodeItem.textContent}`;
            } else {
                _notes.plain = { content: _nodeItem.textContent };
            }
        });
    },
    "marker-refs": (_topic, _node) => {
        _topic.markers = xmlChildren2ObjectMember([], _node, {}, (_markers, _marker) => {
            _markers.push(xmlAttr2ObjectMember({}, _marker, { markerId: "marker-id" }));
        });
    },
    "position": (_topic, _node) => {
        _topic.position = xmlAttr2ObjectMember({}, _node, {
            "x": { n: "svg:x", fn: parseInt},
            "y": { n: "svg:y", fn: parseInt}
        })
    },
    "extensions": (_topic, _node) => {
        _topic.extensions = xmlChildren2ObjectMember([], _node, {
            "extension": (_extensions, _itemNode) => {
                let extension = xmlAttr2ObjectMember({}, _itemNode, {
                    provider: "provider"
                });
                extension.content = [];
                xmlChildren2ObjectMember(null, _itemNode, {
                    "content": (_nouse, _contentNode) => {
                        xmlChildren2ObjectMember(extension.content, _contentNode, {}, (_list, _childNode) => {
                            _list.push({
                                name: _childNode.tagName,
                                content: _childNode.textContent
                            })
                        });
                    }
                })
                _extensions.push(extension);
            }
        });
    }
}

// 传统模式的主题解析处理
function classicTopicParser(_node) {
    let topic = xmlAttr2ObjectMember({}, _node, {
        id: "id",
        href: "xlink:href",
        structureClass: "structure-class"
    });
    xmlChildren2ObjectMember(topic, _node, classicTopicParserMap);
    if (!topic.children) {
        topic.children = {};
    }
    return topic;
}

// 传统模式的关系控制点的解析映射表
const classicRelationCtrlPointParserMap = {
    "control-point": (_cpSet, _node) => {
        const index = String(_node.getAttribute("index"));
        _cpSet[index] = xmlAttr2ObjectMember({}, _node, {
            amount: { n: "amount", fn: parseFloat },
            angle: { n: "angle", fn: parseFloat }
        });
    }
}

// 传统模式的关系项的解析映射表
const classicRelationshipParserMap = {
    "title": "title",
    "control-points": (_rel, _node) => {
        _rel.controlPoints = xmlChildren2ObjectMember({}, _node, classicRelationCtrlPointParserMap);
    }
}

// 传统模式的关系项的解析处理函数
function classicRelationshipParser(_relList, _relNode) {
    let _relationship = xmlAttr2ObjectMember({}, _relNode, {
        id: "id",
        end1Id: "end1",
        end2Id: "end2"
    });
    xmlChildren2ObjectMember(_relationship, _relNode, classicRelationshipParserMap);
    _relList.push(_relationship);
}

// 传统模式的工作表内项的解析映射表
const classicSheetParserMap = {
    "topic": (_sheet, _node) => {
        _sheet.rootTopic = classicTopicParser(_node);
    },
    "title": "title",
    "relationships": (_sheet, _node) => {
        _sheet.relationships = xmlChildren2ObjectMember([], _node, {
            "relationship": classicRelationshipParser
        });
    }
};

// 加载传统模式的工作表
function loadClassicSheetItem(_xmindFile, _zip, _node) {
    let sheet = xmlAttr2ObjectMember({}, _node, {
        id: "id"
    });
    xmlChildren2ObjectMember(sheet, _node, classicSheetParserMap);
    return sheet;
}

// 加载传统模式的工作表集合
async function loadClassicSheets(_xmindFile, _zip) {
    const sheetsEntry = _zip.file(constants.CLASSIC_CONTENT_FILE);
    if (sheetsEntry) {
        const sheetsXML = await sheetsEntry.async("text");
        const parser = new DOMParser();
        const sheetsDoc = parser.parseFromString(sheetsXML, "text/xml");
        xmlChildren2ObjectMember(null, sheetsDoc.documentElement, {
            "sheet": (_null, _sheetNode) => {
                const sheet = loadClassicSheetItem(_xmindFile, _zip, _sheetNode);
                _xmindFile.setSheet(sheet.id, sheet);
            } 
        })
    }
}

// 加载传统模式的元数据
async function loadClassicMetadata(_xmindFile, _zip) {
    const metaEntry = _zip.file(constants.CLASSIC_META_FILE);
    if (metaEntry) {
        const metaXML = await metaEntry.async("text");
        const parser = new DOMParser();
        const metaDoc = parser.parseFromString(metaXML, "text/xml");
        let meta = xmlChildren2ObjectMember({}, metaDoc.documentElement, {
            "Creator": (_meta, _node) => {
                _meta.creator = xmlChildren2ObjectMember({}, _node, {
                    "Name": "name",
                    "Version": "version"
                });
            } 
        });

        _xmindFile.setMeta(meta);
    }
}

// 加载传统模式的文件版本
async function loadClassicEdition(_zip) {
    let xmindFile = new XMindFile();
    try {
        await loadClassicAttachments(xmindFile, _zip);
        await loadClassicComments(xmindFile, _zip);
        await loadClassicSheets(xmindFile, _zip);
        await loadClassicMetadata(xmindFile, _zip);

    } catch (error) {
        console.error(error);
        xmindFile = undefined;
    }
    return xmindFile;
}

// 从源数据加载xmind文件内容
export async function load(_source) {
    let xmindFile = undefined;
    try {
        let zipFunc = new JSZip();
        let zip = await zipFunc.loadAsync(_source, { base64: typeof _source === "string" });
        if (zip.file(constants.ZEN_CONTENT_FILE)) {
            xmindFile = await loadZenEdition(zip);
        } else if (zip.file(constants.CLASSIC_CONTENT_FILE)) {
            xmindFile = await loadClassicEdition(zip);
        }
    } catch (error) {
        console.error(error);
        xmindFile = undefined;
    }

    return xmindFile;
}

// 将xmind对象保存到一个文件中去
export async function save(_xmindFile) {
    if (_xmindFile instanceof XMindFile) {
        const zip = new JSZip();
        const manifest = {};
        const entries = (manifest[constants.KEY_FILE_ENTRIES] = {});
        // 保存附件
        const attachments = _xmindFile.attachments;
        if (attachments) {
            for (let fileName in attachments) {
                const data = attachments[fileName];
                if (data) {
                    zip.file(fileName.replace(constants.CLASSIC_ATTACHMENT_PATH, constants.ZEN_RESOURCE_PATH), data);
                    entries[fileName] = {};
                }
            }
        }
        // 保存元数据
        zip.file(constants.ZEN_META_FILE, JSON.stringify(_xmindFile.meta));
        entries[constants.ZEN_META_FILE] = {};
        const content = [];
        const sheets = _xmindFile.sheets;
        for (let sheetId in sheets) {
            content.push(sheets[sheetId]);
        }
        // 保存内容
        zip.file(constants.ZEN_CONTENT_FILE, JSON.stringify(content));
        entries[constants.ZEN_CONTENT_FILE] = {};
        // 保存manifest
        zip.file(constants.ZEN_MANIFEST_FILE, JSON.stringify(manifest));
        return await zip.generateAsync({type:"blob"});
    } else {
        return undefined;
    }
}

// 创建一个空的对象
export function createEmpty() {
    return new XMindFile();
}
