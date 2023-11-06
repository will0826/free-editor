import {createEditor} from 'slate';
import Editable from './components/editable/index';
import freeChilren from './components/children/index';
import {IOptions} from '../types/option';
import {IEditor} from '../types/interface';
import '../slim/all';
import {useEmitter} from '../util/useEmitter';
import {useSelection} from '../util/useSelection';
import {useContent} from '../util/useContent';

export default function (options: IOptions) {
    const editor = createEditor() as IEditor;
    editor.config = options;
    editor.children = [{type: 'p', children: [{text: ''}]}] as any;
    useEmitter(editor);
    useSelection(editor);
    useContent(editor);
    return editor;
}

export {Editable, freeChilren};
