import editableCss from '../../../css/editable';
const string = `
<div class="editor-scroll" style="{{ scroll ? 'overflow-y:auto': '' }}" @srcoll="actionScroll">
  <div class="input-editor" contenteditable="true" >

  </div>
</div>
<style>
${editableCss}
</style>
`;

export default string;
