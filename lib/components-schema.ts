/**
 * Describes the JSON schema for the components definition file.
 *
 * See http://json-schema.org/ for documentation and examples.
 */

export const componentsDefinitionSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', description: 'Name of the components package' },
        description: { type: 'string', description: 'Description of components package' },
        version: { type: 'string', description: 'Version of matching components model' },

        components: {
            type: 'array',
            description: 'List of available components',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Unique component identifier' },
                    label: { type: 'string', description: 'Component label shown in Digital Editor' },
                    icon: { type: 'string', description: 'Icon shown for component in Digital Editor' },
                    properties: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'names of properties this component can use'
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
                    },
                    countStatistics: { type: 'boolean', description: 'Count characters, words and paragraphs of this component' },
                },
                required: ['name', 'label', 'icon'],
                additionalProperties: false
            }
        },

        componentProperties: {
            type: 'array',
            description: 'List of available component properties',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Unique identifier of component property' },
                    label: { type: 'string', description: 'Display label of Component property' },
                    control: {
                        type: 'object',
                        description: 'Type of UI element and options.',
                        anyOf: [
                            {
                                properties: {
                                    type: {
                                        enum: ['select'],
                                        description: 'Dropdown with fixed number of options'
                                    },
                                    options: {
                                        type: 'array',
                                        minItems: 1,
                                    },
                                },
                                additionalProperties: false,
                            },
                            {
                                properties: {
                                    type: {
                                        enum: ['checkbox'],
                                        description: 'Checkbox toggling between value and no value'
                                    },
                                    value: { type: 'string' },
                                },
                                additionalProperties: false,
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
                        ]
                    },
                    dataProperty: { type: 'string' },
                },

                required: ['name', 'label', 'control', 'dataType'],
                additionalProperties: false,
            },
        },

        groups: {
            type: 'array',
            description: 'List of groups shown in component chooser dialog',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Unique group identifier' },
                    label: { type: 'string', description: 'Group label shown in Digital Editor' },
                    components: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'names of components in this group'
                    },
                },
                required: ['name', 'label', 'components'],
            }
        },

        conversionRules: {
            type: 'object',
            description: 'Conversion rules for transforming one component into another component',
            additionalProperties: {
                type: 'object',
                anyOf: [
                    {
                        type: 'object',
                        description: 'Map one component into another component by matching fields',
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
        }
    },
    required: ['name', 'version', 'components', 'componentProperties', 'groups', 'conversionRules'],
    additionalProperties: false,
};
