import {DirectiveRegistry} from 'slim-js';

/** @type {import('../typedefs.js').Directive} */
const refDirective = {
    attribute: (_: any, nodeName: string) => nodeName === '#ref',
    process: function ({attribute, targetNode, scopeNode}: any) {
        const propertyName = attribute.value;
        Object.defineProperty(scopeNode, propertyName, {
            value: targetNode,
            configurable: true
        });
        return {
            removeAttribute: true
        };
    },
    noExecution: true
};

DirectiveRegistry.add(refDirective);
