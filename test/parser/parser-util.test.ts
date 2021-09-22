import * as path from 'path';
import { parseDefinition } from '../../lib/parser/parser-utils';
import { ComponentRendition, ComponentsDefinition, DirectiveType } from '../../lib/models';
import { loadHtmlRenditions } from '../../lib/renditions';
import { deepFreeze } from '../../lib/util/freeze';

describe('Parser utils', () => {
    describe('parseDefinition', () => {
        let getFileContent: (filePath: string) => Promise<string>;
        let html: { [s: string]: string };

        function createComponentsDefinition(init?: (componentsDefinition: any) => void): ComponentsDefinition {
            const definition = {
                name: 'minimal-sample',
                description: 'Minimal components package sample touching most of the available options.',
                version: '1.0.0',
                defaultComponentOnEnter: 'body',
                components: [
                    {
                        name: 'body',
                        label: 'Body Label',
                        icon: 'icons/component.svg',
                        properties: [
                            { name: 'selectProperty', defaultValue: '_option1' },
                            { name: 'letter-spacing', defaultValue: '2' },
                            {
                                name: 'drop-capital',
                                defaultValue: { numberOfCharacters: 1, numberOfLines: 3, padding: 5 },
                            },
                        ],
                        countStatistics: true,
                    },
                    {
                        name: 'complex',
                        label: { key: 'Complex Label KEY' },
                        icon: 'icons/component.svg',
                        properties: [
                            'checkboxProperty',
                            { name: 'dirProperty', directiveKey: 'image' },
                            { control: { type: 'header' }, label: 'Header Label' },
                        ],
                    },
                ],
                groups: [
                    {
                        label: 'Minimal',
                        name: 'minimal',
                        components: ['body', 'complex'],
                    },
                ],
                componentProperties: [
                    {
                        name: 'selectProperty',
                        label: 'Select property sample',
                        control: {
                            type: 'select',
                            options: [
                                {
                                    caption: 'Default',
                                },
                                {
                                    caption: { key: 'Option 1 {{0}}', values: { 0: 'Replacement' } },
                                    value: '_option1',
                                },
                            ],
                        },
                        dataType: 'styles',
                    },
                    {
                        name: 'checkboxProperty',
                        label: 'Checkbox property sample',
                        control: {
                            type: 'checkbox',
                            value: '_valueWhenOn',
                        },
                        dataType: 'styles',
                    },
                    {
                        name: 'dirProperty',
                        label: 'Directive property sample',
                        control: {
                            type: 'image-editor',
                            focuspoint: true,
                        },
                        dataType: 'doc-image',
                    },
                    {
                        name: 'letter-spacing',
                        label: 'Character spacing',
                        control: {
                            type: 'text',
                            pattern:
                                '^(([+-]{0,1})([0-9]|[0-9][.][0-9]{1,}|[0-9]{2}|[0-9]{2}[.][0-9]{1,}|[1-4][0-9]{0,2}|[1-4][0-9]{0,2}[.][0-9]{1,}|(500))|auto)$',
                            defaultValue: '',
                            unit: 'em',
                            inputPlaceholder: 'Type ‘auto’ or any number…',
                        },
                        selector: '[doc-editable]',
                        dataType: 'inlineStyles',
                    },
                    {
                        name: 'drop-capital',
                        label: 'Drop cap',
                        control: {
                            type: 'drop-capital',
                            charactersMinimum: 1,
                            charactersDefault: 1,
                            charactersMaximum: 10,
                            linesMinimum: 1,
                            linesDefault: 3,
                            linesMaximum: 10,
                        },
                        dataType: 'data',
                        featureFlag: 'ContentStation-LocalStyleOverrides',
                    },
                ],
                conversionRules: {
                    body: {
                        complex: 'auto',
                    },
                },
                shortcuts: { conversionComponents: ['shortcuts'] },
            };
            if (init) {
                init(definition);
            }
            return deepFreeze(definition as ComponentsDefinition);
        }
        beforeEach(() => {
            html = {
                body: `<p doc-editable="text"></p>`,
                complex:
                    `<div>` +
                    `<p doc-editable="text"></p>` +
                    `<figure doc-image="image"></figure>` +
                    `<div>` +
                    `<img doc-image="second-image">` +
                    `<p doc-editable="caption"></p>` +
                    `</div>` +
                    `</div>`,
            };
            getFileContent = (filePath: string): Promise<string> => {
                const filename = path.basename(filePath).split('.').shift();
                if (!filename || !(filename in html)) {
                    throw new Error(`Unknown filename "${filename}", cannot be handled`);
                }
                return Promise.resolve(html[filename]);
            };
        });

        describe('parsing', () => {
            let expectedComponentSet: any;
            beforeEach(() => {
                expectedComponentSet = {
                    name: 'minimal-sample',
                    description: 'Minimal components package sample touching most of the available options.',
                    version: '1.0.0',
                    components: {
                        body: {
                            name: 'body',
                            label: 'Body Label',
                            icon: 'icons/component.svg',
                            countStatistics: true,
                            directives: {
                                text: {
                                    type: DirectiveType.editable,
                                    tag: 'p',
                                },
                            },
                            properties: [
                                {
                                    name: 'selectProperty',
                                    label: 'Select property sample',
                                    control: {
                                        type: 'select',
                                        options: [
                                            {
                                                caption: 'Default',
                                            },
                                            {
                                                caption: { key: 'Option 1 {{0}}', values: { '0': 'Replacement' } },
                                                value: '_option1',
                                            },
                                        ],
                                    },
                                    dataType: 'styles',
                                    defaultValue: '_option1',
                                },
                                {
                                    name: 'letter-spacing',
                                    label: 'Character spacing',
                                    control: {
                                        type: 'text',
                                        pattern:
                                            '^(([+-]{0,1})([0-9]|[0-9][.][0-9]{1,}|[0-9]{2}|[0-9]{2}[.][0-9]{1,}|[1-4][0-9]{0,2}|[1-4][0-9]{0,2}[.][0-9]{1,}|(500))|auto)$',
                                        defaultValue: '',
                                        unit: 'em',
                                        inputPlaceholder: 'Type ‘auto’ or any number…',
                                    },
                                    selector: '[doc-editable]',
                                    dataType: 'inlineStyles',
                                    defaultValue: '2',
                                },
                                {
                                    name: 'drop-capital',
                                    label: 'Drop cap',
                                    control: {
                                        type: 'drop-capital',
                                        charactersMinimum: 1,
                                        charactersDefault: 1,
                                        charactersMaximum: 10,
                                        linesMinimum: 1,
                                        linesDefault: 3,
                                        linesMaximum: 10,
                                    },
                                    dataType: 'data',
                                    featureFlag: 'ContentStation-LocalStyleOverrides',
                                    defaultValue: { numberOfCharacters: 1, numberOfLines: 3, padding: 5 },
                                },
                            ],
                            renditions: {
                                html: html.body,
                            },
                            noCreatePermission: false,
                        },
                        complex: {
                            name: 'complex',
                            label: { key: 'Complex Label KEY' },
                            icon: 'icons/component.svg',
                            directives: {
                                text: {
                                    type: DirectiveType.editable,
                                    tag: 'p',
                                },
                                image: {
                                    type: DirectiveType.image,
                                    tag: 'figure',
                                },
                                'second-image': {
                                    type: DirectiveType.image,
                                    tag: 'img',
                                },
                                caption: {
                                    type: DirectiveType.editable,
                                    tag: 'p',
                                },
                            },
                            properties: [
                                {
                                    name: 'checkboxProperty',
                                    label: 'Checkbox property sample',
                                    control: {
                                        type: 'checkbox',
                                        value: '_valueWhenOn',
                                    },
                                    dataType: 'styles',
                                },
                                {
                                    name: 'dirProperty',
                                    label: 'Directive property sample',
                                    control: {
                                        type: 'image-editor',
                                        focuspoint: true,
                                    },
                                    dataType: 'doc-image',
                                    directiveKey: 'image',
                                },
                                {
                                    control: {
                                        type: 'header',
                                    },
                                    label: 'Header Label',
                                },
                            ],
                            renditions: {
                                html: html.complex,
                            },
                            noCreatePermission: false,
                        },
                    },
                    groups: [
                        {
                            label: 'Minimal',
                            name: 'minimal',
                            components: ['body', 'complex'],
                        },
                    ],
                    defaultComponentOnEnter: 'body',
                    defaultComponentContent: {
                        body: {
                            styles: {
                                selectProperty: '_option1',
                            },
                            inlineStyles: {
                                'letter-spacing': '2',
                            },
                            data: {
                                'drop-capital': { numberOfCharacters: 1, numberOfLines: 3, padding: 5 },
                            },
                        },
                    },
                    conversionRules: {
                        body: {
                            complex: 'auto',
                        },
                    },
                    scripts: [],
                    customStyles: [],
                    shortcuts: { conversionComponents: ['shortcuts'] },
                };
            });
            it('should be fine when components definition without renditions', async () => {
                const componentSet = await parseDefinition(
                    await loadHtmlRenditions(createComponentsDefinition(), getFileContent),
                );
                expect(componentSet).toEqual(expectedComponentSet);
            });
            it('should be fine when components definition with renditions', async () => {
                const componentsDefinition = createComponentsDefinition((definition) => {
                    definition.components[0].renditions = {
                        [ComponentRendition.HTML]: html.body,
                    };
                    definition.components[1].renditions = {
                        [ComponentRendition.HTML]: html.complex,
                    };
                });
                const componentSet = await parseDefinition(componentsDefinition);
                expect(componentSet).toEqual(expectedComponentSet);
            });
            it('should throw an error when components definition without renditions and getFileContent is not passed', async () => {
                let er = '';
                try {
                    await parseDefinition(createComponentsDefinition());
                } catch (e) {
                    er = e.message;
                }
                expect(er).toEqual(`Component "body" doesn't have "html" rendition`);
            });
        });

        it('should throw an error if there are directives with the same attribute values', async () => {
            html.complex = `
                <div>
                    <p doc-editable="text"></p>
                    <figure doc-image="image"></figure>
                    <div>
                        <img doc-image="second-image">
                        <p doc-editable="text"></p>
                    </div>
                </div>
            `;

            let er = '';
            try {
                await parseDefinition(await loadHtmlRenditions(createComponentsDefinition(), getFileContent));
            } catch (e) {
                er = e.message;
            }
            expect(er).toEqual(`Directive's attributes must be unique. Attribute value is "text"`);
        });

        it('should throw an error if there is a property which points to non existing directive', async () => {
            html.complex = `
                <div>
                    <p doc-editable="text"></p>
                    <figure doc-image="image2"></figure>
                    <div>
                        <img doc-image="second-image">
                        <p doc-editable="text2"></p>
                    </div>
                </div>
            `;

            let er = '';
            try {
                await parseDefinition(await loadHtmlRenditions(createComponentsDefinition(), getFileContent));
            } catch (e) {
                er = e.message;
            }
            expect(er).toEqual(
                `Directive with key "image" is not found in component "complex". Property name is "dirProperty".`,
            );
        });

        it('should throw an error if there is a property which cannot be found', async () => {
            let er = '';
            try {
                await parseDefinition(
                    await loadHtmlRenditions(
                        createComponentsDefinition((definition) => {
                            definition.components[0].properties[0] = 'cucicaca';
                        }),
                        getFileContent,
                    ),
                );
            } catch (e) {
                er = e.message;
            }
            expect(er).toEqual(`Property "cucicaca" is not found in definition componentProperties`);
        });

        it('should throw an error if there is a property which cannot be found for merging', async () => {
            let er = '';
            try {
                await parseDefinition(
                    await loadHtmlRenditions(
                        createComponentsDefinition((definition) => {
                            definition.components[1].properties[1].name = 'cucicaca';
                        }),
                        getFileContent,
                    ),
                );
            } catch (e) {
                er = e.message;
            }
            expect(er).toEqual(`Property "cucicaca" is not found in definition componentProperties`);
        });
    });
});
