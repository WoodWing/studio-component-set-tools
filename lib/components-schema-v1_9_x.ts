/**
 * Describes the JSON schema for the components definition file.
 *
 * See http://json-schema.org/ for documentation and examples.
 */

/* tslint:disable:max-line-length variable-name */

import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

const defaultValue: JSONSchema7Definition = {
    type: ['integer', 'string', 'number', 'object', 'boolean'],
    description: 'Default value of property upon component creation. By default the property value is not defined.',
};

function labelProperty(description: string): { oneOf: JSONSchema7Definition[] } {
    return {
        oneOf: [
            {
                type: 'string',
                description: description,
            },
            {
                type: 'object',
                description: description,
                properties: {
                    key: {
                        type: 'string',
                        description: 'String key',
                    },
                    values: {
                        type: 'object',
                        description: 'String replacement variables',
                    },
                },
                additionalProperties: false,
                required: ['key'],
            },
        ],
    };
}

function inlineComponentPropertyDefinitionOrReferenceList(isChildProperty: boolean): {
    oneOf: JSONSchema7Definition[];
} {
    return {
        oneOf: [
            {
                type: 'string',
            },
            {
                type: 'object',
                additionalProperties: false,
                anyOf: [{ required: ['name', 'directiveKey'] }].concat(
                    !isChildProperty ? [{ required: ['name', 'defaultValue'] }] : [],
                ),
                properties: {
                    name: {
                        type: 'string',
                        description: 'Component property identifier',
                        minLength: 3,
                    },
                    directiveKey: {
                        type: 'string',
                        description: 'Directive key for properties that use a directive data type',
                    },
                    defaultValue: defaultValue,
                },
            },
            {
                type: 'object',
                additionalProperties: false,
                required: ['control', 'label'],
                properties: {
                    control: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['type'],
                        properties: {
                            type: {
                                enum: ['header'],
                            },
                        },
                    },
                    label: labelProperty('Header label'),
                },
            },
        ],
    };
}

const componentGroupDefinition: JSONSchema7Definition = {
    type: 'array',
    description: 'List of groups shown in component chooser dialog',
    items: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Unique group identifier',
                minLength: 3,
            },
            label: labelProperty('Group label shown in Digital Editor'),
            components: {
                type: 'array',
                items: { type: 'string' },
                description: 'names of components in this group',
            },
        },
        required: ['name', 'label', 'components'],
    },
};

