import {IEditor} from '../types/interface';

export const useContent = <T extends IEditor>(editor: T) => {
    const {selection, onChange} = editor;
    selection && (editor.lastSelection = selection);
    // 触发配置的 change 事件
    editor.emit('change');
    onChange();
    return editor;
};
