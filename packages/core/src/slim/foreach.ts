import {processDOM, removeBindings, Internals, DirectiveRegistry} from 'slim-js';
const {block, repeatCtx, internals, index} = Internals;

const REPEAT = '*foreach';
const FOREACH = Symbol();
const delRng = new Range();

/**
 * @type {import('../typedefs.js').Directive}
 */
const forEachDirective = {
    attribute: (_: any, nodeName: string) => nodeName === REPEAT,
    process: ({targetNode: tNode, scopeNode: scope, expression: ex}: any) => {
        const tplElement = document.createElement('template');
        tNode[block] = 'abort';
        tNode.removeAttribute(REPEAT);
        const template = /** @type {HTMLElement} */ tNode.outerHTML;
        const hook = document.createComment(`*foreach`);
        const parent = tNode.parentElement || tNode.parentNode || scope.shadowRoot || scope;
        parent.insertBefore(hook, tNode);

        /** @type {HTMLElement[]} */
        const clones: any = [];

        function update(/** @type {any[]} */ dataSource = []) {
            const dl = dataSource.length;
            let cl = clones.length;
            if (dl < cl) {
                const {[dl]: first, [cl - 1]: last} = clones;
                delRng.setStartBefore(first);
                delRng.setEndAfter(last);
                delRng.deleteContents();
                clones.slice(dl).forEach((clone: any) => {
                    clone[internals][FOREACH].clear();
                    removeBindings(scope, clone);
                });
                clones.length = dl;
            }
            cl = clones.length;
            tplElement.innerHTML = template.repeat(Math.max(0, dl - cl));
            delRng.selectNodeContents(tplElement.content);
            const frag = delRng.extractContents();
            const newNodes = /** @type {HTMLElement[]} */ Array.from(frag.children);
            newNodes.forEach((clone: any, idx) => {
                clone[repeatCtx] = dataSource[clones.length + idx];
                const {bounds, clear} = processDOM(scope, clone);
                clone[internals] = clone[internals] || {};
                clone[internals][FOREACH] = {bounds, clear};
                bounds.forEach((f: () => any) => f());
            });
            parent.insertBefore(frag, hook);
            clones.forEach((clone: any, idx: any) => {
                clone[repeatCtx] = dataSource[idx];
                clone[internals][FOREACH].bounds.forEach((f: any) => f());
            });
            clones.push(...newNodes);
        }

        return {update, removeNode: true};
    }
};

DirectiveRegistry.add(forEachDirective, true);
