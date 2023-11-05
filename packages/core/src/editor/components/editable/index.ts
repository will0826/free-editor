import {Slim} from 'slim-js';
import {tag, template} from 'slim-js/decorators';
import tagValue from './tag';
import createEditor from '../../index';
import {BeforeInputEventType, IEditor} from '../../../types/interface';

@tag('editable-box')
@template(tagValue)
class Editable extends Slim {
    constructor() {
        super();
        this.editor = createEditor({}) as IEditor;
    }
    handleBeforeInput(event: BeforeInputEventType) {}
}
export default Editable;
