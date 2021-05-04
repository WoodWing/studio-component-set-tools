import * as path from 'path';
import { parseDefinition } from '../../lib/parser';
import { DirectiveType } from '../../lib/models';
import cloneDeep = require('lodash.clonedeep');

describe('Parser utils child properties', () => {
    let componentsDefinition: any;
    let getFileContent: (filePath: string) => Promise<string>;
    let html: { [s: string]: string };
    let expectedComponentSet: any;

    beforeEach(() => {
        componentsDefinition = {
            name: 'child properties',
            description: 'Description',
            version: '1.0.0',
            defaultComponentOnEnter: 'body',
            components: [
                {
                    name: 'body',
                    label: 'Body Label',
                    icon: 'icons/component.svg',
                    properties: ['conditionalProperty'],
                    countStatistics: true,
                },
            ],
            groups: [
                {
                    label: 'Minimal',
                    name: 'minimal',
                    components: ['body'],
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
                                caption: 'Option 1',
                                value: '_option1',
                            },
                        ],
                    },
                    dataType: 'data',
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
                    name: 'conditionalProperty',
                    label: 'Conditional property sample',
                    control: {
                        type: 'select',
                        options: [
                            {
                                caption: 'No value',
                            },
                            {
                                caption: 'Value 1',
                                value: 'value1',
                            },
                            {
                                caption: 'Value 2',
                                value: 'value2',
                            },
                            {
                                caption: 'Value 3',
                                value: 'value3',
                            },
                        ],
                    },
                    defaultValue: 'value1',
                    dataType: 'data',
                    childProperties: [
                        {
                            matchType: 'exact-value',
                            properties: ['selectProperty'],
                        },
                        {
                            matchType: 'exact-value',
                            matchExpression: 'value1',
                            properties: ['checkboxProperty'],
                        },
                        {
                            matchType: 'exact-value',
                            matchExpression: 'value2',
                            properties: ['selectProperty', 'checkboxProperty'],
                        },
                    ],
                },
            ],
            conversionRules: {},
            shortcuts: {},
        };
        html = {
            body: `<p doc-editable="text"></p>`,
        };
        getFileContent = (filePath: string): Promise<string> => {
            const filename = path.basename(filePath).split('.').shift();
            if (!filename || !(filename in html)) {
                throw new Error(`Unknown filename "${filename}", cannot be handled`);
            }
            return Promise.resolve(html[filename]);
        };
        expectedComponentSet = {
            name: 'child properties',
            description: 'Description',
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
                            name: 'conditionalProperty',
                            label: 'Conditional property sample',
                            control: {
                                type: 'select',
                                options: [
                                    {
                                        caption: 'No value',
                                    },
                                    {
                                        caption: 'Value 1',
                                        value: 'value1',
                                    },
                                    {
                                        caption: 'Value 2',
                                        value: 'value2',
                                    },
                                    {
                                        caption: 'Value 3',
                                        value: 'value3',
                                    },
                                ],
                            },
                            defaultValue: 'value1',
                            dataType: 'data',
                            childProperties: [
                                {
                                    matchType: 'exact-value',
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
                                                        caption: 'Option 1',
                                                        value: '_option1',
                                                    },
                                                ],
                                            },
                                            dataType: 'data',
                                        },
                                    ],
                                },
                                {
                                    matchType: 'exact-value',
                                    matchExpression: 'value1',
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
                                    ],
                                },
                                {
                                    matchType: 'exact-value',
                                    matchExpression: 'value2',
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
                                                        caption: 'Option 1',
                                                        value: '_option1',
                                                    },
                                                ],
                                            },
                                            dataType: 'data',
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
                                    ],
                                },
                            ],
                        },
                    ],
                    renditions: {
                        html: html.body,
                    },
                    noCreatePermission: false,
                },
            },
            groups: [
                {
                    label: 'Minimal',
                    name: 'minimal',
                    components: ['body'],
                },
            ],
            defaultComponentOnEnter: 'body',
            defaultComponentContent: {
                body: { data: { conditionalProperty: 'value1' } },
            },
            conversionRules: {},
            scripts: [],
            shortcuts: {},
        };
    });

    it('should parse the components definition', async () => {
        const componentSet = await parseDefinition(componentsDefinition, getFileContent);
        // console.warn(JSON.stringify(componentSet, null, 4));
        expect(componentSet).toEqual(expectedComponentSet);
    });
});
