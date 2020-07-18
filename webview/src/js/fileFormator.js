// 常量信息
export const constants = Object.freeze({
    NAME: "mind.svg.js",
    VERSION: "0.1.0.202006",
    DEF_TOPIC_TYPE: "attached"
});

// 获取随机id号
function genRandID() {
    return `${Date.now()}${Math.random().toString(16).substr(2, 3)}`;
}

// 转换根据映射表来转换
function convertDataByMap(_target, _source, _map, _args) {
    const parserArgs = (_args instanceof Array) ? [_target, undefined, ..._args] : [_target, undefined];
    for (let item in _map) {
        const itemParser = _map[item];
        const value = _source[item];
        if (value !== undefined) {
            if (typeof itemParser === "string") {
                _target[itemParser] = value;
            } else if (typeof itemParser === "function") {
                parserArgs[1] = value;
                itemParser.apply(_source, parserArgs);
            } else {
                _target[item] = value;
            }
        }
    }
}

//#region XMIND格式转换

// 将XMind的HTML格式化备注转为纯文本备注
function xmindHtmlNotes2Plain(_html, _tag) {
    let ret;
    if (_tag === "text") {
        ret = _html + "\r\n";
    } else if (_html) {
        ret = "";
        for (let idx in _html) {
            ret += xmindHtmlNotes2Plain(_html[idx], idx);
        }
    } else {
        ret = "";
    }
    return ret;
}

// XMIND主题附属数据解析映射表
const xmindTopicDataMap = {
    labels: null,
    href: null,
    image: null,
    markers: (_storage, _value) => {
        const markerList = (_storage.markers = {});
        for (let markerIdx in _value) {
            const markerItem = _value[markerIdx];
            const {0:markerType, 1:markerValue} = String(markerItem.markerId).split("-");
            markerList[markerType] = markerValue;
        }
    },
    notes: (_storage, _value) => {
        let data = ((_value.plain && _value.plain.content) ? _value.plain.content : "") 
                    + xmindHtmlNotes2Plain(_value.html, null);
        _storage.notes = data;
    }
}

// 转换XMind的主题
function fromXMindTopic(_xmindFile, _topic, _extType) {
    let _tagret = {
        id: _topic.id,
        title: _topic.title,
        direction: _topic.direction,
        children: [],
    };
    // 转换主题附属数据
    convertDataByMap(_tagret, _topic, xmindTopicDataMap, [_xmindFile]);
    // 等级主题的扩展类型
    if (_extType !== undefined) {
        _tagret.topicType = _extType;
    }
    // 转换子主题
    for (let childrenType in _topic.children) {
        const children = _topic.children[childrenType];
        for (let childrenIdx in children) {
            _tagret.children.push(fromXMindTopic(_xmindFile, children[childrenIdx], childrenType));
        }
    }
    return _tagret;
}

