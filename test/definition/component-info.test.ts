import * as fs from 'fs';
import * as path from 'path';
import { processInfo } from '../../lib/definition/component-info';
import { processTemplates } from '../../lib/definition/process-templates';
import { ComponentsDefinition } from '../../lib/models';

describe('processInfo', () => {
    async function processTemplatesFromZip(componentPath: string, definition: ComponentsDefinition) {
        await processTemplates(async (relativePath: string) => {
            const file = path.join(componentPath, relativePath);
            try {
                return (await fs.promises.readFile(file)).toString();
            } catch (e) {
                return;
            }
        }, definition);
    }

    describe('minimal component set', () => {
        const componentPath = path.resolve('./test/resources/minimal-sample');
        let definition: ComponentsDefinition;
        beforeEach(async () => {
            definition = JSON.parse(
                (await fs.promises.readFile(path.join(componentPath, 'components-definition.json'))).toString(),
            );
        });

        async function processEmptyTemplates() {
            await processTemplates(async (_relativePath: string) => {
                return '<div></div>';
            }, definition);
        }

        it('should return the component set information data', async () => {
            await processTemplatesFromZip(componentPath, definition);

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

    describe('restrict children sample component set', () => {
        const componentPath = path.resolve('./test/resources/restrict-children-sample');
        let definition: ComponentsDefinition;
        beforeEach(async () => {
            definition = JSON.parse(
                (await fs.promises.readFile(path.join(componentPath, 'components-definition.json'))).toString(),
            );
        });

        it('should return the component set information data', async () => {
            await processTemplatesFromZip(componentPath, definition);

            expect(processInfo(definition)).toEqual({
                components: {
                    image: {
                        fields: [
                            {
                                contentKey: 'image',
                                type: 'image',
                            },
                            {
                                contentKey: 'hyperlink',
                                type: 'link',
                            },
                            {
                                contentKey: 'caption',
                                type: 'editable',
                            },
                        ],
                    },
                    slideshow: {
                        fields: [
                            {
                                contentKey: 'slideshow',
                                type: 'slideshow',
                            },
                        ],
                    },
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
                    container: {
                        fields: [
                            {
                                contentKey: 'main',
                                restrictChildren: ['body', 'intro'],
                                type: 'container',
                            },
                        ],
                    },
                    container2: {
                        fields: [
                            {
                                contentKey: 'main',
                                restrictChildren: ['slideshow', 'image', 'body', 'intro', 'container'],
                                type: 'container',
                            },
                        ],
                    },
                },
            });
        });
    });
});
