/**
 * Utils which parse components definition
 */

import * as path from 'path';
import { ComponentsDefinitionV10X } from '../components-types-v1_0_x';
import { DirectiveType, ParsedComponentsDefinition } from '../models';

/**
 * Returns information about directives
 *
 * @param content HTML content of the component
 * @returns ParsedComponentsDefinition['components']['name']['directives']
 */
function parseDirectives(content: string) : ParsedComponentsDefinition['components']['name']['directives'] {
    const regexTags = /<([a-z_\-]+).*?\s+doc-[a-z\d\-]+=['"]?[a-z\d\-]+['"]?.*?>/gmi;
    const regexDirectives = /\sdoc-([a-z\d\-_]+)=['"]?([a-z\d\-_]+)['"]?/gmi;
    const result = {} as ParsedComponentsDefinition['components']['name']['directives'];
    let matchTags;
    let matchDirectives;
    // tslint:disable-next-line:no-conditional-assignment
    while ((matchTags = regexTags.exec(content)) !== null) {
        const tagContent = matchTags[0];
        const tagName = matchTags[1].toLowerCase();
        // tslint:disable-next-line:no-conditional-assignment
        while ((matchDirectives = regexDirectives.exec(tagContent)) !== null) {
            const directiveType = getDirectiveType(matchDirectives[1].toLowerCase());
            const directiveKey = matchDirectives[2];
            if (directiveKey in result) {
                throw new Error(`Directive's attributes must be uniq. Attribute value is "${directiveKey}"`);
            }
            result[directiveKey] = {
                type: directiveType,
                tag: tagName
            };
        }
    }
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
    componentsDefinition: ComponentsDefinitionV10X,
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
