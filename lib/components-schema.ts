/**
 * Describes the JSON schema for the components definition file.
*/

export const componentsDefinitionSchema = {
    type: "object",
    properties: {
        // Describes components
        components: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    label: { type: "string" },
                },
                additionalProperties: false
            }
        },

        // Properties available in component
        componentProperties: {
            type: "array"
        },

        // Groups component chooser
        groups: {
            type: "array"
        },

        // Conversion rules for transforming one component into another
        conversionRules: {
            type: "object"
        }
    },
    additionalProperties: false,
};
