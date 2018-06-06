import { ComponentsDefinitionV10X } from './components-types-v1_0_x';

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
            component: ComponentsDefinitionV10X['components'][0];
            directives: {
                [key: string]: {
                    type: DirectiveType;
                    tag: string;    // tag name (lowercased)
                };
            };
            properties: {
                [name: string]: {
                    property: ComponentsDefinitionV10X['componentProperties'][0];
                    directiveKey: string | null;
                };
            };
        };
    };
}