const componentPropertyDefinition: {
    [key: string]: JSONSchema7Definition;
} = {
    name: {
        type: 'string',
        description: 'Unique identifier of component property',
        minLength: 3,
    },
    label: labelProperty('Display label of Component property'),
    directiveKey: { type: 'string', description: 'Directive key for properties that use a directive data type' },
    control: {
        type: 'object',
        description: 'Type of UI element and options',
        oneOf: [
            {
                additionalProperties: false,
                required: ['type', 'options'],
                properties: {
                    type: {
                        enum: ['select'],
                        description: 'Dropdown with fixed number of options',
                    },
                    dynamicCaptions: {
                        type: 'boolean',
                        description: 'The option captions can be customized',
                    },
                    options: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            properties: {
                                caption: labelProperty('Label of the item'),
                                value: {
                                    type: 'string',
                                    description:
                                        'Value of the item. Omit it if the option should simply clean the property up',
                                },
                            },
                            additionalProperties: false,
                            required: ['caption'],
                        },
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type', 'options'],
                properties: {
                    type: {
                        enum: ['radio'],
                        description: 'Radio control type with fixed number of options',
                    },
                    options: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['caption', 'icon'],
                            properties: {
                                caption: labelProperty('Label of the item'),
                                icon: {
                                    type: 'string',
                                    description: 'Icon shown for the option',
                                },
                                value: {
                                    type: 'string',
                                    description:
                                        'Value of the item. Omit it if the option should simply clean the property up',
                                },
                            },
                        },
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type', 'value'],
                properties: {
                    type: {
                        enum: ['checkbox'],
                        description: 'Checkbox toggling between value and no value',
                    },
                    value: { type: ['boolean', 'string'] },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['text'],
                        description: 'Text field property',
                    },
                    pattern: {
                        type: 'string',
                        description: 'Value validation regexp pattern',
                    },
                    defaultValue: {
                        type: 'string',
                        description: 'Default value which is used instead of empty value',
                    },
                    unit: {
                        type: 'string',
                        description: 'Unit type like em, px etc',
                    },
                    inputPlaceholder: labelProperty('Input placeholder'),
                    readonly: {
                        type: 'boolean',
                        description: 'Makes the text field read only from the editor UI',
                    },
                },
            },
            {
                required: ['type'],
                properties: {
                    type: {
                        enum: ['time'],
                        description: 'Time field property',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['colorPicker'],
                        description: 'Color picker field property',
                    },
                    opacity: {
                        type: 'boolean',
                        description: 'Enable opacity setting',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['image-editor'],
                        description: 'Image editor field property',
                    },
                    focuspoint: {
                        type: 'boolean',
                        description: 'Enable focuspoint feature',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['drop-capital'],
                        description: 'Drop capital field property',
                    },
                    charactersMinimum: {
                        type: 'number',
                        description: 'Minimum value of characters number',
                    },
                    charactersDefault: {
                        type: 'number',
                        description: 'Default value of characters number',
                    },
                    charactersMaximum: {
                        type: 'number',
                        description: 'Maximum value of characters number',
                    },
                    linesMinimum: {
                        type: 'number',
                        description: 'Minimum value of lines number',
                    },
                    linesDefault: {
                        type: 'number',
                        description: 'Default value of lines number',
                    },
                    linesMaximum: {
                        type: 'number',
                        description: 'Maximum value of lines number',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['media-properties'],
                        description: 'Enables media properties field property',
                    },
                    mediaType: {
                        enum: ['video', 'social'],
                        description: 'Defines media type. If omitted then both types are supported',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['fitting'],
                        description: 'Enables fitting option for an image directive',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['slides'],
                        description: 'Adds slides section to component properties (for doc-slideshow)',
                    },
                    include: {
                        type: 'array',
                        description: 'List of properties to include from active slide component properties',
                    },
                    exclude: {
                        type: 'array',
                        description: 'List of properties to exclude from active slide component properties',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type', 'defaultConfig', 'viewLink'],
                properties: {
                    type: {
                        enum: ['interactive'],
                        description: 'Configuration of interactive directive',
                    },
                    defaultConfig: {
                        type: 'object',
                        description: 'Default configuration of interactive directive',
                    },
                    editLink: {
                        type: 'string',
                        format: 'uri',
                        description: 'A link which is used to edit the configuration',
                    },
                    viewLink: {
                        type: 'string',
                        format: 'uri',
                        description: 'A link which is used to show the directive',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['header'],
                        description: 'Adds a header at property position',
                    },
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['textarea'],
                        description: 'Textarea field property',
                    },
                    inputPlaceholder: labelProperty('Textarea placeholder'),
                },
            },
            {
                additionalProperties: false,
                required: ['type'],
                properties: {
                    type: {
                        enum: ['url'],
                        description: 'Url field property',
                    },
                    inputPlaceholder: labelProperty('Url input placeholder'),
                },
            },
            {
                additionalProperties: false,
                required: ['type', 'minValue', 'maxValue', 'stepSize'],
                properties: {
                    type: {
                        enum: ['slider'],
                        description: 'Slider field property',
                    },
                    minValue: {
                        type: 'number',
                        description: 'Minimum value of the slider',
                    },
                    maxValue: {
                        type: 'number',
                        description: 'Maximum value of the slider',
                    },
                    stepSize: {
                        type: 'number',
                        description: 'Step size of the slider',
                    },
                },
            },
        ],
    },
    dataType: {
        enum: [
            'styles',
            'inlineStyles',
            'data',
            'doc-editable',
            'doc-image',
            'doc-html',
            'doc-slideshow',
            'doc-media',
            'doc-interactive',
            'doc-link',
        ],
        description:
            'Type of data being stored and how it is used. For directive data types it may also depend on the control type.',
    },
    defaultValue: defaultValue,
    group: { type: 'string' },
    selector: {
        type: 'string',
        description: 'Additional selector to define elements of the component which the property should be applied to',
    },
    featureFlag: {
        type: 'string',
        description: 'Feature flag that should be present for the property to show up. Always show if not specified.',
    },
    childProperties: {
        type: 'array',
        description: 'List of conditional child properties',
        items: {
            type: 'object',
            properties: {
                matchType: {
                    type: 'string',
                    description: `Defines how to match the value of the parent property`,
                    enum: ['exact-value'],
                },
                matchExpression: {
                    type: ['boolean', 'integer', 'string', 'number'],
                    description: `The expression to use to match the value of the parent property`,
                },
                properties: {
                    type: 'array',
                    items: inlineComponentPropertyDefinitionOrReferenceList(true),
                    description: 'Names of properties this component can use',
                },
            },
            additionalProperties: false,
            required: ['matchType'],
        },
    },
};

