import {Slim} from 'slim-js';
import {tag, useShadow} from 'slim-js/decorators';

@tag('free-children')
@useShadow(false)
export default class freeChilren extends Slim {
    constructor() {
        super();
        this.html = this.parseHtml(this.item);
        freeChilren.template = this.html;
    }
    onCreated() {}
    parseHtml(children: any): any {
        if (Array.isArray(children)) {
            let str = '';
            children.forEach(child => {
                if (child && child.type === 'p') {
                    str += `<p data-slate-node="element">${this.parseHtml(child.children)}</p>`;
                } else if (child && 'text' in child) {
                    str += `<span data-slate-node="text">${child.text ? `<span data-slate-leaf="true">${child.text}</span>` : `<span data-slate-leaf="true"><span  data-slate-zero-width="n" data-slate-length="${child.text.length}">&#xFEFF;<br></span></span>`}</span>`;
                }
            });
            return str;
        } else {
            if ('text' in children) {
                return `<span data-slate-node="text">${children.text}</span>`;
            } else if (children.type === 'p') {
                return `<p data-slate-node="element">${this.parseHtml(children.children)}</p>`;
            }
        }
        //
    }
}
