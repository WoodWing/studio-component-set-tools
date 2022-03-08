import * as fs from 'fs';
import * as path from 'path';
import { generateComponentSetInfo, processInfo } from '../../lib/definition/component-info';
import { processTemplates } from '../../lib/definition/process-templates';
import { ComponentsDefinition } from '../../lib/models';

describe('ComponentInfo', () => {
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

        it('should return the component set information data when using generateComponentSetInfo', async () => {
            expect(await generateComponentSetInfo(definition, renditionResolver)).toEqual({
                components: {
                    body: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                        properties: [
                            {
                                name: 'selectProperty',
                                dataType: 'styles',
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
                        properties: [
                            {
                                name: 'checkboxProperty',
                                dataType: 'styles',
                            },
                        ],
                    },
                },
            });
        });

        it('should return the component set information data when using processInfo', async () => {
            await processTemplatesFromZip();

            expect(await processInfo(definition)).toEqual({
                components: {
                    body: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                        properties: [
                            {
                                name: 'selectProperty',
                                dataType: 'styles',
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
                        properties: [
                            {
                                name: 'checkboxProperty',
                                dataType: 'styles',
                            },
                        ],
                    },
                },
            });
        });

        it('should return the component set info for empty templates', async () => {
            await processEmptyTemplates();

            expect(await processInfo(definition)).toEqual({
                components: {
                    body: {
                        fields: [],
                        properties: [
                            {
                                name: 'selectProperty',
                                dataType: 'styles',
                            },
                        ],
                    },
                    intro: {
                        fields: [],
                        properties: [
                            {
                                name: 'checkboxProperty',
                                dataType: 'styles',
                            },
                        ],
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
                        properties: [
                            {
                                name: 'edit-image',
                                dataType: 'doc-image',
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
                        properties: [
                            {
                                name: 'slides',
                                dataType: 'doc-slideshow',
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
                        properties: [
                            {
                                name: 'selectProperty',
                                dataType: 'styles',
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
                        properties: [
                            {
                                name: 'checkboxProperty',
                                dataType: 'styles',
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
                        properties: [],
                    },
                    container2: {
                        fields: [
                            {
                                contentKey: 'main',
                                restrictChildren: ['slideshow', 'image', 'body', 'intro', 'container'],
                                type: 'container',
                            },
                        ],
                        properties: [],
                    },
                },
            });
        });
    });
});
