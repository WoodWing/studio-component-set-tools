/**
 * Utils which parse components definition
 */

import * as htmlparser from 'htmlparser2';
import {
    Component,
    ComponentProperty,
    ComponentRendition,
    ComponentsDefinition,
    ComponentSet,
    DirectiveType,
    GetFileContentType,
    ParsedComponent,
} from '../models';
import merge = require('lodash.merge');

/**
 * Parses the components definition into the object which contains all needed data to make needed validations
 * It already validates:
 * - existing of component properties
 * - existing of directive which properties point to
 * - if directive keys are unique within a component html template
 * - if group names are unique
 * - if components have HTML rendition
 *
 * @param componentsDefinition
 * @param getFileContent
 * @returns Promise<ParsedComponentsDefinition>
 */
export async function parseDefinition(
    componentsDefinition: ComponentsDefinition,
    getFileContent?: GetFileContentType,
): Promise<ComponentSet> {
    const componentSet: ComponentSet = {
        name: componentsDefinition.name,
        description: componentsDefinition.description,
        version: componentsDefinition.version,

        components: {},
        groups: componentsDefinition.groups,
        defaultComponentOnEnter: componentsDefinition.defaultComponentOnEnter,
        defaultComponentContent: {},
        conversionRules: componentsDefinition.conversionRules,
        shortcuts: componentsDefinition.shortcuts,
        scripts: componentsDefinition.scripts || [],
        customStyles: componentsDefinition.customStyles || [],
    };
    const rendition = ComponentRendition.HTML;
    // copy source because renditions may be added to the components
    const sourceDefinition = merge({}, componentsDefinition);
    for (const compDef of sourceDefinition.components) {
        if (getFileContent && !hasRendition(compDef, rendition)) {
            await loadRendition(compDef, rendition, getFileContent);
        }
        componentSet.components[compDef.name] = parseComponent(
            compDef,
            sourceDefinition.componentProperties,
            rendition,
        );
    }
    // build "defaultComponentContent" property
    buildComponentSetDefaultContent(componentSet);

    return componentSet;
}

/**
 * Returns information about directives
 *
 * @param content HTML content of the component
 * @returns ParsedComponentsDefinition['components']['name']['directives']
 */
function parseDirectives(content: string): ComponentSet['components']['name']['directives'] {
    const result = {} as ComponentSet['components']['name']['directives'];
    const parser = new htmlparser.Parser({
        onopentag: (name, attributes) => {
            Object.keys(attributes).forEach((key) => {
                const keyLowerCased = key.toLowerCase();
                const prefix = 'doc-';
                if (keyLowerCased.indexOf(prefix) === 0) {
                    const directiveType = getDirectiveType(keyLowerCased.substr(prefix.length));
                    const directiveKey = attributes[key];
                    if (directiveKey in result) {
                        throw new Error(`Directive's attributes must be unique. Attribute value is "${directiveKey}"`);
                    }
                    result[directiveKey] = {
                        type: directiveType,
                        tag: name.toLowerCase(),
                    };
                }
            });
        },
    });
    parser.write(content);
    parser.end();
    return result;
}

/**
 * Find directive type using passed string
 */
function getDirectiveType(directiveName: string): DirectiveType {
    return (
        Object.values(DirectiveType).find((directiveType) => directiveType === directiveName) || DirectiveType.unknown
    );
}

/**
 * Checks if component has needed rendition
 *
 * @param component
 * @param rendition
 */
function hasRendition(component: Component, rendition: ComponentRendition): boolean {
    return Boolean(component.renditions && rendition in component.renditions);
}

/**
 * Loads needed rendition to the component
 *
 * @param component
 * @param rendition
 * @param getFileContent
 */
async function loadRendition(
    component: Component,
    rendition: ComponentRendition,
    getFileContent: GetFileContentType,
): Promise<Component> {
    if (!component.renditions) {
        component.renditions = {};
    }
    component.renditions[rendition] = (await getFileContent(`./templates/${rendition}/${component.name}.html`, {
        encoding: 'utf8',
    })) as string;
    return component;
}

/**
 * Parses a component
 *
 * @param component
 * @param componentProperties
 * @param rendition
 */
function parseComponent(
    component: Component,
    componentProperties: ComponentProperty[],
    rendition: ComponentRendition,
): ParsedComponent {
    if (!hasRendition(component, rendition)) {
        throw new Error(`Component "${component.name}" doesn't have "${rendition}" rendition`);
    }
    const directives = parseDirectives((component.renditions && component.renditions[rendition]) || '');

    return merge({}, component, {
        directives: directives,
        properties: (component.properties || []).map((componentProperty) => {
            const property = parseProperty(componentProperty, componentProperties);
            validateDirective(property.directiveKey, directives, component.name, property.name);
            parseConditionalChildProperties(property, componentProperties, directives, component.name);
            return property;
        }),
        noCreatePermission: false,
    });
}

/**
 * Parses a property
 *
 * @param componentProperty
 * @param componentProperties
 */
function parseProperty(
    componentProperty: ComponentProperty | string,
    componentProperties: ComponentProperty[],
): ComponentProperty {
    return isPropertyObject(componentProperty)
        ? parseComponentPropertyObject(componentProperty, componentProperties)
        : findComponentPropertyTemplate(componentProperty, componentProperties);
}

