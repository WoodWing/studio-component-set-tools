import { ComponentsDefinitionV10X } from './components-types-v1_0_x';

export type ComponentsDefinition = ComponentsDefinitionV10X;

export enum DirectiveType {
    editable = 'editable',
    container = 'container',
    image = 'image',
    html = 'html',
    if = 'if',
    slideshow = 'slideshow',
    link = 'link',
    media = 'media',
    interactive = 'interactive',

    unknown = 'unknown',
}

export interface ParsedComponentsDefinition {
    components: {
        [name: string]: {
            component: ComponentsDefinition['components'][0];
            directives: {
                [key: string]: {
                    type: DirectiveType;
                    tag: string;    // tag name (lowercased)
                };
            };
            properties: {
                [name: string]: {
                    property: ComponentsDefinition['componentProperties'][0];
                    directiveKey: string | null;
                };
            };
        };
    };
}
// a few shortcuts
export type ParsedComponentsDefinitionComponent = ParsedComponentsDefinition['components']['name'];
