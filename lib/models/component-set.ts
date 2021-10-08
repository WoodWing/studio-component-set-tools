import {
    ComponentDefinition,
    ComponentProperty,
    ComponentGroup,
    ComponentConversionRules,
    ComponentsDefinitionShortcuts,
    CustomStyle,
} from './components-definition';

/**
 * Defines the model for component sets.
 *
 * Compared to the component definition, this is the parsed model.
 * - Each component has a full properties list with the definitions
 * - componentProperties list is removed, as it's merged into the component property lists
 */
export interface ComponentSet {
    /** Name of the components package */
    name: string;

    /** Description of components package */
    description?: string;

    /** Version of matching components model */
    version: string;

    /** Default component inserted on pressing enter in a text field */
    defaultComponentOnEnter: string;

    /** Default components content */
    defaultComponentContent: {
        [componentName: string]: {
            [dataType in ComponentProperty['dataType']]?: {
                [propertyName: string]: ComponentProperty['defaultValue'];
            };
        };
    };

    /** Map component identifiers to their parsed model. */
    components: {
        [name: string]: Component;
    };

    /** List of groups shown in component chooser dialog */
    groups: ComponentGroup[];

    /** Conversion rules for transforming one component into another component */
    conversionRules: ComponentConversionRules;

    /** Shortcuts configurations */
    shortcuts?: ComponentsDefinitionShortcuts;

    /** List of scripts to be included for html rendition of article */
    scripts: string[];

    /** List of custom styles definitions which can be configured in the look and feel style of an article */
    customStyles: CustomStyle[];
}

export interface Component extends ComponentDefinition {
    /** Parsed complete properties of component. */
    properties: ComponentProperty[];

    /** Information about directives, added after parsing. */
    directives: {
        [key: string]: {
            type: DirectiveType;
            tag: string; // tag name (lowercased)
        };
    };

    /** Flag which forbids creating of the component */
    noCreatePermission: boolean;
}

export enum DirectiveType {
    editable = 'editable',
    container = 'container',
    image = 'image',
    html = 'html',
    slideshow = 'slideshow',
    link = 'link',
    media = 'media',
    interactive = 'interactive',

    unknown = 'unknown',
}
