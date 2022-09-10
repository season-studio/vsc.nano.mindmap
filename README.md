# mindmap in vscode (vsc-nano-mindmap)
This extension support editing the mind map in WYSIWYG mode in VSCode.

**This extension is replaced by "Felis Mindmap".**

**Please try the "Felis Mindmap".**

https://marketplace.visualstudio.com/items?itemName=season-studio.felis-mindmap

https://github.com/season-studio/felisMindmap.git

![screenshots](https://season-studio.github.io/nano-mindmap/images/screenshots-vscode.gif)

## Features
- Show and edit mindmap
- Support xmind format
- Support multiple canvas in a mindmap file
- Support export to Markdown file(.md)
- Support import and export kittymind formt(.km)
- Switch English and Simplified Chinese for UI automatically according to the enviroment of vscode

## Installation
Install through VS Code extensions. Search for "vsc-nano-mindmap"

Visual Studio Code Market Place: vsc-nano-mindmap

## Usage
- Open any file with extension named ".xmind" after install this extension
- Edit the mind map by using the shortcuts in the toolbar or using the keyboard shortcuts listed follow
- Create an empty file by executing command "new mind map" in VSCode

## Commands
|Command|Feature|
|-------|-------|
|new mind map|Create an empty mind map file|
|open mind map|Open a mind map file from File-Dialog with filter of extension name|

## Keyboard Shortcuts
|Key|Feature|
|---|-------|
|Ctrl+Alt+N|Create an empty mind map file|
|Ctrl+O|Open a mind map file|
|Ctrl+S|Save current mind map file|
|Ctrl+Z|Undo the last edit operation|
|Ctrl+Y|Redo the last operation you had undo|
|Ctrl+Arrow Down|Add a new topic as a child of the focus topic|
|Ctrl+Arrow Right|Add a new topic as a sibling of the focus topic|
|F3|Search a topic|
|Arrow Down|Goto the first children of the focus topic|
|Arrow Up|Goto the parent topic of the focus topic|
|Arrow Right|Goto the next sibling topic of the focus topic|
|Arrow Left|Goto the previous topic of the focus topic|
|Enter|Edit the title of the focus topic|
|Delete|Remove the focus topic|

## Mouse Action
|Mouse Action|Feature|
|------------|-------------|
|Left button down in a topic and move the mouse| Dragging the topic to a new position|
|Left button down in canvas and move the mouse|Move the global canvas in the view|
|Wheel the middle button in canvas|Zoom the canvas|

## FAQ
- we don't support the relationship line in the mindmap at this time
- we don't support the rich-format text in notes of topic at this time
- we only support automatic layout mode, so you can NOT location the topic in a absolute postion
- the operations "delete the current page" and "rename the current page" can NOT be revoked
- for saving memory, we clear all no-used attachments when you change the page. So all the edit operations you have done in the page can NOT be revoked once you change the page.
- the vscode extension SDK not support clearing undo&redo history without saving the document, but we will clear the history when you change the page(see the previous FAQ item). So we don't support invoking undo or redo action from the VSCode's menu. Instead, you can invoke this function using the extension's toolbar item or the shortcut of the keyboard

## Contact
Please report the issues on https://github.com/season-studio/vsc.nano.mindmap/issues

Or mail to season_studio@outlook.com if you have any question.
