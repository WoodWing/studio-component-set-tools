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

        it('should return the component set info for empty templates', async () => {
            await processTemplates(async (_relativePath: string) => {
                return '<div></div>';
            }, definition);

            expect(await processInfo(definition)).toEqual({
                components: {
                    body: {
                        fields: [],
                        properties: {
                            selectProperty: {
                                dataType: 'styles',
                            },
                        },
                    },
                    intro: {
                        fields: [],
                        properties: {
                            checkboxProperty: {
                                dataType: 'styles',
                            },
                        },
                    },
                },
            });
        });
    });

    describe('minimal component set next', () => {
        const componentPath = path.resolve('./test/resources/minimal-sample-next');
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

        function getExpectedComponentInfo() {
            return {
                components: {
                    body: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                        properties: {
                            checkboxProperty: {
                                dataType: 'styles',
                            },
                            childSelectProperty: {
                                dataType: 'styles',
                            },
                            conditionalProperty: {
                                dataType: 'data',
                            },
                            selectProperty: {
                                dataType: 'styles',
                            },
                            sliderProperty: {
                                dataType: 'data',
                            },
                        },
                    },
                    intro: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                        properties: {
                            checkboxProperty: {
                                dataType: 'styles',
                            },
                        },
                    },
                    container: {
                        fields: [
                            {
                                contentKey: 'container',
                                type: 'container',
                                restrictChildren: ['body', 'intro'],
                            },
                        ],
                        properties: {
                            'background-image': {
                                dataType: 'studio-object',
                            },
                        },
                    },
                },
            };
        }

        it('should return the component set information data when using generateComponentSetInfo', async () => {
            expect(await generateComponentSetInfo(definition, renditionResolver)).toEqual(getExpectedComponentInfo());
        });

        it('should return the component set information data when using processInfo', async () => {
            await processTemplatesFromZip();
            expect(await processInfo(definition)).toEqual(getExpectedComponentInfo());
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
                        properties: {
                            'edit-image': {
                                dataType: 'doc-image',
                            },
                        },
                    },
                    slideshow: {
                        fields: [
                            {
                                contentKey: 'slideshow',
                                type: 'slideshow',
                            },
                        ],
                        properties: {
                            slides: {
                                dataType: 'doc-slideshow',
                            },
                        },
                    },
                    body: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                        properties: {
                            selectProperty: {
                                dataType: 'styles',
                            },
                        },
                    },
                    intro: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                        properties: {
                            checkboxProperty: {
                                dataType: 'styles',
                            },
                        },
                    },
                    container: {
                        fields: [
                            {
                                contentKey: 'main',
                                restrictChildren: ['body', 'intro'],
                                type: 'container',
                            },
                        ],
                        properties: {},
                    },
                    container2: {
                        fields: [
                            {
                                contentKey: 'main',
                                restrictChildren: ['slideshow', 'image', 'body', 'intro', 'container'],
                                type: 'container',
                            },
                        ],
                        properties: {},
                    },
                },
            });
        });
    });
});
