/**
 * Utils which parse components definition
 */

import * as path from 'path';
import * as htmlparser from 'htmlparser2';
const merge = require('lodash/merge');
import { DirectiveType, ComponentSet, ComponentsDefinition, Component, ParsedComponent, ComponentProperty } from '../models';
import { GetFileContentType } from '..';

/**
 * Returns information about directives
 *
 * @param content HTML content of the component
 * @returns ParsedComponentsDefinition['components']['name']['directives']
 */
function parseDirectives(content: string) : ComponentSet['components']['name']['directives'] {
    const result = {} as ComponentSet['components']['name']['directives'];
    const parser = new htmlparser.Parser({
        onopentag: (name, attributes) => {
            Object.keys(attributes).forEach(key => {
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
        }
    });
    parser.write(content);
    parser.end();
    return result;
}

/**
 * Find directive type using passed string
 *
 * @param directiveName
 * @returns DirectiveType
 */
function getDirectiveType(directiveName: string) : DirectiveType {
    for (let key in DirectiveType) {
        if (DirectiveType[key] === directiveName) {
            return DirectiveType[<DirectiveType>key];
        }
    }
    return DirectiveType.unknown;
}

/**
 * Parses the components definition into the object which contains all needed data to make needed validations
 * It already validates:
 * - existing of component properties
 * - existing of directive which properties point to
 * - if directive keys are unique within a component html template
 * - if group names are unique
 *
 * @param componentsDefinition
 * @param getFileContent
 * @returns Promise<ParsedComponentsDefinition>
 */
export async function parseDefinition(
    componentsDefinition: ComponentsDefinition,
    getFileContent: GetFileContentType,
) : Promise<ComponentSet> {

    const result: ComponentSet = {
        name: componentsDefinition.name,
        description: componentsDefinition.description,
        version: componentsDefinition.version,

        components: {},
        groups: componentsDefinition.groups,
        defaultComponentOnEnter: componentsDefinition.defaultComponentOnEnter,
        conversionRules: componentsDefinition.conversionRules,
        scripts: componentsDefinition.scripts || [],
    };
    for (let i = 0; i < componentsDefinition.components.length; i++) {
        const compDef = componentsDefinition.components[i];
        result.components[compDef.name] = await parseComponent(compDef, componentsDefinition.componentProperties, getFileContent);
    }

    return result;
}

async function parseComponent(
    component: Component,
    componentProperties: ComponentProperty[],
    getFileContent: GetFileContentType
) : Promise<ParsedComponent> {
    const htmlContent = await getFileContent(path.normalize(`./templates/html/${component.name}.html`), { encoding: 'utf8' });
    const directives = parseDirectives(htmlContent);

    return merge(component, {
        directives: directives,
        properties: component.properties && component.properties.reduce((properties, property) => {
            let propertyName: string;

            // Parse the property. Can either be defined as just a name or an object
            let propertyConfiguration;
            if (isPropertyObject(property)) {
                // The object form may have a name set
                propertyName = property.name;
                if (!propertyName) {
                    // No name means the property is defined anonymously.
                    propertyConfiguration = property;
                } else {
                    // Otherwise the property is merged with componentProperties entry. This entry must exist
                    propertyConfiguration = componentProperties.find((item) => item.name === propertyName);
                    if (!propertyConfiguration) {
                        throw new Error(`Property is not found "${property.name}"`);
                    }
                    propertyConfiguration = merge({}, propertyConfiguration, property);
                }
            } else {
                // String form refers to an entry in componentProperties. Already validated by json schema.
                propertyName = <string>property;

                propertyConfiguration = componentProperties.find((item) => item.name === propertyName);
                if (!propertyConfiguration) {
                    throw new Error(`Property is not found "${property}"`);
                }
            }

            properties.push(propertyConfiguration);
            if (propertyConfiguration.directiveKey && !(propertyConfiguration.directiveKey in directives)) {
                throw new Error(`Directive with key "${propertyConfiguration.directiveKey}" is not found. Property name is "${propertyName || '<anonymous property>'}"`);
            }
            return properties;
        }, [] as ComponentProperty[]) || [],
    });
}

function isPropertyObject(property: any): property is ComponentProperty {
    return property instanceof Object;
}
