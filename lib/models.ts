import { ComponentsDefinitionV10X } from './components-types-v1_0_x';
import { ComponentsDefinitionV11X } from './components-types-v1_1_x';
import { ComponentsDefinitionV13X } from './components-types-v1_3_x';

export type ComponentsDefinition = ComponentsDefinitionV13X;

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

export interface ParsedComponentsDefinition<T extends ComponentsDefinition> {
    components: {
        [name: string]: {
            component: T['components'][0];
            directives: {
                [key: string]: {
                    type: DirectiveType;
                    tag: string;    // tag name (lowercased)
                };
            };
            properties: T['componentProperties'][0][];
        };
    };
    groups: T['groups'];
    defaultComponentOnEnter: string;
    conversionRules: T['conversionRules'];
    conversionShortcutComponents?: T['conversionShortcutComponents'];
    scripts: T['scripts'];
}
export type ParsedComponentsDefinitionV10X = ParsedComponentsDefinition<ComponentsDefinitionV13X>;
export type ParsedComponentsDefinitionV11X = ParsedComponentsDefinition<ComponentsDefinitionV11X>;

// a few shortcuts
export type ParsedComponentsDefinitionComponent = ParsedComponentsDefinitionV10X['components']['name'];
export type ParsedComponentsDefinitionProperty = ParsedComponentsDefinitionV10X['components']['name']['properties'][0];
export type ParsedComponentsDefinitionDirective = ParsedComponentsDefinitionComponent['directives']['key'];
export type ParsedComponentsDefinitionGroup = ParsedComponentsDefinitionV10X['groups'][0];
