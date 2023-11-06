import editableCss from '../../../css/editable';
const string = `
<div class="editor-scroll" style="{{ scroll ? 'overflow-y:auto': '' }}" @srcoll="actionScroll">
  <div class="input-editor" #ref="root" data-free-editor contenteditable="true" @beforeinput="this.handleBeforeInput" @focus="this.handleFocus" @click='this.handleClick' ><free-children .item='{{this.children}}'></free-children></div>
</div>
<style>
${editableCss}
</style>
`;

export default string;
