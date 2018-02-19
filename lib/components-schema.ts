/**
 * Describes the JSON schema for the components definition file.
*/

export const componentsDefinitionSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', description: 'Name of the components package' },
        description: { type: 'string', description: 'Description of components package' },
        version: { type: 'string', description: 'Version of matching components model' },

        // Describes components
        components: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Component identifier. Must be unique' },
                    label: { type: 'string', description: 'Component label shown in Digital Editor' },
                    icon: { type: 'string', description: 'Icon shown for component in Digital Editor' },
                    properties: { type: 'array', items: { type: 'string' }, description: 'names of properties this component can use.' },
                    countStatistics: { type: 'boolean', description: 'Count characters, words and paragraphs of this component' },
                },
                additionalProperties: false
            }
        },

        // Properties available in component
        componentProperties: {
            type: 'array'
        },

        // Groups component chooser
        groups: {
            type: 'array'
        },

        // Conversion rules for transforming one component into another
        conversionRules: {
            type: 'object'
        }
    },
    additionalProperties: false,
};
