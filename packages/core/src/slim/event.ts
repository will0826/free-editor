import {DirectiveRegistry, Utils} from 'slim-js';

const {dashToCamel: d2c, memoize, createFunction} = Utils;

const dashToCamel = memoize(d2c);
const syntaxRegexp = /(.+)(\((.*)\)){1}/;

/** @type {import('../typedefs').Directive} */
const eventDirective = {
    attribute: (_: any, nodeName: string) => nodeName.startsWith('@'),
    process: ({attributeName, targetNode, scopeNode, expression: ex, context}: any) => {
        const eventName = dashToCamel(attributeName.slice(1));
        const isMethodExecute = syntaxRegexp.test(ex || '');
        const eventHandler = function (/** @type {Event} */ event: any) {
            const execution = createFunction('event', 'item', `return ${ex};`);
            /** @type {Function|undefined} */
            let method;
            if (!isMethodExecute) {
                method = execution.call(scopeNode);
            }
            if (method) {
                return method(event, context);
            } else {
                return execution.call(scopeNode, event, context());
            }
        };
        targetNode.addEventListener(eventName, eventHandler);
        return {
            removeAttribute: true
        };
    }
};

DirectiveRegistry.add(eventDirective);
