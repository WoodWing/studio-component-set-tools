/**
 * Describes the JSON schema for the components definition file.
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

                    allowNesting: {
                        enum: ['no', 'yes', 'one-level'],
                        description: 'Allows nesting the component in containers. Defaults to "yes".',
                    },
                    restrictChildren: {
                        type: 'object',
                        description: 'Restricts children of this component to the listed ones. Can be further filtered down to also have content.',
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
                    name: { type: 'string' },
                    label: { type: 'string' },
                    control: {
                        type: 'object',
                        description: 'Type of UI element and options',
                        anyOf: [
                            {
                                properties: {
                                    type: {
                                        enum: ['select'],
                                        description: 'Dropdown with fixed number of options.'
                                    },
                                    options: {
                                        type: 'array',
                                        minItems: 1,
                                    },
                                }
                            },
                            {
                                properties: {
                                    type: {
                                        enum: ['checkbox'],
                                        description: 'Checkbox toggling between value and no value'
                                    },
                                    value: { type: 'string' },
                                }
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
                additionalProperties: false
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
        }
    },
    required: ['name', 'version'],
    additionalProperties: false,
};
