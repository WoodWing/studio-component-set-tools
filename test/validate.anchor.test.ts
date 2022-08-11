import { createValidator } from './test-utils';

describe('validate anchor', () => {
    it('should pass on minimal sample with anchor property', async () => {
        const { validateFolderWithCustomiser } = createValidator((filePath: string, content: string) => {
            if (filePath === 'components-definition.json') {
                const componentsDefinition = JSON.parse(content);
                componentsDefinition.components[0].properties.push('anchor');
                componentsDefinition.componentProperties.push({
                    name: 'anchor',
                    label: 'Anchor',
                    control: {
                        type: 'anchor',
                    },
                    dataType: 'data',
                });
                return JSON.stringify(componentsDefinition);
            }
            return content;
        });

        expect(await validateFolderWithCustomiser('./test/resources/minimal-sample-next')).toBe(true);
    });

    it('should not pass on minimal sample with anchor property and data type other than "data"', async () => {
        const { validateFolderWithCustomiser } = createValidator((filePath: string, content: string) => {
            if (filePath === 'components-definition.json') {
                const componentsDefinition = JSON.parse(content);
                componentsDefinition.components[0].properties.push('anchor');
                componentsDefinition.componentProperties.push({
                    name: 'anchor',
                    label: 'Anchor',
                    control: {
                        type: 'anchor',
                    },
                    dataType: 'styles',
                });
                return JSON.stringify(componentsDefinition);
            }
            return content;
        });

        expect(await validateFolderWithCustomiser('./test/resources/minimal-sample-next')).toBe(false);
    });
});
