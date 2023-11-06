import {IEditor} from './../types/interface';
import {FreeEditor} from './free-editor';
import {Range, Transforms} from 'slate';
import scrollIntoView from 'scroll-into-view-if-needed';
import {IS_FIREFOX} from '../util/ua';

/** editor onchange 时，将 editor selection 同步给 DOM */
export function editorSelectionToDOM(editor: IEditor): void {
    const {selection} = editor;
    const root = FreeEditor.findDocumentOrShadowRoot(editor) as Document;
    const domSelection = root.getSelection();
    // 中文输入中 or 没有选中区域 or 没有聚焦区域
    if (!!editor.isComposing || !domSelection || !editor.focus) return;
    const hasDomSelection = domSelection.type !== 'None';
    if (!selection && !hasDomSelection) return;
    const editorElement = editor.element;
    let hasDomSelectionInEditor = false;
    // 判断是否有选中区域包含在编辑器区域
    if (editorElement.contains(domSelection.anchorNode) && editorElement.contains(domSelection.focusNode)) {
        hasDomSelectionInEditor = true;
    }

    // If the DOM selection is in the editor and the editor selection is already correct, we're done.
    if (hasDomSelection && hasDomSelectionInEditor && selection) {
        const slateRange = FreeEditor.toSlateRange(editor, domSelection, {exactMatch: true, suppressThrow: true});
        if (slateRange && Range.equals(slateRange, selection)) {
            return;
        }
    }

    // when <Editable/> is being controlled through external value
    // then its children might just change - DOM responds to it on its own
    // but Slate's value is not being updated through any operation
    // and thus it doesn't transform selection on its own
    if (selection && !FreeEditor.hasRange(editor, selection)) {
        editor.selection = FreeEditor.toSlateRange(editor, domSelection, {exactMatch: false, suppressThrow: false});
        return;
    }

    // Otherwise the DOM selection is out of sync, so update it.
    editor.isUpdatingSelection = true;
    const newDomRange = selection && FreeEditor.toDOMRange(editor, selection);
    if (newDomRange) {
        if (Range.isBackward(selection!)) {
            domSelection.setBaseAndExtent(newDomRange.endContainer, newDomRange.endOffset, newDomRange.startContainer, newDomRange.startOffset);
        } else {
            domSelection.setBaseAndExtent(newDomRange.startContainer, newDomRange.startOffset, newDomRange.endContainer, newDomRange.endOffset);
        }

        // 滚动到选区
        const leafEl = newDomRange.startContainer.parentElement;
        if (leafEl) {
            leafEl.getBoundingClientRect = newDomRange.getBoundingClientRect.bind(newDomRange);
            scrollIntoView(leafEl, {scrollMode: 'if-needed', boundary: editorElement.parentElement, block: 'end', behavior: 'smooth'});
            // @ts-ignore
            delete leafEl.getBoundingClientRect;
        }
    } else {
        domSelection.removeAllRanges();
    }

    setTimeout(() => {
        // COMPAT: In Firefox, it's not enough to create a range, you also need
        // to focus the contenteditable element too. (2016/11/16)
        if (newDomRange && IS_FIREFOX) {
            const el = FreeEditor.toDOMNode(editor, editor);
            el.focus();
        }
        editor.isUpdatingSelection = false;
    });
}

/**
 * DOM selection change 时，把 DOM selection 同步给 slate
 * @param editor editor
 */
export function domSelectionToEditor(editor: IEditor) {
    const {isReadOnly, isComposing, isUpdatingSelection, isDraggingInternally} = editor;
    if (isReadOnly) return;
    if (isComposing) return;
    if (isUpdatingSelection) return;
    if (isDraggingInternally) return;

    const root = FreeEditor.findDocumentOrShadowRoot(editor) as Document;
    const {activeElement} = root;
    const el = FreeEditor.toDOMNode(editor, editor);
    const domSelection = root.getSelection();

    if (activeElement === el) {
        editor.lastActiveElement = activeElement;
        editor.focus = true;
    } else {
        editor.focus = false;
    }
    if (!domSelection) return Transforms.deselect(editor);
    const {anchorNode, focusNode} = domSelection;

    const anchorNodeSelectable = FreeEditor.hasEditableTarget(editor, anchorNode) || FreeEditor.isTargetInsideVoid(editor, anchorNode);
    const focusNodeSelectable = FreeEditor.hasEditableTarget(editor, focusNode) || FreeEditor.isTargetInsideVoid(editor, focusNode);
    if (anchorNodeSelectable && focusNodeSelectable) {
        console.log(domSelection, 'dom selction');
        const range = FreeEditor.toSlateRange(editor, domSelection, {exactMatch: false, suppressThrow: false});
        Transforms.select(editor, range);
    } else {
        Transforms.deselect(editor);
    }
}
