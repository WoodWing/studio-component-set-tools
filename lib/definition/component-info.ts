import { ComponentsDefinition, ComponentDefinition, ComponentRendition } from '../models/components-definition';
import { ComponentField, ComponentSetInfo, ComponentInfoFields } from '../models/component-set-info';
import { RenditionResolver, processTemplates } from './process-templates';
import parse5 = require('parse5');

const directivePrefix = 'doc-';

/**
 * Creates partial info definitions of the component set.
 *
 * This information is provided with custom channel publish messages. Integrators can use
 * the info to interpret the given digital article without additional API requests.
 */
export async function generateComponentSetInfo(
    componentsDefinition: ComponentsDefinition,
    renditionResolver: RenditionResolver,
): Promise<ComponentSetInfo> {
    await processTemplates(renditionResolver, componentsDefinition);
    return processInfo(componentsDefinition);
}

/**
 * @see generateComponentSetInfo
 *
 * This implementation can be used when the components definition already contains the rendition information.
 */
export function processInfo(componentsDefinition: ComponentsDefinition): ComponentSetInfo {
    return {
        components: componentsDefinition.components.reduce((result, component) => {
            result[component.name] = {
                fields: parseFields((<{ html: string }>component.renditions)[ComponentRendition.HTML]),
            };
            result[component.name].fields.forEach((f) => addRestrictChildrenInfo(componentsDefinition, component, f));
            return result;
        }, {} as ComponentInfoFields),
    };
}

function parseFields(template: string): ComponentField[] {
    const componentFields: ComponentField[] = [];
    const templateFragment = parse5.parseFragment(template) as parse5.DocumentFragment;

    parseNodes(componentFields, templateFragment.childNodes as parse5.Element[]);

    return componentFields;
}

function parseNodes(componentFields: ComponentField[], nodes: parse5.Element[]): void {
    if (!nodes) {
        return;
    }
    nodes.forEach((node) => parseNode(componentFields, node));
}

function parseNode(componentFields: ComponentField[], node: parse5.Element): void {
    // parse attributes before child nodes, as the fields should be ordered
    parseAttributes(componentFields, node.attrs);

    parseNodes(componentFields, node.childNodes as parse5.Element[]);
}

function parseAttributes(componentFields: ComponentField[], attrs?: parse5.Attribute[]): void {
    if (!attrs) {
        return;
    }

    attrs.forEach((attr) => {
        if (!attr.name.startsWith(directivePrefix)) {
            return;
        }
        componentFields.push({
            contentKey: attr.value,
            type: attr.name.replace(directivePrefix, ''),
        });
    });
}

function addRestrictChildrenInfo(
    componentDefinition: ComponentsDefinition,
    component: ComponentDefinition,
    field: ComponentField,
): void {
    if (field.type !== 'container') {
        return;
    }

    let allowedComponentsNames = componentDefinition.components
        .filter((def) => !(def.allowNesting === 'no' || def.name === component.name))
        .map((def) => def.name);
    if (component.restrictChildren) {
        const restrictChildren = Object.keys(component.restrictChildren);
        allowedComponentsNames = restrictChildren.filter((child) => allowedComponentsNames.includes(child));
    }
    field.restrictChildren = allowedComponentsNames;
}
