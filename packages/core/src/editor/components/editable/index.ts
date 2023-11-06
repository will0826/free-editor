import {Slim} from 'slim-js';
import {tag, template, useShadow} from 'slim-js/decorators';
import tagValue from './tag';
import createEditor from '../../index';
import {BeforeInputEventType, IEditor} from '../../../types/interface';
import {HAS_BEFORE_INPUT_SUPPORT, IS_FIREFOX} from '../../../util/ua';
import {FreeEditor} from '../../free-editor';
import {EDITOR_TO_USER_SELECTION, ELEMENT2NODE, NODE2ELEMENT} from '../../../util/weakmap';
import {getDefaultView} from '../../../util/dom';
import {Range, Editor, BaseElement, Transforms, Path} from 'slate';
import {debounce, throttle} from 'lodash-es';
import {domSelectionToEditor} from '../../dom-selection';
import {promiseResolveThen} from '../../../util/util';

@tag('editable-box')
@template(tagValue)
class Editable extends Slim {
    constructor() {
        super();
        this.editor = createEditor({}) as IEditor;

        this.handleBeforeInput = this.handleBeforeInput.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
    }
    handleBeforeInput(event: BeforeInputEventType) {
        console.log('handle before input', event);
        const {editor} = this;
        if (!HAS_BEFORE_INPUT_SUPPORT) return;
        if (!FreeEditor.hasEditableTarget(this.editor, event.target)) return;

        const {scheduleOnDOMSelectionChange} = editor;
        scheduleOnDOMSelectionChange && (scheduleOnDOMSelectionChange as any).flush();
        const {selection} = this.editor;
        const {inputType: type} = event;
        const data = event.dataTransfer || event.data || undefined;
        const isCompositionChange = type === 'insertCompositionText' || type === 'deleteCompositionText';
        //These two types occur while a user is composing text and can't be cancelled. Let them through and wait for the composition to end.
        if (type === 'insertCompositionText' || type === 'deleteCompositionText') {
            return;
        }
        let native = false;
        if (
            type === 'insertText' &&
            selection &&
            // 光标是否是一个点, 还是选中了一片区域
            Range.isCollapsed(selection) &&
            event.data &&
            event.data.length === 1 &&
            /[a-z ]/i.test(event.data) &&
            selection.anchor.offset !== 0
        ) {
            native = true;
            editor.marks && (native = false);
            const {anchor} = selection;
            const inline = Editor.above(editor, {at: anchor, match: n => Editor.isInline(editor, n as BaseElement), mode: 'highest'});
            if (inline) {
                const [, inlinePath] = inline;
                Editor.isEnd(editor, selection.anchor, inlinePath) && (native = false);
            }
        }
        !native && event.preventDefault();
        // COMPAT: For the deleting forward/backward input types we don't want
        // to change the selection because it is the range that will be deleted,
        // and those commands determine that for themselves.
        if (!type.startsWith('delete') || type.startsWith('deleteBy')) {
            // 拿到当前的范围
            const [targetRange] = event.getTargetRanges();
            if (targetRange) {
                const range = FreeEditor.toSlateRange(editor, targetRange, {exactMatch: false, suppressThrow: false});
                if (!selection || !Range.equals(selection, range)) {
                    native = false;
                    const selectionRef = !isCompositionChange && editor.selection && Editor.rangeRef(editor, editor.selection);
                    // 选中这一段区域
                    Transforms.select(editor, range);
                    if (selectionRef) {
                        EDITOR_TO_USER_SELECTION.set(editor, selectionRef);
                    }
                }
            }
        }
        // COMPAT: If the selection is expanded, even if the command seems like
        // a delete forward/backward command it should delete the selection.
        if (selection && Range.isExpanded(selection) && type.startsWith('delete')) {
            const direction = type.endsWith('Backward') ? 'backward' : 'forward';
            Editor.deleteFragment(editor, {direction});
            return;
        }
        // 根据 beforeInput 的 event.inputType
        switch (type) {
            case 'deleteByComposition':
            case 'deleteByCut':
            case 'deleteByDrag': {
                Editor.deleteFragment(editor);
                break;
            }

            case 'deleteContent':
            case 'deleteContentForward': {
                Editor.deleteForward(editor);
                break;
            }

            case 'deleteContentBackward': {
                Editor.deleteBackward(editor);
                break;
            }

            case 'deleteEntireSoftLine': {
                Editor.deleteBackward(editor, {unit: 'line'});
                Editor.deleteForward(editor, {unit: 'line'});
                break;
            }

            case 'deleteHardLineBackward': {
                Editor.deleteBackward(editor, {unit: 'block'});
                break;
            }

            case 'deleteSoftLineBackward': {
                Editor.deleteBackward(editor, {unit: 'line'});
                break;
            }

            case 'deleteHardLineForward': {
                Editor.deleteForward(editor, {unit: 'block'});
                break;
            }

            case 'deleteSoftLineForward': {
                Editor.deleteForward(editor, {unit: 'line'});
                break;
            }

            case 'deleteWordBackward': {
                Editor.deleteBackward(editor, {unit: 'word'});
                break;
            }

            case 'deleteWordForward': {
                Editor.deleteForward(editor, {unit: 'word'});
                break;
            }

            case 'insertLineBreak':
            case 'insertParagraph': {
                Editor.insertBreak(editor);
                break;
            }

            case 'insertFromComposition':
            case 'insertFromDrop':
            case 'insertFromPaste':
            case 'insertFromYank':
            case 'insertReplacementText':
            case 'insertText': {
                // 不可默认粘贴
                if (type === 'insertFromPaste') {
                    if (!editor.info.canPaste) break;
                }

                if (type === 'insertFromComposition') {
                    // COMPAT: in Safari, `compositionend` is dispatched after the
                    // `beforeinput` for "insertFromComposition". But if we wait for it
                    // then we will abort because we're still composing and the selection
                    // won't be updated properly.
                    // https://www.w3.org/TR/input-events-2/
                    editor.info.isComposing && (editor.info.isComposing = false);
                }

                if (data?.constructor.name === 'DataTransfer') {
                    // 这里处理非纯文本（如 html 图片文件等）的粘贴。对于纯文本的粘贴，使用 paste 事件
                    editor.insertData(data as any);
                } else if (typeof data === 'string') {
                    // Only insertText operations use the native functionality, for now.
                    // Potentially expand to single character deletes, as well.
                    if (native) {
                        editor.info.deferredOperations.push(() => Editor.insertText(editor, data));
                    } else {
                        //insertText时选中区域有内容，先删除，在insertText
                        if (selection && Range.isExpanded(selection)) {
                            if (!Path.equals(selection.anchor.path, selection.focus.path)) {
                                Editor.deleteFragment(editor);
                            }
                        }
                        Editor.insertText(editor, data);
                    }
                }
                break;
            }
        }
    }
    handleClick(event: Event) {
        console.log('event', event, 'click');
    }
    handleFocus(event: Event) {
        console.log('handle focus');
        const editor = this.editor as IEditor;
        const {isUpdatingSelection} = this.editor as IEditor;
        if (editor.isReadOnly) return;
        if (isUpdatingSelection) return;
        if (!FreeEditor.hasEditableTarget(editor, event.target)) return;
        const el = FreeEditor.toDOMNode(editor, editor);
        const root = FreeEditor.findDocumentOrShadowRoot(editor);
        editor.lastActiveElement = root.activeElement;
        if (IS_FIREFOX && event.target !== el) return el.focus();
        editor.focus = true;
    }
    init(editor: IEditor) {
        editor.element = this.root;
        NODE2ELEMENT.set(editor, this.root);
        ELEMENT2NODE.set(this.root, editor);
        editor.window = getDefaultView(this.root)!;
        const temp = throttle(() => {
            console.log('selectionchange');
            domSelectionToEditor(editor);
        }, 100);
        editor.onDOMSelectionChange = temp;
        const fn = debounce(temp, 0);
        editor.scheduleOnDOMSelectionChange = fn;
        this.selctionchange = document.addEventListener('selectionchange', fn);
        let isFirst = true;
        editor.on('change', () => {
            const root = this.$el as HTMLElement;
            // focus
            const isFocused = isFirst ? !!editor.autoFocus : editor.focus;
            // 必须添加 preventScroll 选项，否则弹窗或者编辑器失焦会导致编辑区域自动滚动到顶部
            isFocused && (isFirst ? promiseResolveThen(() => editor.focusFn()) : root.focus({preventScroll: true}));
            isFirst = false;
        });
    }
    onCreated() {
        setTimeout(() => {
            this.init(this.editor);
        });
    }
    get children() {
        return this.editor?.children;
    }
}
export default Editable;
