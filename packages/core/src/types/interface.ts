import type {Editor} from 'slate';
import {IOptions} from './option';

export interface IEditor extends Editor {
    config: IOptions;
    isComposing: boolean;
    focus: boolean;
    isReadOnly: boolean;
    insertData: (data: DataTransfer) => void;
    insertFragmentData: (data: DataTransfer) => boolean;
    insertTextData: (data: DataTransfer) => boolean;
    setFragmentData: (data: DataTransfer, originEvent?: 'drag' | 'copy' | 'cut') => void;
}

export interface BeforeInputEventType extends Event {
    data: string | null;
    dataTransfer: DataTransfer | null;
    inputType: string;
    isComposing: boolean;
}
