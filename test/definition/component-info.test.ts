import * as fs from 'fs';
import * as path from 'path';
import { processInfo } from '../../lib/definition/component-info';
import { processTemplates } from '../../lib/definition/process-templates';
import { ComponentsDefinition } from '../../lib/models';

describe('Component Info', () => {
    const componentPath = path.resolve('./test/resources/minimal-sample');
    let definition: ComponentsDefinition;
    beforeEach(async () => {
        definition = JSON.parse(
            (await fs.promises.readFile(path.join(componentPath, 'components-definition.json'))).toString(),
        );
    });

    async function processTemplatesFromZip() {
        await processTemplates(async (relativePath: string) => {
            const file = path.join(componentPath, relativePath);
            try {
                return (await fs.promises.readFile(file)).toString();
            } catch (e) {
                return;
            }
        }, definition);
    }

    async function processEmptyTemplates() {
        await processTemplates(async (_relativePath: string) => {
            return '<div></div>';
        }, definition);
    }

    describe('processInfo', () => {
        it('should return the component set information data', async () => {
            await processTemplatesFromZip();

            expect(processInfo(definition)).toEqual({
                components: {
                    body: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                    },
                    intro: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                    },
                },
            });
        });

        it('should return the component set info for empty templates', async () => {
            await processEmptyTemplates();

            expect(processInfo(definition)).toEqual({
                components: {
                    body: {
                        fields: [],
                    },
                    intro: {
                        fields: [],
                    },
                },
            });
        });
    });
});
