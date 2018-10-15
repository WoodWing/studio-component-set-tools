import * as path from 'path';
import { parseDefinition } from '../../lib/parser/parser-utils';
const cloneDeep = require('lodash/clonedeep');

describe('Parser utils', () => {
    describe('parseDefinition', () => {
        let componentsDefinition: any;
        let getFileContent: (filePath: string) => Promise<string>;
        beforeEach(() => {
            componentsDefinition = {
                'name': 'minimal-sample',
                'description': 'Minimal components package sample touching most of the available options.',
                'version': '1.0.0',
                'defaultComponentOnEnter': 'body',
                'components': [
                    {
                        'name': 'body',
                        'label': 'Body Label',
                        'icon': 'icons/component.svg',
                        'properties': [
                            'selectProperty'
                        ],
                        'countStatistics': true
                    },
                    {
                        'name': 'complex',
                        'label': { 'key': 'Complex Label KEY' },
                        'icon': 'icons/component.svg',
                        'properties': [
                            'checkboxProperty',
                            { name: 'dirProperty', directiveKey: 'image' },
                            { control: { type: 'header' }, label: 'Header Label' }
                        ]
                    }
                ],
                'groups': [
                    {
                        'label': 'Minimal',
                        'name': 'minimal',
                        'components': [
                            'body',
                            'complex'
                        ]
                    }
                ],
                'componentProperties': [
                    {
                        'name': 'selectProperty',
                        'label': 'Select property sample',
                        'control': {
                            'type': 'select',
                            'options': [
                                {
                                    'caption': 'Default'
                                },
                                {
                                    'caption': { 'key': 'Option 1 {{0}}', 'values': {'0': 'Replacement'}},
                                    'value': '_option1'
                                }
                            ]
                        },
                        'dataType': 'styles'
                    },
                    {
                        'name': 'checkboxProperty',
                        'label': 'Checkbox property sample',
                        'control': {
                            'type': 'checkbox',
                            'value': '_valueWhenOn'
                        },
                        'dataType': 'styles'
                    },
                    {
                        'name': 'dirProperty',
                        'label': 'Directive property sample',
                        'control': {
                            'type': 'image-editor',
                            'focuspoint': true
                        },
                        'dataType': 'doc-image'
                    }
                ],
                'conversionRules': {
                    'body': {
                        'complex': 'auto'
                    }
                }
            };
            getFileContent = (filePath: string) : Promise<string> => {
                const filename = path.basename(filePath);
                let result;
                switch (filename) {
                    case 'body.html':
                        result = `
                            <p doc-editable="text"></p>
                        `;
                        break;
                    case 'complex.html':
                        result = `
                            <div>
                                <p doc-editable="text"></p>
                                <figure doc-image="image"></figure>
                                <div>
                                    <img doc-image="second-image">
                                    <p doc-editable="caption"></p>
                                </div>
                            </div>
                        `;
                        break;
                    default:
                        throw new Error(`Unknown filename "${filename}", cannot be handled`);
                }
                return Promise.resolve(result);
            };
        });
        it('should parse components definition', async () => {
            const expectedComponentSet = {
                'name': 'minimal-sample',
                'description': 'Minimal components package sample touching most of the available options.',
                'version': '1.0.0',
                'components': {
                    'body': {
                        'name': 'body',
                        'label': 'Body Label',
                        'icon': 'icons/component.svg',
                        'countStatistics': true,
                        'directives': {
                            'text': {
                                'type': 'editable',
                                'tag': 'p'
                            }
                        },
                        'properties': [
                            {
                                'name': 'selectProperty',
                                'label': 'Select property sample',
                                'control': {
                                    'type': 'select',
                                    'options': [
                                        {
                                            'caption': 'Default'
                                        },
                                        {
                                            'caption': { 'key': 'Option 1 {{0}}', 'values': {'0': 'Replacement'}},
                                            'value': '_option1'
                                        }
                                    ]
                                },
                                'dataType': 'styles'
                            }
                        ],
                    },
                    'complex': {
                        'name': 'complex',
                        'label': {'key' :'Complex Label KEY'},
                        'icon': 'icons/component.svg',
                        'directives': {
                            'text': {
                                'type': 'editable',
                                'tag': 'p'
                            },
                            'image': {
                                'type': 'image',
                                'tag': 'figure'
                            },
                            'second-image': {
                                'type': 'image',
                                'tag': 'img'
                            },
                            'caption': {
                                'type': 'editable',
                                'tag': 'p'
                            }
                        },
                        'properties': [
                            {
                                'name': 'checkboxProperty',
                                'label': 'Checkbox property sample',
                                'control': {
                                    'type': 'checkbox',
                                    'value': '_valueWhenOn'
                                },
                                'dataType': 'styles',
                            },
                            {
                                'name': 'dirProperty',
                                'label': 'Directive property sample',
                                'control': {
                                    'type': 'image-editor',
                                    'focuspoint': true
                                },
                                'dataType': 'doc-image',
                                'directiveKey': 'image'
                            },
                            {
                                'control': {
                                    'type': 'header'
                                },
                                'label': 'Header Label'
                            }
                        ]
                    }
                },
                groups: [
                    {
                        'label': 'Minimal',
                        'name': 'minimal',
                        'components': [
                            'body',
                            'complex'
                        ]
                    },
                ],
                defaultComponentOnEnter: 'body',
                conversionRules: {
                    body: {
                        complex: 'auto'
                    }
                },
                scripts: [],
            };
            const componentSet = await parseDefinition(componentsDefinition, getFileContent);
            expect(componentSet).toEqual(expectedComponentSet);
        });

        it('should not modify the input components definition', async () => {
            const originalComponentsDefinition = cloneDeep(componentsDefinition);
            await parseDefinition(componentsDefinition, getFileContent);
            expect(componentsDefinition).toEqual(originalComponentsDefinition);
        });

        it('should throw an error if there are directives with the same attribute values', async () => {
            getFileContent = (filePath: string) : Promise<string> => {
                const filename = path.basename(filePath);
                let result;
                switch (filename) {
                    case 'body.html':
                        result = `
                            <p doc-editable="text"></p>
                        `;
                        break;
                    case 'complex.html':
                        result = `
                            <div>
                                <p doc-editable="text"></p>
                                <figure doc-image="image"></figure>
                                <div>
                                    <img doc-image="second-image">
                                    <p doc-editable="text"></p>
                                </div>
                            </div>
                        `;
                        break;
                    default:
                        throw new Error(`Unknown filename "${filename}", cannot be handled`);
                }
                return Promise.resolve(result);
            };

            let er = '';
            try {
                await parseDefinition(componentsDefinition, getFileContent);
            } catch(e) {
                er = e.message;
            }
            expect(er).toEqual(`Directive's attributes must be unique. Attribute value is "text"`);
        });

        it('should throw an error if there is a property which points to non existing directive', async () => {
            getFileContent = (filePath: string) : Promise<string> => {
                const filename = path.basename(filePath);
                let result;
                switch (filename) {
                    case 'body.html':
                        result = `
                            <p doc-editable="text"></p>
                        `;
                        break;
                    case 'complex.html':
                        result = `
                            <div>
                                <p doc-editable="text"></p>
                                <figure doc-image="image2"></figure>
                                <div>
                                    <img doc-image="second-image">
                                    <p doc-editable="text2"></p>
                                </div>
                            </div>
                        `;
                        break;
                    default:
                        throw new Error(`Unknown filename "${filename}", cannot be handled`);
                }
                return Promise.resolve(result);
            };

            let er = '';
            try {
                await parseDefinition(componentsDefinition, getFileContent);
            } catch(e) {
                er = e.message;
            }
            expect(er).toEqual(`Directive with key "image" is not found. Property name is "dirProperty"`);
        });

        it('should throw an error if there is a property which cannot be found', async () => {
            componentsDefinition.components[0].properties[0] = 'cucicaca';

            let er = '';
            try {
                await parseDefinition(componentsDefinition, getFileContent);
            } catch(e) {
                er = e.message;
            }
            expect(er).toEqual(`Property "cucicaca" is not found in definition componentProperties`);
        });

        it('should throw an error if there is a property which cannot be found for merging', async () => {
            (<any>componentsDefinition.components[1].properties[1]).name = 'cucicaca';

            let er = '';
            try {
                await parseDefinition(componentsDefinition, getFileContent);
            } catch(e) {
                er = e.message;
            }
            expect(er).toEqual(`Property "cucicaca" is not found in definition componentProperties`);
        });
    });
});