/* global acquireVsCodeApi:false */

import Vue from 'vue'
import App from './App.vue'
import { mindSvgView, translate, lang } from "mind.svg.vue";
import "mind.svg.vue/.lib/mindSvgVue.css";
import * as tipKit from "./components/tipKit";
import appLang from "./lang/lang";
import VSCodeHost from "./js/vscodeHost";
import * as hostAdapter from "./js/hostAdapter";

let promise = new Promise(r => r());

const host = (typeof acquireVsCodeApi === "function") ? acquireVsCodeApi() : undefined;
console.log(host ? "in vscode mode" : "in normal web mode");

if (host) {
    // 在VSCode模式中，则初始化宿主适配层，并根据环境设置UI语言
    const vscode = new VSCodeHost(host);
    hostAdapter.setHost(vscode);
    promise = promise.then(() => vscode.sendAndWait("getEnv")).then(env => {
        translate.map(lang[env.language]);
        translate.map(appLang[env.language]);
    });
} else {
    // 不在VSCode模式中，则默认设置UI为中文
    promise = promise.then(() => {
        translate.map(lang["zh-cn"]);
        translate.map(appLang["zh-cn"]);
    });
}

// 所有初始化结束后，启动VUE应用页面
promise.finally(() => {
    Vue.use(mindSvgView);

    tipKit.registry(Vue);

    new Vue({
    render: h => h(App),
    }).$mount('#app')
});

