import { Component, ComponentProperty, ComponentGroup, ComponentConversionRules } from './components-definition';

/**
 * Defines the model for component sets.
 *
 * Compared to the component definition, this is the parsed model.
 * - Each component has a full properties list with the definitions
 * - componentProperties list is removed, as it's merged into the component property lists
 */
export interface ComponentSet {
    /**
     * Name of the components package
     */
    name: string;

    /**
     * Description of components package
     */
    description?: string;

    /**
     * Version of matching components model
     */
    version: string;

    /**
     * Default component inserted on pressing enter in a text field
     */
    defaultComponentOnEnter: string;

    /**
     * Map component identifiers to their parsed model.
     */
    components: {
        [name: string]: ParsedComponent;
    };

    /**
     * List of groups shown in component chooser dialog
     */
    groups: ComponentGroup[];

    /**
     * Conversion rules for transforming one component into another component
     */
    conversionRules: ComponentConversionRules;

    /**
     * List of components for conversion using the shortcuts
     */
    conversionShortcutComponents?: string[];

    /**
     * List of scripts to be included for html rendition of article
     */
    scripts?: string[];
}

export interface ParsedComponent extends Component {
    /**
     * Parsed complete properties of component.
     */
    properties: ComponentProperty[];

    /**
     * Information about directives, added after parsing.
     */
    directives: {
        [key: string]: {
            type: DirectiveType;
            tag: string;    // tag name (lowercased)
        };
    };
}

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
