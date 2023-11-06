import {Utils, Internals, DirectiveRegistry, Slim} from 'slim-js';

const {dashToCamel} = Utils;
const {debug, block} = Internals;

/** @type {import('../typedefs.js').Directive} Directive */
const propertyDirective = {
    attribute: (_: any, nodeName: string) => nodeName.startsWith('.'),
    process: ({attributeName, targetNode}: any) => {
        const propertyName = dashToCamel(attributeName.slice(1));

        return {
            update: (/** @type {any} */ value: any) => {
                if (targetNode[block] === 'abort') return;
                /** @type {any} **/ targetNode[propertyName] = value;
            },
            removeAttribute: !Slim[debug]
        };
    }
};
DirectiveRegistry.add(propertyDirective);