// 从XMind对象加载MIND信息
export function fromXMind(_xmindFile) {
    try {
        let sheets = [];
        const source = _xmindFile.sheets;
        for (let sheetId in source) {
            const sheet = source[sheetId];
            let targetSheet = {
                id: sheet.id,
                title: sheet.title,
                relationships: sheet.relationships || [],
                topic: fromXMindTopic(_xmindFile, sheet.rootTopic)
            };
            sheets.push(targetSheet);
        }
        return sheets;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

// XMIND主题附属数据逆转换映射表
const toXMindTopicDataMap = {
    labels: null,
    href: null,
    image: null,
    markers: (_topic, _value) => {
        const markerList = (_topic.markers = []);
        for (const markerType in _value) {
            const markerValue = _value[markerType];
            markerList.push({markerId: `${markerType}-${markerValue}`});
        }
    },
    notes: (_topic, _value) => {
        _topic.notes = {
            plain: {
                content: _value
            }
        };
    }
}

// 转换为XMind主题格式
function toXMindTopic(_topic, _xmindFile) {
    let target = {
        id: _topic.id,
        title: _topic.title,
        direction: _topic.direction,
        children: {}
    };
    // 转换主题的附属数据
    convertDataByMap(target, _topic, toXMindTopicDataMap, [_xmindFile]);
    // 添加子主题
    const childrenSet = target.children;
    if (_topic.children) {
        const children = _topic.children;
        for (let childIdx in children) {
            const childTopic = children[childIdx];
            const childTarget = toXMindTopic(childTopic, _xmindFile);
            const childType = (childTopic.topicType || constants.DEF_TOPIC_TYPE);
            (childrenSet[childType] || (childrenSet[childType] = [])).push(childTarget);
        }
    }
    return target;
}

// 将导图数据转化为XMIND格式对象
export function toXMind(_mind, _xmindFile) {
    try {
        // 添加画布
        for (let idxSheet in _mind) {
            const sourceSheet = _mind[idxSheet];
            let sheet = {
                id: sourceSheet.id,
                title: sourceSheet.title,
                relationships: /* sourceSheet.relationships || */ [],
                rootTopic: toXMindTopic(sourceSheet.topic, _xmindFile)
            };
            _xmindFile.setSheet(sheet.id, sheet);
        }
        // 设置元数据
        _xmindFile.setMeta({creator:{
            name: constants.NAME,
            version: constants.VERSION
        }});
        return _xmindFile;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

//#endregion

//#region KittyMind格式转换

// 任务进度值列表
const taskValues = ["start", "oct", "quarter", "3oct", "half", "5oct", "3quar", "7oct", "done"];

// 从KM导入的转化映射表
const fromKmTopicMap = {
    id: null,
    text: "title",
    resource: "labels",
    note: "notes",
    hyperlink: "href",
    image: function (_storage, _value) {
        _storage["image"] = Object.assign({src:_value}, this.imageSize);
    },
    priority: function (_storage, _value) {
        const markers = (_storage.markers || (_storage.markers = {}));
        markers["priority"] = _value;
    },
    progress: function (_storage, _value) {
        const markers = (_storage.markers || (_storage.markers = {}));
        markers["task"] = taskValues[parseInt(_value) - 1] || "task-unknown";
    }
}

// 从KM主题信息中转换出主题内容
function fromKMTopic(_kmJson) {
    const topic = {};
    convertDataByMap(topic, _kmJson.data, fromKmTopicMap);
    const childrenSource = _kmJson.children;
    if ((childrenSource instanceof Array) && (childrenSource.length > 0)) {
        const childrenTarget = (topic.children = []);
        for (let idx in childrenSource) {
            childrenTarget.push(fromKMTopic(childrenSource[idx]));
        }
    }
    return topic;
}

// 导入KM主题页
export function importKittyMind(_kmBlob) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const name = String(_kmBlob.name);
                const extIdx = name.lastIndexOf(".");
                const title = name ? ((extIdx > 0) ? name.substr(0, extIdx) : name) : `page-${genRandID()}`;
                const kmJson = JSON.parse(e.target.result);
                const newSheet = {
                    id: genRandID(),
                    title,
                    relationships: [],
                    topic: fromKMTopic(kmJson.root)
                };
                resolve(newSheet);
            } catch (error) {
                console.error(error);
                resolve(undefined);
            }
        };
        reader.onerror = () => resolve(undefined);
        reader.readAsText(_kmBlob);
    });
}

// 导出KM的转化映射表
const toKmTopicMap = {
    id: null,
    title: "text",
    labels: "resource",
    notes: "note",
    href: "hyperlink",
    image: function (_storage, _value) {
        _storage["image"] = _value.src;
        _storage["imageSize"] = {width: _value.width, height: _value.height};
    },
    markers: function (_storage, _value) {
        if (_value.priority) {
            _storage["priority"] = parseInt(_value.priority);
        }
        if (_value.task) {
            const idx = taskValues.indexOf(_value.task) + 1;
            idx && (_storage["progress"] = idx);
        }
    }
}

// 将主题转换为KM格式
function toKmTopic(_topic) {
    const kmTopic = { data: {}, children: [] };
    convertDataByMap(kmTopic.data, _topic, toKmTopicMap);
    const childrenSource = _topic.children;
    if ((childrenSource instanceof Array) && (childrenSource.length > 0)) {
        const childrenTarget = kmTopic.children;
        for (let idx in childrenSource) {
            childrenTarget.push(toKmTopic(childrenSource[idx]));
        }
    }
    return kmTopic;
}

// 导出一个页面为KM格式
export function exportKittyMind(_sheet) {
    const km = {
        template: "default",
        theme: "fresh-blue",
        version: "1.4.43",
        root: toKmTopic(_sheet.topic)
    };
    return new Blob([JSON.stringify(km)]);
}
//#endregion

// 从主题数组中获取主题迭代器
export function * getTopicIterator(_topicList, _level) {
    _level || (_level = 0);
    for (const idx in _topicList) {
        const topic = _topicList[idx];
        yield {level: _level, topic};
        if (topic.children) {
            for (const childTopicDesc of getTopicIterator(topic.children, _level + 1)) {
                yield childTopicDesc;
            }
        }
    }
}

// 从导图结合对象中获取主题迭代器
export function * getTopicIteratorFromMinds(_minds) {
    for (const idxSheet in _minds) {
        for (const topicDesc of getTopicIterator([_minds[idxSheet].topic])) {
            yield topicDesc;
        }
    }
}
