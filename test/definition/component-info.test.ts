import * as fs from 'fs';
import * as path from 'path';
import { generateComponentSetInfo, processInfo } from '../../lib/definition/component-info';
import { processTemplates } from '../../lib/definition/process-templates';
import { ComponentsDefinition } from '../../lib/models';

describe('processInfo', () => {
    describe('minimal component set', () => {
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

    describe('restrict children sample component set', () => {
        const componentPath = path.resolve('./test/resources/restrict-children-sample');
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

        it('should return the component set information data', async () => {
            expect(await generateComponentSetInfo(definition, renditionResolver)).toEqual({
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