function parseComponentPropertyObject(componentProperty: ComponentProperty, componentProperties: ComponentProperty[]) {
    // No name means the property is defined anonymously.
    // Otherwise the property is merged with componentProperties entry. This entry must exist
    return componentProperty.name
        ? merge({}, findComponentPropertyTemplate(componentProperty.name, componentProperties), componentProperty)
        : componentProperty;
}

function findComponentPropertyTemplate(propertyName: string, componentProperties: ComponentProperty[]) {
    const propertyTemplate = componentProperties.find((item) => item.name === propertyName);
    if (!propertyTemplate) {
        throw new Error(`Property "${propertyName}" is not found in definition componentProperties`);
    }
    return propertyTemplate;
}

function isPropertyObject(property: unknown): property is ComponentProperty {
    return property instanceof Object;
}

function parseConditionalChildProperties(
    property: ComponentProperty,
    componentProperties: ComponentProperty[],
    directives: ComponentSet['components']['name']['directives'],
    componentName: string,
) {
    if (!property.childProperties || property.childProperties.length === 0) return;

    property.childProperties = property.childProperties.map((conditionalChildProperties) => ({
        ...conditionalChildProperties,
        properties: conditionalChildProperties.properties.map((componentProperty) => {
            const childProperty = parseProperty(componentProperty, componentProperties);
            validateDirective(childProperty.directiveKey, directives, componentName, childProperty.name);
            return childProperty;
        }),
    }));
}

function validateDirective(
    directiveKey: string | undefined,
    directives: ComponentSet['components']['name']['directives'],
    componentName: string,
    propertyName: string,
) {
    if (directiveKey && !(directiveKey in directives)) {
        throw new Error(
            `Directive with key "${directiveKey}" is not found in component "${componentName}". Property name is "${
                propertyName || '<anonymous property>'
            }".`,
        );
    }
}

/**
 * Builds default content for when a component is created.
 * This goes through the component properties and looks for default values.
 * These defaultValues are stored in a model object, that's used as initial
 * data for the component when inserted.
 *
 * Default values are only supported for the basic data types (styles, inlineStyles and data).
 * Directive default values are excluded for now, as in general they are not needed.
 * In case we do want to expand support, consider trying to merge the logic of creating default
 * content with the properties classes, as both deal with the article format.
 * Alternatively the default values could be set after component creation, but this would
 * generate more data operations and trigger more view updates (needs to be tested through).
 *
 * @param componentSet
 */
function buildComponentSetDefaultContent(componentSet: ComponentSet): void {
    for (const component of Object.values(componentSet.components)) {
        buildComponentDefaultContent(componentSet.defaultComponentContent, component);
    }
}

/**
 * Build default component model for given component and add to defaultComponentContent input.
 *
 * @param defaultComponentContent
 * @param component
 */
function buildComponentDefaultContent(
    defaultComponentContent: ComponentSet['defaultComponentContent'],
    component: ParsedComponent,
): void {
    for (const property of component.properties) {
        buildComponentPropertyDefaultContent(defaultComponentContent, component.name, property);
        buildConditionalChildPropertiesDefaultContent(defaultComponentContent, component.name, property);
    }
}

function buildConditionalChildPropertiesDefaultContent(
    defaultComponentContent: ComponentSet['defaultComponentContent'],
    componentName: string,
    property: ComponentProperty,
) {
    if (!property.childProperties || property.childProperties.length === 0) return;

    const childProperties = property.childProperties.find(
        (candidate) => candidate.matchExpression === property.defaultValue,
    );

    if (!childProperties) return;

    for (const childProperty of childProperties.properties) {
        buildComponentPropertyDefaultContent(
            defaultComponentContent,
            componentName,
            childProperty as ComponentProperty,
        );
    }
}

/**
 * Build default component model property data and add to defaultComponentContent.
 *
 * @param defaultComponentContent
 * @param componentName
 * @param property
 */
function buildComponentPropertyDefaultContent(
    defaultComponentContent: ComponentSet['defaultComponentContent'],
    componentName: string,
    property: ComponentProperty,
): void {
    // No default value
    if (!property.defaultValue) {
        return;
    }

    switch (property.dataType) {
        case 'styles':
            addDefaultPropertyContent(
                defaultComponentContent,
                'styles',
                componentName,
                property.name,
                property.defaultValue,
            );
            break;
        case 'inlineStyles':
            addDefaultPropertyContent(
                defaultComponentContent,
                'inlineStyles',
                componentName,
                property.name,
                property.defaultValue,
            );
            break;
        case 'data':
            addDefaultPropertyContent(
                defaultComponentContent,
                'data',
                componentName,
                property.name,
                property.defaultValue,
            );
            break;
        default:
        // Note: validator doesn't allow such a value in component definitions
    }
}

/**
 * Adds default value to default component model.
 * Creates necessary structure when needed.
 *
 * @param defaultComponentContent
 * @param dataTypeKey
 * @param componentName
 * @param propertyName
 * @param value
 */
function addDefaultPropertyContent(
    defaultComponentContent: ComponentSet['defaultComponentContent'],
    dataTypeKey: ComponentProperty['dataType'],
    componentName: string,
    propertyName: string,
    value: ComponentProperty['defaultValue'],
): void {
    if (!defaultComponentContent[componentName]) {
        defaultComponentContent[componentName] = {};
    }
    defaultComponentContent[componentName][dataTypeKey] = merge(
        defaultComponentContent[componentName][dataTypeKey] || {},
        {
            [propertyName]: value,
        },
    );
}
