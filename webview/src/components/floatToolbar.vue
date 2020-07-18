<template>
    <div class="float-toolbar">
        <div :class="`float-toolbar-handler ${showContent ? '' : 'float-toolbar-handler-nocontent'}`"
            @click="$emit('handler-click')" >
            {{_T("menu")}}
            <div v-if="!showContent" class="float-icon-triangle float-icon-triangle-right" style="border-left-color: #fff;" />
        </div>
        <div class="float-toolbar-content" v-if="showContent">
            <div v-for="(item, index) in items" :key="index" 
                :class="itemClass(item)"
                @click="item.fn ? item.fn(item) : nop()">
                <svg v-if="!item.separate && item.svg" xmlns="http://www.w3.org/2000/svg" version="1.1" :viewBox="item.svg.viewBox" :style="{width:`${item.svg.width}px`, height:`${item.svg.height}px`}" v-html="item.svg.html" />
                <span v-if="!item.separate && !item.svg" class="float-toolbar-item-caption" v-html="_T(item.caption)" />
                <span v-if="!item.separate && item.svg" class="float-toolbar-item-tip">{{_T(item.caption)}}</span>
                <div v-if="!item.separate && item.subItems" class="float-icon-triangle float-icon-triangle-down float-icon-triangle-color" />
                <div v-if="!item.separate && item.subItems" class="float-toolbar-subgroup">
                    <div v-for="(subItem, subIdx) in item.subItems" :key="subIdx" 
                        :class="itemClass(subItem, true)"
                        @click="subItem.fn ? subItem.fn(subItem) : nop()">
                        <div class="float-toolbar-item-caption" v-html="_T(subItem.caption)" :style="subItem.style" />
                    </div>
                </div>
            </div>
        </div>
        <div><slot></slot></div>
    </div>    
</template>

<style>
    .float-toolbar {
        position: absolute;
        top: 0px;
        left: 0px;
        margin: 17px;
        background-color: transparent;
        border: 0px;
        border-radius: 6px;
        box-shadow: 0px 0px 6px rgba(128, 128, 128, 0.6);
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        font-size: 13px;
    }

    .float-icon-triangle {
        width: 0px;
        height: 0px;
        padding: 0px;
        margin-left: 3px;
        border: 0px solid #333;
    }

    .float-icon-triangle-right {
        border-left-width: 10px;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
    }

    .float-icon-triangle-down {
        border-top-width: 10px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
    }

    .float-toolbar-handler {
        padding: 6px;
        background-color: rgba(46, 46, 46, 0.8);
        color: #fff;
        border: 0px;
        border-radius: 6px 0px 0px 6px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        white-space: nowrap;
    }

    .float-toolbar-handler-nocontent {
        border-radius: 6px;
    }

    .float-toolbar-content {
        padding: 0px 6px 0px 0px;
        background-color: rgba(255, 255, 255, 0.6);
        color: #000;
        border: 0px;
        border-radius: 0px 6px 6px 0px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
    }

    .float-toolbar-content:hover {
        background-color: rgba(255, 255, 255, 0.9);
    }

    .float-toolbar-plain-item {
        position: relative;
        padding: 6px;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        background-color: transparent; /* rgba(255, 255, 255, 0.6); */
        font-size: 10px;
        color: #333;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
    }

    .float-toolbar-item {
        position: relative;
        padding: 6px;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        font-size: 10px;
        color: #333;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        white-space: nowrap;
        fill: none;
        stroke: #333;
        stroke-width: 1.5;
    }

    .float-toolbar-subitem {
        height: unset;
        width: 100%;
        text-align: left;
        justify-content: flex-start;
    }

    .float-toolbar-separate-item {
        position: relative;
        margin: 0px 1px;
        padding: 0px;
        width: 0px;
        height: 20px;
        box-sizing: border-box;
        border: 0px;
        border-left: 1px solid #ccc;
        border-right: 1px solid #eee;
    }

    .float-toolbar-separate-subitem {
        position: relative;
        margin: 1px 0px;
        padding: 0px;
        width: 90%;
        height: 0px;
        box-sizing: border-box;
        border: 0px;
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #eee;
    }

    .float-toolbar-item-caption {
        white-space: nowrap;
    }

    .float-toolbar-item-tip {
        position: absolute;
        padding: 6px;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 220, 0.8);
        font-size: 9px;
        color: #333;
        display: none;
        white-space: nowrap;
        border: 1px solid #999;
        top: 100%;
        left: 0px;
    }

    .float-toolbar-disable-item {
        position: relative;
        padding: 6px;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        font-size: 10px;
        color: #aaa;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        fill: none;
        stroke: #aaa;
        stroke-width: 1.5;
    }

    .float-toolbar-subgroup {
        position: absolute;
        top: 100%;
        left: 0px;
        background-color: rgba(255, 255, 255, 0.9);
        border: 0px;
        border-radius: 0px 0px 6px 6px;
        padding: 0px 0px 6px 0px;
        box-shadow: 0px 0px 6px rgba(128, 128, 128, 0.6);
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .float-toolbar-item:hover {
        background: linear-gradient(to top, rgba(0, 117, 255, 0.9) 26%,rgba(0, 157, 255, 0.9) 90%,rgba(0, 170, 255, 0.9) 100%);
        color: #fff;
        fill: none;
        stroke: #fff;
        stroke-width: 1.5;
    }

    .float-toolbar-item:hover .float-toolbar-subgroup {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .float-toolbar-item:hover .float-toolbar-item-tip {
        display: inline;
    }
    
    .float-toolbar-item:hover .float-icon-triangle-color {
        border-top-color: #fff;
    }

    .float-toolbar-item:active {
        background: linear-gradient(to top, rgba(0, 170, 255, 0.9) 26%,rgba(0, 157, 255, 0.9) 90%,rgba(0, 117, 255, 0.9) 100%);
        color: #fff;
        fill: none;
        stroke: #fff;
        stroke-width: 1.5;
    }

</style>

<script>

import { translate } from "mind.svg.vue"

export default {
    data() {
        return {
            
        }
    },
    props: {
        showContent: Boolean,
        items: {
            type: Array,
            required: true
        }
    },
    methods: {
        _T: translate.get,
        nop() {},
        log(_item) {
            console.log(_item);
        },
        itemClass(_item, _subItem) {
            return `${_item.separate ? `float-toolbar-separate-${_subItem ? "subitem" : "item"}`
                        : (_item.disable ? 'float-toolbar-disable-item' 
                            : ((_item.fn || _item.subItems) ? 'float-toolbar-item' : 'float-toolbar-plain-item'))}
                    ${_subItem ? " float-toolbar-subitem" : ""}`;
        }
    }
}
</script>