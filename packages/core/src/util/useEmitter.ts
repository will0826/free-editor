import {IEditor} from '../types/interface';
import {EventEmitter} from './eventemitter';

export const useEmitter = <T extends IEditor>(editor: T) => {
    // 自定义事件
    const eventBus = new EventEmitter();
    editor.on = (type, listener) => {
        eventBus.on(type, listener);
        return () => eventBus.off(type, listener);
    };
    editor.once = (type, listener) => eventBus.once(type, listener);
    editor.off = (...args) => eventBus.off(...args);
    editor.emit = (type, ...args: any[]) => eventBus.emit(type, ...args);
    return editor;
};
