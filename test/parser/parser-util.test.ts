import * as path from 'path';
import { parseDefinition } from '../../lib/parser/parser-utils';
import { ComponentsDefinition } from '../../lib/models';

describe('Parser utils', () => {
    describe('parseDefinition', () => {
        let componentsDefinition: ComponentsDefinition;
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
                        'label': 'Complex Label',
                        'icon': 'icons/component.svg',
                        'properties': [
                            'checkboxProperty', 'dirProperty:image'
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
                                    'caption': 'Option 1',
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
        });
        it('should parse components definition', async () => {
            const expectedParsedComponentsDefinition = {
                'components': {
                    'body': {
                        'component': {
                            'name': 'body',
                            'label': 'Body Label',
                            'icon': 'icons/component.svg',
                            'properties': [
                                'selectProperty'
                            ],
                            'countStatistics': true
                        },
                        'directives': {
                            'text': {
                                'type': 'editable',
                                'tag': 'p'
                            }
                        },
                        'properties': {
                            'selectProperty': {
                                'property': {
                                    'name': 'selectProperty',
                                    'label': 'Select property sample',
                                    'control': {
                                        'type': 'select',
                                        'options': [
                                            {
                                                'caption': 'Default'
                                            },
                                            {
                                                'caption': 'Option 1',
                                                'value': '_option1'
                                            }
                                        ]
                                    },
                                    'dataType': 'styles'
                                },
                                'directiveKey': null
                            }
                        }
                    },
                    'complex': {
                        'component': {
                            'name': 'complex',
                            'label': 'Complex Label',
                            'icon': 'icons/component.svg',
                            'properties': [
                                'checkboxProperty',
                                'dirProperty:image'
                            ]
                        },
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
                        'properties': {
                            'checkboxProperty': {
                                'property': {
                                    'name': 'checkboxProperty',
                                    'label': 'Checkbox property sample',
                                    'control': {
                                        'type': 'checkbox',
                                        'value': '_valueWhenOn'
                                    },
                                    'dataType': 'styles'
                                },
                                'directiveKey': null
                            },
                            'dirProperty:image': {
                                'property': {
                                    'name': 'dirProperty',
                                    'label': 'Directive property sample',
                                    'control': {
                                        'type': 'image-editor',
                                        'focuspoint': true
                                    },
                                    'dataType': 'doc-image'
                                },
                                'directiveKey': 'image'
                            }
                        }
                    }
                }
            };
            const getFileContent = (filePath: string) : Promise<string> => {
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
            const parsedDefinition = await parseDefinition(componentsDefinition, getFileContent);
            expect(parsedDefinition).toEqual(expectedParsedComponentsDefinition);
        });

        it('should throw an error if there are directives with the same attribute values', async () => {
            const getFileContent = (filePath: string) : Promise<string> => {
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
                await parseDefinition(componentsDefinition, getFileContent)
            } catch(e) {
                er = e.message;
            }
            expect(er).toEqual(`Directive's attributes must be unique. Attribute value is "text"`);
        });
    });
});