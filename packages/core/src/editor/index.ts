import {createEditor} from 'slate';
import Editable from './components/editable/index';
import {IOptions} from '../types/option';
import {IEditor} from '../types/interface';
export default function (options: IOptions) {
    const editor = createEditor() as IEditor;
    editor.config = options;
    return editor;
}

export {Editable};
