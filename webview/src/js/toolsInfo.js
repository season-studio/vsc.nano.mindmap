import * as hostAdapter from "./hostAdapter";

export default function () {
    return [{
        caption: 'File', 
        subItems: hostAdapter.noSpecialHost() ? [{
            caption: 'New&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+Alt+N',
            fn: this.onNewWorkBook
        }, {
            separate: true
        }, {
            caption: 'Open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+O',
            fn: this.onOpen
        }, {
            caption: 'Save&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+S',
            fn: this.onSave
        }, {
            separate: true
        }, {
            caption: "Import KM",
            fn: this.onImportKM
        }, {
            separate: true
        }, {
            caption: 'Export as Markdown',
            fn: this.onExportMarkdown
        }, {
            caption: 'Export as KM',
            fn: this.onExportKM
        }] : [{
            caption: 'New&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+Alt+N',
            fn: this.onNewWorkBook
        }, {
            separate: true
        }, {
            caption: 'Open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+O',
            fn: this.onOpen
        }, {
            caption: 'Save&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+S',
            fn: this.onSave
        }, {
            caption: 'Save As...',
            fn: this.onSaveAs
        }, {
            separate: true
        }, {
            caption: "Import KM",
            fn: this.onImportKM
        }, {
            separate: true
        }, {
            caption: 'Export as Markdown',
            fn: this.onExportMarkdown
        }, {
            caption: 'Export as KM',
            fn: this.onExportKM
        }]
    }, {
        caption: 'Pages',
        subItems: [{
            caption: 'Create a Empty Page',
            fn: this.onNewPage
        }, {
            caption: 'Rename Current Page',
            fn: this.onRenamePage
        }, {
            caption: 'Delete Current Page',
            fn: this.onDeletePage
        }]
    }, {
        separate: true
    }, {
        svg: {
            width: 17,
            height: 17,
            html: '<path d="M2 13H15V4H5M5 3L3.5 4L5 5V3L3.5 4" />'
        },
        caption: 'Undo',
        fn: this.onUndo,
    }, {
        svg: {
            width: 17,
            height: 17,
            html: '<path d="M15 13H2V4H13M12 3L13.5 4L12 5V3L13.5 4" />'
        },
        caption: 'Redo',
        fn: this.onRedo
    }, {
        svg: {
            width: 17,
            height: 17,
            html: '<path d="M13 6V2H3V15H10M13 10A3 3 0 1 1 7 10A3 3 0 1 1 13 10M12 12L15 15M5 5H11" />'
        },
        caption: 'Search',
        fn: this.onStartSearch
    }, {
        separate: true
    }, {
        svg: {
            width: 26,
            height: 17,
            html: '<path d="M2 3H17V7H2V3H4M2.5 12H7.5M5 9.5V14.5M10 7V12H13M14 10H25V14H13V10H17" />'
        },
        caption: 'Add Child',
        fn: () => this.execCmd('addSubTopic')
    }, {
        svg: {
            width: 26,
            height: 17,
            html: '<path d="M1 8H7M4 5V11M10 5H25V11H10V5H17M10 8H25" />'
        },
        caption: 'Add Sibling',
        notForRoot: true,
        fn: () => this.execCmd('addSiblingTopic')
    }, {
        svg: {
            width: 26,
            height: 17,
            html: '<path d="M18 8V5H3V10H14M15 8L23 13M23 8L15 13" />'
        },
        caption: 'Remove',
        notForRoot: true,
        fn: () => this.execCmd('deleteTopic')
    }, {
        caption: 'Properties:'
    }, {
        svg: {
            width: 17,
            height: 17,
            viewBox: "0 0 22 22",
            html: '<path d="M3 10.5L7 5H19V17H7L3 10.5M6 10.5A2 2 0 1 1 10 10.5A2 2 0 1 1 6 10.5" />'
        },
        caption: 'Lables',
        fn: () => this.invokePropertyEditor('labels')
    }, {
        svg: {
            width: 17,
            height: 17,
            viewBox: "0 0 22 22",
            html: '<path d="M3 19V4H13V13H3M13 8H19V16H10V13" />'
        },
        caption: 'Markers',
        fn: () => this.invokePropertyEditor('markers')
    }, {
        svg: {
            width: 17,
            height: 17,
            viewBox: "0 0 22 22",
            html: '<path d="M3 1H13L18 6V20H3V1M13 1V6H18M6 4H10M6 7H10M6 10H15M6 13H15M6 16H13" />'
        },
        caption: 'Notes',
        fn: () => this.invokePropertyEditor('notes')
    }, {
        svg: {
            width: 17,
            height: 17,
            viewBox: "0 0 22 22",
            html: '<path d="M3 5H18V17H3V5M3 16L7 10L10 13L13 7L18 13" />'
        },
        caption: 'Image',
        fn: () => this.$refs.mindView.invokeImagePicker()
    }, {
        svg: {
            width: 17,
            height: 17,
            viewBox: "0 0 22 22",
            html: '<path d="M9 7L11 5A2 2 0 0 1 15 9L13 11M7 9L5 11A2 2 0 0 0 9 15L11 13M7 13L13 7" />'
        },
        caption: 'link or attachment',
        fn: () => this.$refs.mindView.invokePropertyEditor('href')
    }, {
        separate: true
    }, {
        caption: 'Fold',
        subItems: [{
            caption: 'No fold',
            fn: () => this.$refs.mindView.mind.fold(0)
        }, {
            separate: true
        }, {
            caption: 'Fold to level 1',
            fn: () => this.$refs.mindView.mind.fold(1)
        }, {
            caption: 'Fold to level 2',
            fn: () => this.$refs.mindView.mind.fold(2)
        }, {
            caption: 'Fold to level 3',
            fn: () => this.$refs.mindView.mind.fold(3)
        }]
    }/*, {
        caption: 'Theme',
        subItems: [{

        }]
    }*/];
}