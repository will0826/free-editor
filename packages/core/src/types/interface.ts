import type {BaseRange, Editor} from 'slate';
import {IOptions} from './option';
import {DOMStaticRange} from '../util/dom';

export interface IEditor extends Editor {
    autoFocus?: boolean;
    element: HTMLElement;
    config: IOptions;
    isComposing: boolean;
    focus: boolean;
    isReadOnly: boolean;
    window: Window;
    isUpdatingSelection: boolean;
    isDraggingInternally: boolean;
    lastActiveElement: Element | null;
    onDOMSelectionChange: (...args: any[]) => any;
    scheduleOnDOMSelectionChange: (...args: any[]) => any;
    insertData: (data: DataTransfer) => void;
    insertFragmentData: (data: DataTransfer) => boolean;
    insertTextData: (data: DataTransfer) => boolean;
    setFragmentData: (data: DataTransfer, originEvent?: 'drag' | 'copy' | 'cut') => void;
    on: (type: string, listener: Function) => Function;
    off: (type: string, listener?: Function) => void;
    once: (type: string, listener: Function) => void;
    emit: (type: string, ...args: any[]) => void;
    focusFn: (isEnd?: boolean) => void;
    blur: () => void;
    lastSelection: Range | null | BaseRange;
}

export interface BeforeInputEventType extends Event {
    data: string | null;
    dataTransfer: DataTransfer | null;
    inputType: string;
    isComposing: boolean;
    getTargetRanges(): DOMStaticRange[];
}