export const componentsDefinitionSchema_v1_9_x: JSONSchema7 = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Studio components definition schema',
    description: 'Schema describing the format of the components-definition.json file in a Studio component set.',
    type: 'object',
    properties: {
        name: {
            type: 'string',
            description: 'Name of the components package',
            minLength: 3,
        },
        description: { type: 'string', description: 'Description of components package' },
        version: {
            type: 'string',
            description: 'Version of matching components model',
            pattern: '\\d+.\\d+.\\d+(-next)?',
        },

        defaultComponentOnEnter: {
            type: 'string',
            description: 'Default component inserted on pressing enter in a text field',
        },

        components: {
            type: 'array',
            description: 'List of available components',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Unique component identifier',
                        minLength: 3,
                    },
                    label: labelProperty('Component label shown in Digital Editor'),
                    icon: { type: 'string', description: 'Icon shown for component in Digital Editor' },
                    properties: {
                        type: 'array',
                        items: inlineComponentPropertyDefinitionOrReferenceList(false),
                        description: 'Names of properties this component can use',
                    },

                    selectionMethod: {
                        enum: ['default', 'handle'],
                        description:
                            'How this component is selectable, by default the user can select inside the component to select it',
                    },

                    showToolbar: {
                        enum: ['default', 'always'],
                        description:
                            'When to show the toolbar. By default only show on hovering the mouse on the component. Use the "always" option to show the toolbar in all cases.',
                    },

                    allowNesting: {
                        enum: ['no', 'yes', 'one-level'],
                        description: 'Allows nesting the component in containers, defaults to "yes"',
                    },
                    restrictChildren: {
                        type: 'object',
                        description:
                            'Restricts children of this component to the listed ones and can be further filtered down to also have content',
                        minProperties: 1,
                        additionalProperties: {
                            type: 'object',
                            properties: {
                                withContent: { type: 'string' },
                            },
                            additionalProperties: false,
                        },
                    },
                    countStatistics: {
                        type: 'boolean',
                        description: 'Count characters, words and paragraphs of this component',
                    },
                    defaultComponentOnEnter: {
                        $ref: '#/definitions/nonEmptyString',
                        description:
                            'Default component inserted on pressing enter in a text field (optional, overrides global value)',
                    },
                    directiveOptions: {
                        type: 'object',
                        description: 'Configuration for directives in this component',
                        minProperties: 1,
                        additionalProperties: {
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                                groups: componentGroupDefinition,
                                autofill: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: ['source'],
                                    properties: {
                                        source: {
                                            type: 'string',
                                            description: 'A key of source directive',
                                        },
                                        metadataField: {
                                            type: 'string',
                                            description:
                                                'Metadata property name. The field is case sensitive. Slashes should be used to separate levels',
                                        },
                                    },
                                },
                                stripStylingOnPaste: {
                                    type: 'boolean',
                                    description: 'Strip all styling when pasting into the directive',
                                },
                            },
                        },
                    },
                },
                required: ['name', 'label', 'icon'],
                additionalProperties: false,
            },
        },

        componentProperties: {
            type: 'array',
            description: 'List of available component properties',
            items: {
                type: 'object',
                required: ['name', 'label', 'control', 'dataType'],
                additionalProperties: false,
                properties: componentPropertyDefinition,
            },
        },

        groups: componentGroupDefinition,

        conversionRules: {
            type: 'object',
            description: 'Conversion rules for transforming one component into another component',
            additionalProperties: {
                type: 'object',
                additionalProperties: {
                    anyOf: [
                        {
                            enum: ['auto'],
                            description: 'Map one component into another component by auto matching fields',
                        },
                        {
                            type: 'object',
                            description: 'Map one component into another component by field mapping',
                            properties: {
                                type: { enum: ['simple'] },
                                map: {
                                    type: 'object',
                                    additionalProperties: { type: 'string' },
                                },
                            },
                            required: ['type', 'map'],
                        },
                        {
                            type: 'object',
                            properties: {
                                type: { enum: ['from-container'] },
                                container: { type: 'string' },
                            },
                            required: ['type', 'container'],
                        },
                        {
                            type: 'object',
                            properties: {
                                type: { enum: ['to-container'] },
                                container: { type: 'string' },
                            },
                            required: ['type', 'container'],
                        },
                    ],
                },
            },
        },
        shortcuts: {
            type: 'object',
            description: 'Shortcuts configurations',
            properties: {
                conversionComponents: {
                    type: 'array',
                    description: 'List of components for conversion using the shortcuts',
                    minItems: 1,
                    maxItems: 10,
                    items: {
                        $ref: '#/definitions/nonEmptyString',
                        description: "Component's name",
                    },
                },
            },
        },

        scripts: {
            type: 'array',
            description: 'List of scripts to be included for html rendition of article',
            items: {
                type: 'string',
            },
        },

        customStyles: {
            type: 'array',
            description:
                'List of custom styles definitions which can be configured in the look and feel style of an article',
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string', minLength: 1, maxLength: 20 },
                    key: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 20,
                        pattern: '^[a-zA-Z0-9-_]*$',
                    },
                    type: { enum: ['JSON'] },
                    default: { type: 'string' },
                },
                required: ['label', 'key', 'type'],
            },
        },

        characterStyles: {
            type: 'array',
            description: 'List of character style definitions which can be applied to text.',
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    id: { type: 'string', pattern: '^cs-[_a-zA-Z0-9-]+' },
                },
            },
        },
    },

    required: [
        'name',
        'version',
        'defaultComponentOnEnter',
        'components',
        'componentProperties',
        'groups',
        'conversionRules',
    ],
    additionalProperties: false,

    definitions: {
        nonEmptyString: {
            type: 'string',
            minLength: 1,
        },
    },
};
