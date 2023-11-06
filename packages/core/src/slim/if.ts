import {DirectiveRegistry, Internals, processDOM} from 'slim-js';
const {block} = Internals;

/**
 * @param {Element} src
 * @param {any} scope
 */
const createCopy = (src: any, scope: any) => {
    const copy = /** @type {HTMLElement} */ src.cloneNode(true);
    const {clear, bounds} = processDOM(scope, copy);
    return {
        clear,
        bounds,
        copy
    };
};

/**
 * @type {import('../typedefs.js').Directive}
 */
const ifDirective = {
    attribute: (_: any, name: string) => name === '*if',
    process: ({scopeNode, targetNode, expression: ex}: any) => {
        const hook = document.createComment(`*if`);
        targetNode[block] = 'abort';
        targetNode.removeAttribute('*if');
        targetNode.parentNode?.insertBefore(hook, targetNode);
        let copy: any, bounds: any, clear: any;
        const update = (/** @type {any} */ value: any) => {
            if (value) {
                !copy && ({copy, bounds, clear} = createCopy(targetNode, scopeNode));
                bounds.forEach((f: any) => f());
                hook.parentNode?.insertBefore(copy, hook);
            } else if (copy) {
                copy.remove();
                clear();
                copy = bounds = clear = undefined;
            }
        };
        return {
            update,
            removeNode: true,
            removeAttribute: true
        };
    },
    noExecution: false
};
DirectiveRegistry.add(ifDirective);
