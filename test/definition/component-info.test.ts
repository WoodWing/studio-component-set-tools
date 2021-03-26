import * as fs from 'fs';
import * as path from 'path';
import { generateComponentSetInfo, processInfo } from '../../lib/definition/component-info';
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

    const renditionResolver = async (relativePath: string) => {
        const file = path.join(componentPath, relativePath);
        try {
            return (await fs.promises.readFile(file)).toString();
        } catch (e) {
            return;
        }
    };

    async function processTemplatesFromZip() {
        await processTemplates(renditionResolver, definition);
    }

    async function processEmptyTemplates() {
        await processTemplates(async (_relativePath: string) => {
            return '<div></div>';
        }, definition);
    }

    describe('generateComponentSetInfo', () => {
        it('should return the component set information data', async () => {
            expect(await generateComponentSetInfo(definition, renditionResolver)).toEqual({
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
    });

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
