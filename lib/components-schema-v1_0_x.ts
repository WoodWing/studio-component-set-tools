/**
 * Describes the JSON schema for the components definition file.
 *
 * See http://json-schema.org/ for documentation and examples.
 */

 /* tslint:disable:max-line-length variable-name */
export const componentsDefinitionSchema_v1_0_x = {
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
            pattern: '\\d+\.\\d+\.\\d+',
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
                    label: { type: 'string', description: 'Component label shown in Digital Editor' },
                    icon: { type: 'string', description: 'Icon shown for component in Digital Editor' },
                    properties: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'names of properties this component can use',
                    },

                    selectionMethod: {
                        enum: ['default', 'handle'],
                        description: 'How this component is selectable, by default the user can select inside the component to select it',
                    },
                    allowNesting: {
                        enum: ['no', 'yes', 'one-level'],
                        description: 'Allows nesting the component in containers, defaults to "yes"',
                    },
                    restrictChildren: {
                        type: 'object',
                        description: 'Restricts children of this component to the listed ones and can be further filtered down to also have content',
                        additionalProperties: {
                            type: 'object',
                            properties: {
                                withContent: { type: 'string' },
                            },
                            additionalProperties: false,
                        },
                    },
                    countStatistics: { type: 'boolean', description: 'Count characters, words and paragraphs of this component' },
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
                properties: {
                    name: {
                        type: 'string',
                        description: 'Unique identifier of component property',
                        minLength: 3,
                    },
                    label: { type: 'string', description: 'Display label of Component property' },
                    control: {
                        type: 'object',
                        description: 'Type of UI element and options.',
                        oneOf: [
                            {
                                additionalProperties: false,
                                required: ['type', 'options'],
                                properties: {
                                    type: {
                                        enum: ['select'],
                                        description: 'Dropdown with fixed number of options',
                                    },
                                    options: {
                                        type: 'array',
                                        minItems: 1,
                                        items: {
                                            type: 'object',
                                            properties: {
                                                caption: {
                                                    type: 'string',
                                                    description: 'Label of the item',
                                                },
                                                value: {
                                                    type: 'string',
                                                    description: 'Value of the item',
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
                                required: ['type', 'value'],
                                properties: {
                                    type: {
                                        enum: ['checkbox'],
                                        description: 'Checkbox toggling between value and no value',
                                    },
                                    value: { type: 'string' },
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
                                        description: 'Unit type',
                                    },
                                    inputPlaceholder: {
                                        type: 'string',
                                        description: 'Input placeholder',
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
                                    options: {
                                        type: 'object',
                                        additionalProperties: false,
                                        properties: {
                                            opacity: {
                                                type: 'boolean',
                                            },
                                        },
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
                        ],
                    },
                    dataProperty: { type: 'string' },
                    group: { type: 'string' },
                    selector: {
                        type: 'string',
                        description: 'Additional selector to define elements of the component which the property should be applied to',
                    },
                },
            },
        },

        groups: {
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
                    label: { type: 'string', description: 'Group label shown in Digital Editor' },
                    components: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'names of components in this group',
                    },
                },
                required: ['name', 'label', 'components'],
            },
        },

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
};
