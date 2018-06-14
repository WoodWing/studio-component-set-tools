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
            properties: ComponentsDefinition['componentProperties'][0][];
        };
    };
    groups: {
        [name: string]: ComponentsDefinition['groups'][0];
    };
    defaultComponentOnEnter: string;
    conversionRules: ComponentsDefinition['conversionRules'];
}
// a few shortcuts
export type ParsedComponentsDefinitionComponent = ParsedComponentsDefinition['components']['name'];
export type ParsedComponentsDefinitionDirective = ParsedComponentsDefinitionComponent['directives']['key'];
export type ParsedComponentsDefinitionGroup = ParsedComponentsDefinition['groups']['name'];
