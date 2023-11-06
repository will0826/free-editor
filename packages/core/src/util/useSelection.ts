import {FreeEditor} from '../editor/free-editor';
import {IEditor} from '../types/interface';
import {Editor, Transforms} from 'slate';

export const useSelection = <T extends IEditor>(editor: T) => {
    // 自定义事件
    editor.focusFn = (isEnd?: boolean) => {
        const el = FreeEditor.toDOMNode(editor, editor);
        const root = FreeEditor.findDocumentOrShadowRoot(editor);
        editor.focus = true;
        if (root.activeElement === el) return;
        if (isEnd) {
            const end = Editor.end(editor, []);
            Transforms.select(editor, end);
        }
        el.focus({preventScroll: true});
    };

    editor.blur = () => {
        const el = FreeEditor.toDOMNode(editor, editor);
        const root = FreeEditor.findDocumentOrShadowRoot(editor);
        editor.focus = false;
        if (root.activeElement !== el) return;
        el.blur();
    };

    return editor;
};
