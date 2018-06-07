/**
 * Utils which parse components definition
 */

import * as path from 'path';
import * as htmlparser from 'htmlparser2';
import { DirectiveType, ParsedComponentsDefinition, ComponentsDefinition } from '../models';

/**
 * Returns information about directives
 *
 * @param content HTML content of the component
 * @returns ParsedComponentsDefinition['components']['name']['directives']
 */
function parseDirectives(content: string) : ParsedComponentsDefinition['components']['name']['directives'] {
    const result = {} as ParsedComponentsDefinition['components']['name']['directives'];
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
 * 
 * @param componentsDefinition
 * @param getFileContent
 * @returns Promise<ParsedComponentsDefinition>
 */
export async function parseDefinition(
    componentsDefinition: ComponentsDefinition,
    getFileContent: (filePath: string) => Promise<string>,
) : Promise<ParsedComponentsDefinition> {

    const result = {
        components: {},
    } as ParsedComponentsDefinition;

    // parse directives
    for (let component of componentsDefinition.components) {
        const htmlContent = await getFileContent(path.normalize(`./templates/html/${component.name}.html`));
        result.components[component.name] = {
            component: component,
            directives: parseDirectives(htmlContent),
            properties: component.properties && component.properties.reduce((properties, property) => {
                const [propertyName, directiveKey] = property.split(':');
                const propertyConfiguration = componentsDefinition.componentProperties.find((item) => item.name === propertyName);
                if (!propertyConfiguration) {
                    throw new Error(`Property is not found "${property}"`);
                }
                properties[property] = {
                    property: propertyConfiguration,
                    directiveKey: directiveKey || null,
                };
                return properties;
            }, {} as ParsedComponentsDefinition['components']['name']['properties']) || {},
        };
    }

    return result;
}
