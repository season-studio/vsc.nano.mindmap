const langList = {
    "zh-cn": require("./zh-cn.json")
};

let lang = undefined;

function load(_name) {
    lang = langList[_name];
}

function get() {
    let ret = [];
    const count = arguments.length;
    for (let idx = 0; idx < count; idx++) {
        let word = arguments[idx];
        ret.push(lang ? (lang[word] || word) : word);
    }
    return ret.join(" ");
}

module.exports = {
    load,
    get
};
